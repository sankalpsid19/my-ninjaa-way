"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Target,
  Flame,
  Drumstick,
  Wheat,
  Droplets,
  Leaf,
  RotateCcw,
  Check,
  Sparkles,
  Calculator,
  Sliders,
  Dumbbell,
  Scale,
  Zap,
  TrendingDown,
  TrendingUp,
  Minus,
  Plus,
  RefreshCw,
} from "lucide-react";
import { UserTargets, DEFAULT_TARGETS } from "@/lib/nutrition/engine";

interface EditTargetsModalProps {
  targets: UserTargets;
  userId: string;
  onClose: () => void;
  onSaved: () => void;
}

type EditableKey = "calories" | "protein" | "carbs" | "fat" | "fiber";

interface MacroField {
  key: EditableKey;
  label: string;
  unit: string;
  icon: React.ReactNode;
  color: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  min: number;
  max: number;
  step: number;
  description: string;
}

interface PresetOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  proteinPct: number;
  carbsPct: number;
  fatPct: number;
}

const PRESETS: PresetOption[] = [
  {
    id: "balanced",
    name: "Balanced",
    icon: <Scale className="w-4 h-4 text-emerald-400" />,
    description: "Even distribution for general health & vitality",
    carbsPct: 50,
    proteinPct: 20,
    fatPct: 30,
  },
  {
    id: "high_protein",
    name: "Muscle Growth",
    icon: <Dumbbell className="w-4 h-4 text-rose-400" />,
    description: "High protein for strength & hypertrophy",
    carbsPct: 40,
    proteinPct: 35,
    fatPct: 25,
  },
  {
    id: "fat_loss",
    name: "Fat Loss / Cut",
    icon: <TrendingDown className="w-4 h-4 text-amber-400" />,
    description: "High protein & moderate carbs for satiety",
    carbsPct: 35,
    proteinPct: 40,
    fatPct: 25,
  },
  {
    id: "low_carb",
    name: "Low Carb",
    icon: <Zap className="w-4 h-4 text-purple-400" />,
    description: "Reduced carbs with higher healthy fats",
    carbsPct: 15,
    proteinPct: 25,
    fatPct: 60,
  },
];

