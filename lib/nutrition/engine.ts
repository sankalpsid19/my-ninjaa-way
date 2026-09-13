export interface FoodItemData {
  id: string;
  name: string;
  category: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar?: number;
  saturatedFat?: number;
  sodium?: number;
  potassium?: number;
  calcium?: number;
  iron?: number;
  magnesium?: number;
  zinc?: number;
  vitaminA?: number;
  vitaminC?: number;
  vitaminD?: number;
  vitaminB12?: number;
  folate?: number;
}

export interface MealItemData {
  id: string;
  foodId: string;
  food: FoodItemData;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface MealData {
  id: string;
  date: string;
  mealType: string; // Breakfast | Lunch | Snack | Dinner
  items: MealItemData[];
}

export interface UserTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  vitaminC: number; // 90 mg
  vitaminD: number; // 15 mcg
  calcium: number; // 1000 mg
  iron: number; // 18 mg
  potassium: number; // 3400 mg
  magnesium: number; // 400 mg
  zinc: number; // 11 mg
  vitaminA: number; // 900 mcg
  vitaminB12: number; // 2.4 mcg
  folate: number; // 400 mcg
}

export const DEFAULT_TARGETS: UserTargets = {
  calories: 2100,
  protein: 140,
  carbs: 250,
  fat: 70,
  fiber: 30,
  vitaminC: 90,
  vitaminD: 15,
  calcium: 1000,
  iron: 18,
  potassium: 3400,
  magnesium: 400,
  zinc: 11,
  vitaminA: 900,
  vitaminB12: 2.4,
  folate: 400,
};

export interface NutrientStatus {
  id: keyof UserTargets;
  name: string;
  unit: string;
  current: number;
  target: number;
  percentage: number;
  status: "excellent" | "good" | "needs_attention" | "low";
  icon: string;
}

export interface NutritionDaySummary {
  date: string;
  targets?: UserTargets;
  meals?: MealData[];
  totals?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  score: number;
  scoreMessage: string;
  nutrients: NutrientStatus[];
  gaps: NutrientStatus[];
  goodNutrients: NutrientStatus[];
  dailyFocus: {
    title: string;
    description: string;
    suggestedFoods: string[];
  };
  sourcesMap: Record<string, { foodName: string; amount: number; unit: string }[]>;
}

// Helper calculation functions
export function calculateNutrientTotals(meals: MealData[]) {
  const totals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    vitaminC: 0,
    vitaminD: 0,
    calcium: 0,
    iron: 0,
    potassium: 0,
    magnesium: 0,
    zinc: 0,
    vitaminA: 0,
    vitaminB12: 0,
    folate: 0,
    sodium: 0,
    sugar: 0,
  };

  const sourcesMap: Record<string, { foodName: string; amount: number; unit: string }[]> = {
    protein: [],
    fiber: [],
    iron: [],
    calcium: [],
    vitaminC: [],
    vitaminD: [],
    potassium: [],
    magnesium: [],
    zinc: [],
    vitaminA: [],
    vitaminB12: [],
    folate: [],
  };

  meals.forEach((meal) => {
    meal.items.forEach((item) => {
      const mult = item.quantity / (item.food.servingSize || 1);
      totals.calories += item.calories;
      totals.protein += item.protein;
      totals.carbs += item.carbs;
      totals.fat += item.fat;
      totals.fiber += item.fiber;

      // Micronutrients
      const vitC = (item.food.vitaminC || 0) * mult;
      const vitD = (item.food.vitaminD || 0) * mult;
      const calc = (item.food.calcium || 0) * mult;
      const fe = (item.food.iron || 0) * mult;
      const pot = (item.food.potassium || 0) * mult;
      const mg = (item.food.magnesium || 0) * mult;
      const zn = (item.food.zinc || 0) * mult;
      const vitA = (item.food.vitaminA || 0) * mult;
      const vitB12 = (item.food.vitaminB12 || 0) * mult;
      const fol = (item.food.folate || 0) * mult;

      totals.vitaminC += vitC;
      totals.vitaminD += vitD;
      totals.calcium += calc;
      totals.iron += fe;
      totals.potassium += pot;
      totals.magnesium += mg;
      totals.zinc += zn;
      totals.vitaminA += vitA;
      totals.vitaminB12 += vitB12;
      totals.folate += fol;

      if (item.protein > 1) sourcesMap.protein.push({ foodName: item.food.name, amount: item.protein, unit: "g" });
      if (item.fiber > 0.5) sourcesMap.fiber.push({ foodName: item.food.name, amount: item.fiber, unit: "g" });
      if (fe > 0.2) sourcesMap.iron.push({ foodName: item.food.name, amount: fe, unit: "mg" });
      if (calc > 10) sourcesMap.calcium.push({ foodName: item.food.name, amount: calc, unit: "mg" });
      if (vitC > 2) sourcesMap.vitaminC.push({ foodName: item.food.name, amount: vitC, unit: "mg" });
      if (vitD > 0.1) sourcesMap.vitaminD.push({ foodName: item.food.name, amount: vitD, unit: "mcg" });
      if (pot > 20) sourcesMap.potassium.push({ foodName: item.food.name, amount: pot, unit: "mg" });
      if (mg > 5) sourcesMap.magnesium.push({ foodName: item.food.name, amount: mg, unit: "mg" });
    });
  });

  return { totals, sourcesMap };
}

