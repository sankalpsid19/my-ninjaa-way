import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  calculateNutrientTotals,
  computeNutritionScore,
  buildNutrientStatuses,
  DEFAULT_TARGETS,
  MealData,
  UserTargets,
} from "@/lib/nutrition/engine";

// GET: Fetch nutrition history for the past N days with computed stats & trends
// Response shape:
// {
//   daysTracked, avgScore, avgCalories, avgProtein, totalMealsLogged,
//   bestDay, bestScore, nutrientTrends[], dailyScores[{date, score, calories, protein, carbs,
//     fat, fiber, mealsLogged, micronutrientScore, nutrients[{id, name, percentage}]}]
// }
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const days = Math.min(parseInt(searchParams.get("days") || "7", 10) || 7, 90);

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  try {
    // Get user targets
    let targets: UserTargets = DEFAULT_TARGETS;
    const profile = await prisma.userNutritionProfile.findUnique({ where: { userId } });
    if (profile) {
      targets = {
        ...DEFAULT_TARGETS,
        calories: profile.targetCalories,
        protein: profile.targetProtein,
        carbs: profile.targetCarbs,
        fat: profile.targetFat,
        fiber: profile.targetFiber,
      };
    }

    const today = new Date();
    const dailyScores: {
      date: string;
      score: number;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
      mealsLogged: number;
      micronutrientScore: number;
      nutrients: { id: string; name: string; percentage: number }[];
    }[] = [];

    let totalMealsLogged = 0;

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];

      const dbMeals = await prisma.meal.findMany({
        where: { userId, date: dateStr },
        include: {
          items: { include: { food: true } },
        },
      });

      const meals: MealData[] = dbMeals.map((m) => ({
        id: m.id,
        date: m.date,
        mealType: m.mealType,
        items: m.items.map((item) => ({
          id: item.id,
          foodId: item.foodId,
          food: item.food,
          quantity: item.quantity,
          unit: item.unit,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
          fiber: item.fiber,
        })),
      }));

      const { totals } = calculateNutrientTotals(meals);
      const statuses = buildNutrientStatuses(totals, targets);
      const { score } = computeNutritionScore(totals, targets);
      const mealsLogged = dbMeals.length;
      totalMealsLogged += mealsLogged;

      // Micronutrient score = average % coverage of micro-only nutrients
      const microIds = ["vitaminC", "vitaminD", "calcium", "iron", "potassium", "magnesium", "zinc", "vitaminA", "vitaminB12", "folate"];
      const microScores = statuses
        .filter((s) => microIds.includes(s.id as string))
        .map((s) => Math.min(s.percentage, 100));
      const micronutrientScore = microScores.length > 0
        ? Math.round(microScores.reduce((a, b) => a + b, 0) / microScores.length)
        : 0;

      dailyScores.push({
        date: dateStr,
        score,
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein),
        carbs: Math.round(totals.carbs),
        fat: Math.round(totals.fat),
        fiber: Math.round(totals.fiber),
        mealsLogged,
        micronutrientScore,
        nutrients: statuses.map((s) => ({
          id: s.id,
          name: s.name,
          percentage: Math.round(s.percentage),
        })),
      });
    }

    // ---- Summary stats ----
    const populated = dailyScores.filter((d) => d.mealsLogged > 0 || d.calories > 0);
    const base = populated.length > 0 ? populated : dailyScores;

    const avgScore = base.reduce((a, b) => a + b.score, 0) / base.length;
    const avgCalories = base.reduce((a, b) => a + b.calories, 0) / base.length;
    const avgProtein = base.reduce((a, b) => a + b.protein, 0) / base.length;

    let bestDay = "";
    let bestScore = 0;
    for (const d of populated) {
      if (d.score > bestScore) {
        bestScore = d.score;
        bestDay = d.date;
      }
    }

    // Nutrient trends: compare last half vs first half of the window
    const split = Math.max(Math.floor(base.length / 2), 1);
    const nutrientTrends = buildNutrientTrends(base, split);

    return NextResponse.json({
      daysTracked: base.length,
      avgScore: Math.round(avgScore * 10) / 10,
      avgCalories: Math.round(avgCalories),
      avgProtein: Math.round(avgProtein * 10) / 10,
      totalMealsLogged,
      bestDay,
      bestScore: Math.round(bestScore),
      nutrientTrends,
      dailyScores,
    });
  } catch (error) {
    console.error("History error:", error);
    return NextResponse.json({
      daysTracked: 0,
      avgScore: 0,
      avgCalories: 0,
      avgProtein: 0,
      totalMealsLogged: 0,
      bestDay: "",
      bestScore: 0,
      nutrientTrends: [],
      dailyScores: [],
    });
  }
}

function buildNutrientTrends(
  days: { nutrients: { id: string; name: string; percentage: number }[] }[],
  split: number
) {
  const firstHalf = days.slice(0, split);
  const secondHalf = days.slice(split);
  const ids = [
    "protein",
    "fiber",
    "iron",
    "calcium",
    "vitaminC",
    "vitaminD",
    "potassium",
    "magnesium",
    "zinc",
    "vitaminA",
    "vitaminB12",
    "folate",
  ];

  const trends: { nutrientId: string; label: string; currentAvg: number; previousAvg: number; trend: "up" | "down" | "stable" }[] = [];

  for (const id of ids) {
    const labelMap: Record<string, string> = {
      protein: "Protein",
      fiber: "Fiber",
      iron: "Iron",
      calcium: "Calcium",
      vitaminC: "Vitamin C",
      vitaminD: "Vitamin D",
      potassium: "Potassium",
      magnesium: "Magnesium",
      zinc: "Zinc",
      vitaminA: "Vitamin A",
      vitaminB12: "Vitamin B12",
      folate: "Folate",
    };

    const avg = (arr: typeof days) => {
      if (arr.length === 0) return 0;
      const vals = arr.map((d) => d.nutrients.find((n) => n.id === id)?.percentage || 0);
      return vals.reduce((a, b) => a + b, 0) / arr.length;
    };

    const previousAvg = avg(firstHalf);
    const currentAvg = avg(secondHalf);
    const delta = currentAvg - previousAvg;
    const trend = delta > 3 ? "up" : delta < -3 ? "down" : "stable";

    trends.push({
      nutrientId: id,
      label: labelMap[id] || id,
      currentAvg: Math.round(currentAvg),
      previousAvg: Math.round(previousAvg),
      trend,
    });
  }

  return trends.sort((a, b) => b.currentAvg - a.currentAvg);
}