export const EditTargetsModal: React.FC<EditTargetsModalProps> = ({
  targets,
  userId,
  onClose,
  onSaved,
}) => {
  const [activeTab, setActiveTab] = useState<"custom" | "presets" | "calculator">("custom");
  const [values, setValues] = useState({
    calories: targets.calories,
    protein: targets.protein,
    carbs: targets.carbs,
    fat: targets.fat,
    fiber: targets.fiber,
  });

  // Calculator State
  const [calcGender, setCalcGender] = useState<"male" | "female">("male");
  const [calcAge, setCalcAge] = useState<number>(26);
  const [calcWeight, setCalcWeight] = useState<number>(72);
  const [calcHeight, setCalcHeight] = useState<number>(175);
  const [calcActivity, setCalcActivity] = useState<"sedentary" | "light" | "moderate" | "active">("moderate");
  const [calcGoal, setCalcGoal] = useState<"lose_fast" | "lose_slow" | "maintain" | "gain_slow" | "gain_fast">("maintain");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Fetch existing profile if available to prepopulate calculator
  useEffect(() => {
    if (!userId) return;
    fetch(`/api/nutrition/targets?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) {
          if (data.profile.gender === "male" || data.profile.gender === "female") {
            setCalcGender(data.profile.gender);
          }
          if (data.profile.age) setCalcAge(data.profile.age);
          if (data.profile.weightKg) setCalcWeight(data.profile.weightKg);
          if (data.profile.heightCm) setCalcHeight(data.profile.heightCm);
          if (data.profile.activityLevel) {
            setCalcActivity(data.profile.activityLevel as any);
          }
        }
      })
      .catch((err) => console.error("Error loading profile:", err));
  }, [userId]);

  const fields: MacroField[] = [
    {
      key: "calories",
      label: "Calories",
      unit: "kcal",
      icon: <Flame className="w-5 h-5" />,
      color: "from-orange-500 to-amber-500",
      textColor: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/30",
      min: 800,
      max: 5500,
      step: 25,
      description: "Total daily energy intake target",
    },
    {
      key: "protein",
      label: "Protein",
      unit: "g",
      icon: <Drumstick className="w-5 h-5" />,
      color: "from-rose-500 to-pink-500",
      textColor: "text-rose-400",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500/30",
      min: 20,
      max: 400,
      step: 5,
      description: "Muscle repair, recovery & lean mass (4 kcal/g)",
    },
    {
      key: "carbs",
      label: "Carbs",
      unit: "g",
      icon: <Wheat className="w-5 h-5" />,
      color: "from-amber-500 to-yellow-500",
      textColor: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      min: 20,
      max: 700,
      step: 5,
      description: "Primary glycogen & stamina fuel (4 kcal/g)",
    },
    {
      key: "fat",
      label: "Fat",
      unit: "g",
      icon: <Droplets className="w-5 h-5" />,
      color: "from-purple-500 to-indigo-500",
      textColor: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      min: 15,
      max: 300,
      step: 5,
      description: "Hormone synthesis & joint health (9 kcal/g)",
    },
    {
      key: "fiber",
      label: "Dietary Fiber",
      unit: "g",
      icon: <Leaf className="w-5 h-5" />,
      color: "from-emerald-500 to-teal-500",
      textColor: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      min: 5,
      max: 80,
      step: 1,
      description: "Digestion, gut microbiome & satiety",
    },
  ];

  // Calculate macro energy sum
  const macroCalories = values.protein * 4 + values.carbs * 4 + values.fat * 9;
  const calorieDiff = macroCalories - values.calories;
  const proteinPct = macroCalories > 0 ? Math.round(((values.protein * 4) / macroCalories) * 100) : 0;
  const carbsPct = macroCalories > 0 ? Math.round(((values.carbs * 4) / macroCalories) * 100) : 0;
  const fatPct = macroCalories > 0 ? Math.round(((values.fat * 9) / macroCalories) * 100) : 0;

  // Mifflin-St Jeor TDEE Computation
  const calculateTDEE = () => {
    // BMR formula
    let bmr = 10 * calcWeight + 6.25 * calcHeight - 5 * calcAge;
    bmr += calcGender === "male" ? 5 : -161;

    // Activity multiplier
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
    };
    const tdee = Math.round(bmr * activityMultipliers[calcActivity]);

    // Goal adjustments
    const goalAdjustments = {
      lose_fast: -500,
      lose_slow: -250,
      maintain: 0,
      gain_slow: 250,
      gain_fast: 500,
    };

    const targetCal = Math.max(1200, Math.round(tdee + goalAdjustments[calcGoal]));

    // Macros: ~2.0g protein/kg bodyweight, ~25% fat, remaining carbs
    const proteinGrams = Math.round(calcWeight * 2.0);
    const fatGrams = Math.round((targetCal * 0.25) / 9);
    const remainingCal = targetCal - (proteinGrams * 4 + fatGrams * 9);
    const carbsGrams = Math.max(50, Math.round(remainingCal / 4));
    const fiberGrams = Math.round((targetCal / 1000) * 14);

    return {
      bmr: Math.round(bmr),
      tdee,
      targetCal,
      proteinGrams,
      fatGrams,
      carbsGrams,
      fiberGrams,
    };
  };

  const calculated = calculateTDEE();

  const applyCalculatedTargets = () => {
    setValues({
      calories: calculated.targetCal,
      protein: calculated.proteinGrams,
      carbs: calculated.carbsGrams,
      fat: calculated.fatGrams,
      fiber: calculated.fiberGrams,
    });
    setActiveTab("custom");
  };

  const applyPreset = (preset: PresetOption) => {
    const cal = values.calories;
    const proteinG = Math.round((cal * (preset.proteinPct / 100)) / 4);
    const carbsG = Math.round((cal * (preset.carbsPct / 100)) / 4);
    const fatG = Math.round((cal * (preset.fatPct / 100)) / 9);
    const fiberG = Math.round((cal / 1000) * 14);

    setValues((prev) => ({
      ...prev,
      protein: proteinG,
      carbs: carbsG,
      fat: fatG,
      fiber: fiberG,
    }));
    setActiveTab("custom");
  };

  const autoBalanceMacros = () => {
    if (macroCalories <= 0) return;
    const ratio = values.calories / macroCalories;
    setValues((prev) => ({
      ...prev,
      protein: Math.round(prev.protein * ratio),
      carbs: Math.round(prev.carbs * ratio),
      fat: Math.round(prev.fat * ratio),
    }));
  };

  const bumpCalories = (delta: number) => {
    const newCal = Math.max(800, Math.min(6000, values.calories + delta));
    setValues((prev) => ({ ...prev, calories: newCal }));
  };

  const handleInputChange = (key: EditableKey, rawValue: string) => {
    if (rawValue === "") {
      setValues((prev) => ({ ...prev, [key]: 0 }));
      return;
    }
    const num = parseFloat(rawValue);
    if (!isNaN(num)) {
      setValues((prev) => ({ ...prev, [key]: num }));
    }
  };

  const handleSliderChange = (key: EditableKey, val: number) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const resetToDefaults = () => {
    setValues({
      calories: DEFAULT_TARGETS.calories,
      protein: DEFAULT_TARGETS.protein,
      carbs: DEFAULT_TARGETS.carbs,
      fat: DEFAULT_TARGETS.fat,
      fiber: DEFAULT_TARGETS.fiber,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/nutrition/targets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          calories: values.calories,
          protein: values.protein,
          carbs: values.carbs,
          fat: values.fat,
          fiber: values.fiber,
          age: calcAge,
          gender: calcGender,
          heightCm: calcHeight,
          weightKg: calcWeight,
          activityLevel: calcActivity,
        }),
      });
      setSaved(true);
      setTimeout(() => {
        onSaved();
        onClose();
      }, 500);
    } catch (err) {
      console.error("Failed to save targets:", err);
    } finally {
      setSaving(false);
    }
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      ref={backdropRef}
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl relative flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Nutrition Targets</h2>
              <p className="text-xs text-slate-400">
                Personalise your daily intake & macro split
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Segmented Control */}
        <div className="px-5 sm:px-6 pt-3 pb-2">
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/60 rounded-2xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab("custom")}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "custom"
                  ? "bg-slate-800 text-white shadow-sm border border-slate-700/60"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Sliders</span>
            </button>

            <button
              onClick={() => setActiveTab("presets")}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "presets"
                  ? "bg-slate-800 text-white shadow-sm border border-slate-700/60"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Goal Presets</span>
            </button>

            <button
              onClick={() => setActiveTab("calculator")}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "calculator"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Calculator</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="px-5 sm:px-6 py-2 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: CUSTOM SLIDERS */}
          {activeTab === "custom" && (
            <>
              {/* Macro Split Progress Bar */}
              <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/60 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    Macro Energy Split
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">
                      {Math.round(macroCalories)} / {values.calories} kcal
                    </span>
                    {Math.abs(calorieDiff) > 30 && (
                      <button
                        onClick={autoBalanceMacros}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold transition"
                        title="Scale macros proportionally to match calorie target"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                        Balance
                      </button>
                    )}
                  </div>
                </div>

                {/* Stacked Macro Bar */}
                <div className="flex w-full h-3 rounded-full overflow-hidden bg-slate-800">
                  <div
                    className="bg-rose-500 transition-all duration-300"
                    style={{ width: `${proteinPct}%` }}
                    title={`Protein ${proteinPct}%`}
                  />
                  <div
                    className="bg-amber-500 transition-all duration-300"
                    style={{ width: `${carbsPct}%` }}
                    title={`Carbs ${carbsPct}%`}
                  />
                  <div
                    className="bg-purple-500 transition-all duration-300"
                    style={{ width: `${fatPct}%` }}
                    title={`Fat ${fatPct}%`}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] pt-0.5">
                  <span className="text-rose-400 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                    Protein {proteinPct}% ({values.protein * 4} kcal)
                  </span>
                  <span className="text-amber-400 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                    Carbs {carbsPct}% ({values.carbs * 4} kcal)
                  </span>
                  <span className="text-purple-400 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                    Fat {fatPct}% ({values.fat * 9} kcal)
                  </span>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="space-y-3">
                {fields.map((field) => {
                  const val = values[field.key] as number;
                  const isActive = activeField === field.key;
                  const isCalories = field.key === "calories";

                  return (
                    <div
                      key={field.key}
                      className={`rounded-2xl border transition-all duration-200 ${
                        isActive
                          ? `${field.borderColor} ${field.bgColor}`
                          : "border-slate-800 bg-slate-800/40 hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="p-3.5 sm:p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-2 rounded-xl ${field.bgColor} ${field.textColor}`}>
                              {field.icon}
                            </div>
                            <div>
                              <span className="text-sm font-bold text-slate-100">{field.label}</span>
                              <p className="text-[11px] text-slate-400">{field.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-700/60 rounded-xl px-2.5 py-1">
                            <input
                              type="number"
                              value={val === 0 ? "" : val}
                              onChange={(e) => handleInputChange(field.key, e.target.value)}
                              onFocus={() => setActiveField(field.key)}
                              onBlur={() => setActiveField(null)}
                              min={field.min}
                              max={field.max}
                              step={field.step}
                              className={`w-20 text-right text-base sm:text-lg font-extrabold bg-transparent border-none outline-none ${field.textColor} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                            />
                            <span className="text-xs text-slate-400 font-medium w-8 text-left">
                              {field.unit}
                            </span>
                          </div>
                        </div>

                        {/* Slider & Quick adjustments */}
                        <div className="space-y-1.5 pt-1">
                          <div className="relative flex items-center">
                            <input
                              type="range"
                              min={field.min}
                              max={field.max}
                              step={field.step}
                              value={val}
                              onChange={(e) =>
                                handleSliderChange(field.key, parseFloat(e.target.value))
                              }
                              onFocus={() => setActiveField(field.key)}
                              onBlur={() => setActiveField(null)}
                              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-slate-700/80 accent-emerald-500
                                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-black/50 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-300 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125
                                [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-slate-300"
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span>{field.min} {field.unit}</span>
                            {isCalories && (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => bumpCalories(-50)}
                                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium transition"
                                >
                                  -50
                                </button>
                                <button
                                  type="button"
                                  onClick={() => bumpCalories(50)}
                                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium transition"
                                >
                                  +50
                                </button>
                              </div>
                            )}
                            <span>{field.max} {field.unit}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* TAB 2: GOAL PRESETS */}
          {activeTab === "presets" && (
            <div className="space-y-3 py-1">
              <p className="text-xs text-slate-400">
                Choose a proven macronutrient split tailored to your specific fitness objective.
                Calories will remain {values.calories} kcal, and macros will automatically scale.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className="p-4 rounded-2xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-sm text-white group-hover:text-emerald-400 transition flex items-center gap-2">
                          {preset.icon}
                          {preset.name}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 text-[11px] font-medium">
                      <span className="text-rose-400">P: {preset.proteinPct}%</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-amber-400">C: {preset.carbsPct}%</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-purple-400">F: {preset.fatPct}%</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TDEE CALCULATOR */}
          {activeTab === "calculator" && (
            <div className="space-y-4 py-1">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 leading-relaxed">
                Estimate your precise daily caloric requirements using the clinically validated
                <strong> Mifflin-St Jeor</strong> formula based on your body metrics and lifestyle.
              </div>

              {/* Calculator Inputs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Gender */}
                <div className="col-span-2 sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Biological Sex
                  </label>
                  <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950/60 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setCalcGender("male")}
                      className={`py-1.5 text-xs font-semibold rounded-lg transition ${
                        calcGender === "male"
                          ? "bg-slate-800 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalcGender("female")}
                      className={`py-1.5 text-xs font-semibold rounded-lg transition ${
                        calcGender === "female"
                          ? "bg-slate-800 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Female
                    </button>
                  </div>
                </div>

                {/* Age */}
                <div className="col-span-1">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Age (yrs)
                  </label>
                  <input
                    type="number"
                    value={calcAge}
                    onChange={(e) => setCalcAge(parseInt(e.target.value) || 25)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-1.5 text-sm text-white font-bold outline-none focus:border-emerald-500/50"
                  />
                </div>

                {/* Weight */}
                <div className="col-span-1">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(parseFloat(e.target.value) || 70)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-1.5 text-sm text-white font-bold outline-none focus:border-emerald-500/50"
                  />
                </div>

                {/* Height */}
                <div className="col-span-2">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={calcHeight}
                    onChange={(e) => setCalcHeight(parseFloat(e.target.value) || 170)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-1.5 text-sm text-white font-bold outline-none focus:border-emerald-500/50"
                  />
                </div>

                {/* Activity Level */}
                <div className="col-span-2">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Activity Level
                  </label>
                  <select
                    value={calcActivity}
                    onChange={(e) => setCalcActivity(e.target.value as any)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-medium outline-none focus:border-emerald-500/50"
                  >
                    <option value="sedentary">Sedentary (Desk work, little exercise)</option>
                    <option value="light">Light (1-3 days/wk workout)</option>
                    <option value="moderate">Moderate (3-5 days/wk workout)</option>
                    <option value="active">Active (6-7 days/wk intense training)</option>
                  </select>
                </div>

                {/* Goal */}
                <div className="col-span-4">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Primary Goal
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                    {[
                      { id: "lose_fast", label: "Cut (-500)" },
                      { id: "lose_slow", label: "Mild Cut (-250)" },
                      { id: "maintain", label: "Maintain" },
                      { id: "gain_slow", label: "Lean Bulk (+250)" },
                      { id: "gain_fast", label: "Bulk (+500)" },
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setCalcGoal(g.id as any)}
                        className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold transition border ${
                          calcGoal === g.id
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                            : "bg-slate-950/40 text-slate-400 border-slate-800 hover:text-white"
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Calculated Results Summary Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950/80 to-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Recommended Daily Intake
                    </span>
                    <div className="text-2xl font-extrabold text-white flex items-baseline gap-1 mt-0.5">
                      <span>{calculated.targetCal}</span>
                      <span className="text-xs font-semibold text-emerald-400">kcal / day</span>
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-400 space-y-0.5">
                    <div>BMR: <span className="text-slate-200 font-semibold">{calculated.bmr} kcal</span></div>
                    <div>TDEE: <span className="text-slate-200 font-semibold">{calculated.tdee} kcal</span></div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-rose-400 block font-semibold">Protein</span>
                    <span className="font-extrabold text-white text-sm">{calculated.proteinGrams}g</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-amber-400 block font-semibold">Carbs</span>
                    <span className="font-extrabold text-white text-sm">{calculated.carbsGrams}g</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-purple-400 block font-semibold">Fat</span>
                    <span className="font-extrabold text-white text-sm">{calculated.fatGrams}g</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-emerald-400 block font-semibold">Fiber</span>
                    <span className="font-extrabold text-white text-sm">{calculated.fiberGrams}g</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={applyCalculatedTargets}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Apply These Targets
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 sm:p-6 pt-3 border-t border-slate-800/80 bg-slate-950/40">
          <button
            type="button"
            onClick={resetToDefaults}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
            <span className="sm:hidden">Reset</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || saved}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 shadow-lg ${
                saved
                  ? "bg-emerald-500 text-white shadow-emerald-500/30"
                  : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20"
              } disabled:opacity-70`}
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" /> Saved!
                </>
              ) : saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Save Targets
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