export function computeNutritionScore(totals: ReturnType<typeof calculateNutrientTotals>["totals"], targets: UserTargets) {
  if (totals.calories === 0) return { score: 0, message: "Log a meal to reveal your score" };

  let points = 0;
  
  // Calorie accuracy (max 25 pts)
  const calRatio = totals.calories / targets.calories;
  if (calRatio >= 0.85 && calRatio <= 1.15) points += 25;
  else if (calRatio >= 0.7 && calRatio <= 1.3) points += 18;
  else points += 10;

  // Protein coverage (max 25 pts)
  const pRatio = totals.protein / targets.protein;
  if (pRatio >= 0.9) points += 25;
  else if (pRatio >= 0.7) points += 18;
  else points += Math.round(pRatio * 20);

  // Fiber coverage (max 25 pts)
  const fibRatio = totals.fiber / targets.fiber;
  if (fibRatio >= 0.9) points += 25;
  else if (fibRatio >= 0.6) points += 18;
  else points += Math.round(fibRatio * 20);

  // Micronutrient overall avg (max 25 pts)
  const microRatios = [
    totals.vitaminC / targets.vitaminC,
    totals.iron / targets.iron,
    totals.calcium / targets.calcium,
    totals.potassium / targets.potassium,
  ];
  const avgMicro = microRatios.reduce((a, b) => a + Math.min(b, 1), 0) / microRatios.length;
  points += Math.round(avgMicro * 25);

  const score = Math.min(Math.max(points, 0), 100);

  let message = "Keep tracking your daily meals";
  if (score >= 85) message = "Great day so far!";
  else if (score >= 70) message = "Good progress today";
  else if (score >= 50) message = "Fair coverage, keep going";

  return { score, message };
}

