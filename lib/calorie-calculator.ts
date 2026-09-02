export type Gender = "male" | "female";
export type UnitSystem = "metric" | "imperial";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "very_active"
  | "extra_active";

export type GoalType =
  | "aggressive_cut"
  | "moderate_cut"
  | "mild_cut"
  | "maintenance"
  | "lean_bulk"
  | "aggressive_bulk";

export type MacroPreset = "balanced" | "high_protein" | "low_carb" | "keto" | "custom";

export interface MacroDistribution {
  proteinPct: number;
  carbPct: number;
  fatPct: number;
}

export interface MacroGrams {
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  proteinCals: number;
  carbCals: number;
  fatCals: number;
}

export interface CalculatorInputs {
  gender: Gender;
  unit: UnitSystem;
  age: number;
  weightKg: number;
  heightCm: number;
  activity: ActivityLevel;
  bodyFatPct?: number | null;
  formula: "mifflin" | "katch";
  goal: GoalType;
  macroPreset: MacroPreset;
  customMacros: MacroDistribution;
}

export interface GoalDetails {
  key: GoalType;
  label: string;
  shortLabel: string;
  deltaCals: number;
  targetCals: number;
  weeklyChangeText: string;
}

export interface CalculationResults {
  bmr: number;
  tdee: number;
  bmi: number;
  bmiCategory: string;
  selectedGoal: GoalDetails;
  allGoals: GoalDetails[];
  macros: MacroGrams;
  macroPcts: MacroDistribution;
}

// Activity Multipliers
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, { multiplier: number; label: string; description: string }> = {
  sedentary: {
    multiplier: 1.2,
    label: "Sedentary",
    description: "Office job, little to no exercise",
  },
  light: {
    multiplier: 1.375,
    label: "Light Activity",
    description: "Light exercise / sports 1–3 days/week",
  },
  moderate: {
    multiplier: 1.55,
    label: "Moderate Activity",
    description: "Moderate exercise / sports 3–5 days/week",
  },
  very_active: {
    multiplier: 1.725,
    label: "Very Active",
    description: "Hard exercise / training 6–7 days/week",
  },
  extra_active: {
    multiplier: 1.9,
    label: "Extremely Active",
    description: "Athletic training, hard physical labor twice daily",
  },
};

// Goal Calorie Offsets
export const GOAL_OFFSETS: Record<GoalType, { delta: number; label: string; shortLabel: string; weeklyChangeText: string }> = {
  aggressive_cut: {
    delta: -750,
    label: "Aggressive Cut",
    shortLabel: "Cut (-750)",
    weeklyChangeText: "~0.75 kg (1.5 lbs) / week loss",
  },
  moderate_cut: {
    delta: -500,
    label: "Weight Loss",
    shortLabel: "Cut (-500)",
    weeklyChangeText: "~0.5 kg (1.0 lb) / week loss",
  },
  mild_cut: {
    delta: -250,
    label: "Mild Weight Loss",
    shortLabel: "Cut (-250)",
    weeklyChangeText: "~0.25 kg (0.5 lb) / week loss",
  },
  maintenance: {
    delta: 0,
    label: "Maintenance",
    shortLabel: "Maintain (0)",
    weeklyChangeText: "Maintain current body weight",
  },
  lean_bulk: {
    delta: 250,
    label: "Lean Bulk",
    shortLabel: "Bulk (+250)",
    weeklyChangeText: "~0.25 kg (0.5 lb) / week gain",
  },
  aggressive_bulk: {
    delta: 500,
    label: "Standard Bulk",
    shortLabel: "Bulk (+500)",
    weeklyChangeText: "~0.5 kg (1.0 lb) / week gain",
  },
};

