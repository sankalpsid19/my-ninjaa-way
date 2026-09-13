import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  calculateNutrientTotals,
  computeNutritionScore,
  buildNutrientStatuses,
  getDailyFocus,
  DEFAULT_TARGETS,
  MealData,
} from "@/lib/nutrition/engine";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
  const userId = searchParams.get("userId");

  try {
    let profileTargets = DEFAULT_TARGETS;

    if (userId && prisma?.userNutritionProfile) {
      const profile = await prisma.userNutritionProfile.findUnique({
        where: { userId },
      });
      if (profile) {
        profileTargets = {
          ...DEFAULT_TARGETS,
          calories: profile.targetCalories,
          protein: profile.targetProtein,
          carbs: profile.targetCarbs,
          fat: profile.targetFat,
          fiber: profile.targetFiber,
        };
      }
    }

    let meals: MealData[] = [];
    if (userId && prisma?.meal) {
      const dbMeals = await prisma.meal.findMany({
        where: { userId, date },
        include: {
          items: {
            include: {
              food: true,
            },
          },
        },
      });

      meals = dbMeals.map((m) => ({
        id: m.id,
        date: m.date,
        mealType: m.mealType,
        items: m.items.map((i) => ({
          id: i.id,
          foodId: i.foodId,
          food: i.food,
          quantity: i.quantity,
          unit: i.unit,
          calories: i.calories,
          protein: i.protein,
          carbs: i.carbs,
          fat: i.fat,
          fiber: i.fiber,
        })),
      }));
    }

    const { totals, sourcesMap } = calculateNutrientTotals(meals);
    const { score, message: scoreMessage } = computeNutritionScore(totals, profileTargets);
    const nutrients = buildNutrientStatuses(totals, profileTargets);
    const gaps = nutrients.filter((n) => n.status === "low" || n.status === "needs_attention");
    const goodNutrients = nutrients.filter((n) => n.status === "excellent" || n.status === "good");
    const dailyFocus = getDailyFocus(nutrients);

    return NextResponse.json({
      date,
      targets: profileTargets,
      meals,
      totals,
      score,
      scoreMessage,
      nutrients,
      gaps,
      goodNutrients,
      dailyFocus,
      sourcesMap,
    });
  } catch (error) {
    console.error("Today nutrition route error:", error);
    return NextResponse.json({ error: "Failed to fetch today's nutrition" }, { status: 500 });
  }
}