export function buildNutrientStatuses(totals: ReturnType<typeof calculateNutrientTotals>["totals"], targets: UserTargets): NutrientStatus[] {
  const items: { id: keyof UserTargets; name: string; unit: string; val: number; target: number; icon: string }[] = [
    { id: "protein", name: "Protein", unit: "g", val: totals.protein, target: targets.protein, icon: "🥩" },
    { id: "fiber", name: "Fiber", unit: "g", val: totals.fiber, target: targets.fiber, icon: "🌾" },
    { id: "vitaminC", name: "Vitamin C", unit: "mg", val: totals.vitaminC, target: targets.vitaminC, icon: "🍊" },
    { id: "iron", name: "Iron", unit: "mg", val: totals.iron, target: targets.iron, icon: "🥬" },
    { id: "calcium", name: "Calcium", unit: "mg", val: totals.calcium, target: targets.calcium, icon: "🥛" },
    { id: "vitaminD", name: "Vitamin D", unit: "mcg", val: totals.vitaminD, target: targets.vitaminD, icon: "☀️" },
    { id: "potassium", name: "Potassium", unit: "mg", val: totals.potassium, target: targets.potassium, icon: "🍌" },
    { id: "magnesium", name: "Magnesium", unit: "mg", val: totals.magnesium, target: targets.magnesium, icon: "🥑" },
    { id: "zinc", name: "Zinc", unit: "mg", val: totals.zinc, target: targets.zinc, icon: "🛡️" },
    { id: "vitaminA", name: "Vitamin A", unit: "mcg", val: totals.vitaminA, target: targets.vitaminA, icon: "🥕" },
    { id: "vitaminB12", name: "Vitamin B12", unit: "mcg", val: totals.vitaminB12, target: targets.vitaminB12, icon: "💊" },
    { id: "folate", name: "Folate", unit: "mcg", val: totals.folate, target: targets.folate, icon: "🥦" },
  ];

  return items.map((item) => {
    const pct = Math.round((item.val / item.target) * 100);
    let status: NutrientStatus["status"] = "excellent";
    if (pct < 40) status = "low";
    else if (pct < 75) status = "needs_attention";
    else if (pct < 90) status = "good";

    return {
      id: item.id,
      name: item.name,
      unit: item.unit,
      current: Math.round(item.val * 10) / 10,
      target: item.target,
      percentage: pct,
      status,
      icon: item.icon,
    };
  });
}

export function getDailyFocus(nutrients: NutrientStatus[]) {
  const lowOrNeeds = nutrients.filter((n) => n.status === "low" || n.status === "needs_attention");
  
  if (lowOrNeeds.length === 0) {
    return {
      title: "Maintain your great balance!",
      description: "You have hit your key nutrient targets for today. Stay hydrated!",
      suggestedFoods: ["Water", "Green Tea", "Fresh Fruit"],
    };
  }

  const focusItem = lowOrNeeds.sort((a, b) => a.percentage - b.percentage)[0];

  if (focusItem.id === "fiber") {
    return {
      title: "Add one fiber-rich food",
      description: `You're currently ${Math.round(focusItem.target - focusItem.current)}g below your daily fiber target.`,
      suggestedFoods: ["🥣 Oats", "🍎 Apple", "🫘 Yellow Dal / Rajma", "🥦 Broccoli"],
    };
  }
  if (focusItem.id === "protein") {
    return {
      title: "Boost your protein intake",
      description: `You need about ${Math.round(focusItem.target - focusItem.current)}g more protein today.`,
      suggestedFoods: ["🍳 Boiled Eggs", "🧀 Paneer", "🍗 Chicken Breast", "🥛 Whey Shake"],
    };
  }
  if (focusItem.id === "iron") {
    return {
      title: "Include iron-rich foods",
      description: `Targeting ${Math.round(focusItem.target - focusItem.current)}mg more iron for energy and metabolism.`,
      suggestedFoods: ["🥬 Spinach / Palak", "🫘 Rajma", "🥚 Egg Yolk", "🎃 Pumpkin Seeds"],
    };
  }
  if (focusItem.id === "calcium") {
    return {
      title: "Focus on calcium coverage",
      description: `Add extra calcium sources to support strong bones & muscle function.`,
      suggestedFoods: ["🥛 Milk", "🥛 Curd / Yogurt", "🧀 Paneer", "🥦 Leafy Greens"],
    };
  }

  return {
    title: `Improve your ${focusItem.name}`,
    description: `You are at ${focusItem.percentage}% of your target. Include foods rich in ${focusItem.name}.`,
    suggestedFoods: ["🍊 Fresh Fruits", "🥗 Mixed Salad", "🥜 Almonds & Nuts"],
  };
}