// Macro Preset Distributions
export const MACRO_PRESETS: Record<MacroPreset, MacroDistribution> = {
  balanced: { proteinPct: 30, carbPct: 40, fatPct: 30 },
  high_protein: { proteinPct: 40, carbPct: 35, fatPct: 25 },
  low_carb: { proteinPct: 35, carbPct: 20, fatPct: 45 },
  keto: { proteinPct: 25, carbPct: 5, fatPct: 70 },
  custom: { proteinPct: 30, carbPct: 40, fatPct: 30 },
};

// Conversion Helpers
export function lbsToKg(lbs: number): number {
  return lbs * 0.45359237;
}

export function kgToLbs(kg: number): number {
  return kg / 0.45359237;
}

export function ftInToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * 2.54;
}

export function cmToFtIn(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches: inches === 12 ? 0 : inches };
}

// BMR Calculation
export function calculateBMR(params: {
  gender: Gender;
  weightKg: number;
  heightCm: number;
  age: number;
  bodyFatPct?: number | null;
  formula: "mifflin" | "katch";
}): number {
  const { gender, weightKg, heightCm, age, bodyFatPct, formula } = params;

  // Katch-McArdle formula if body fat is known and selected
  if (formula === "katch" && bodyFatPct != null && bodyFatPct > 0 && bodyFatPct < 100) {
    const leanBodyMassKg = weightKg * (1 - bodyFatPct / 100);
    return Math.round(370 + 21.6 * leanBodyMassKg);
  }

  // Mifflin-St Jeor formula
  if (gender === "male") {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  } else {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
  }
}

// BMI Calculation
export function calculateBMI(weightKg: number, heightCm: number): { bmi: number; category: string } {
  if (heightCm <= 0 || weightKg <= 0) return { bmi: 0, category: "N/A" };
  const heightM = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));

  let category = "Normal weight";
  if (bmi < 18.5) category = "Underweight";
  else if (bmi < 25) category = "Normal weight";
  else if (bmi < 30) category = "Overweight";
  else category = "Obese";

  return { bmi, category };
}

// Full Calculator Processor
export function calculateAll(inputs: CalculatorInputs): CalculationResults {
  const bmr = calculateBMR({
    gender: inputs.gender,
    weightKg: inputs.weightKg,
    heightCm: inputs.heightCm,
    age: inputs.age,
    bodyFatPct: inputs.bodyFatPct,
    formula: inputs.formula,
  });

  const activityMultiplier = ACTIVITY_MULTIPLIERS[inputs.activity]?.multiplier || 1.2;
  const tdee = Math.round(bmr * activityMultiplier);

  const allGoals: GoalDetails[] = (Object.keys(GOAL_OFFSETS) as GoalType[]).map((key) => {
    const info = GOAL_OFFSETS[key];
    const targetCals = Math.max(1000, tdee + info.delta);
    return {
      key,
      label: info.label,
      shortLabel: info.shortLabel,
      deltaCals: info.delta,
      targetCals,
      weeklyChangeText: info.weeklyChangeText,
    };
  });

  const selectedGoal = allGoals.find((g) => g.key === inputs.goal) || allGoals[3]; // default maintenance

  const macroPcts = inputs.macroPreset === "custom" ? inputs.customMacros : MACRO_PRESETS[inputs.macroPreset];

  const targetCals = selectedGoal.targetCals;
  const proteinCals = Math.round(targetCals * (macroPcts.proteinPct / 100));
  const carbCals = Math.round(targetCals * (macroPcts.carbPct / 100));
  const fatCals = Math.round(targetCals * (macroPcts.fatPct / 100));

  const proteinGrams = Math.round(proteinCals / 4);
  const carbGrams = Math.round(carbCals / 4);
  const fatGrams = Math.round(fatCals / 9);

  const { bmi, category: bmiCategory } = calculateBMI(inputs.weightKg, inputs.heightCm);

  return {
    bmr,
    tdee,
    bmi,
    bmiCategory,
    selectedGoal,
    allGoals,
    macros: {
      proteinGrams,
      carbGrams,
      fatGrams,
      proteinCals,
      carbCals,
      fatCals,
    },
    macroPcts,
  };
}
