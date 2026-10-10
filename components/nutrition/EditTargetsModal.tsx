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
  const [values, setValues] = useState<{
    calories: number | string;
    protein: number | string;
    carbs: number | string;
    fat: number | string;
    fiber: number | string;
  }>({
    calories: targets.calories,
    protein: targets.protein,
    carbs: targets.carbs,
    fat: targets.fat,
    fiber: targets.fiber,
  });

  // Calculator State
  const [calcGender, setCalcGender] = useState<"male" | "female">("male");
  const [calcAge, setCalcAge] = useState<number | string>(26);
  const [calcWeight, setCalcWeight] = useState<number | string>(72);
  const [calcHeight, setCalcHeight] = useState<number | string>(175);
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

  const getNumVal = (k: EditableKey): number => {
    const raw = values[k];
    if (typeof raw === "number") return raw;
    const n = parseFloat(raw);
    return isNaN(n) ? 0 : n;
  };

  const caloriesNum = getNumVal("calories");
  const proteinNum = getNumVal("protein");
  const carbsNum = getNumVal("carbs");
  const fatNum = getNumVal("fat");
  const fiberNum = getNumVal("fiber");

  // Calculate macro energy sum
  const macroCalories = proteinNum * 4 + carbsNum * 4 + fatNum * 9;
  const calorieDiff = macroCalories - caloriesNum;
  const proteinPct = macroCalories > 0 ? Math.round(((proteinNum * 4) / macroCalories) * 100) : 0;
  const carbsPct = macroCalories > 0 ? Math.round(((carbsNum * 4) / macroCalories) * 100) : 0;
  const fatPct = macroCalories > 0 ? Math.round(((fatNum * 9) / macroCalories) * 100) : 0;

  // Mifflin-St Jeor TDEE Computation
  const calculateTDEE = () => {
    const w = typeof calcWeight === "number" ? calcWeight : parseFloat(String(calcWeight)) || 70;
    const h = typeof calcHeight === "number" ? calcHeight : parseFloat(String(calcHeight)) || 170;
    const a = typeof calcAge === "number" ? calcAge : parseInt(String(calcAge)) || 25;

    // BMR formula
    let bmr = 10 * w + 6.25 * h - 5 * a;
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
    const proteinGrams = Math.round(w * 2.0);
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
    const cal = caloriesNum || DEFAULT_TARGETS.calories;
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
    const ratio = caloriesNum / macroCalories;
    setValues((prev) => ({
      ...prev,
      protein: Math.round(proteinNum * ratio),
      carbs: Math.round(carbsNum * ratio),
      fat: Math.round(fatNum * ratio),
    }));
  };

  const bumpCalories = (delta: number) => {
    const newCal = Math.max(800, Math.min(6000, caloriesNum + delta));
    setValues((prev) => ({ ...prev, calories: newCal }));
  };

  const handleInputChange = (key: EditableKey, rawValue: string) => {
    setValues((prev) => ({ ...prev, [key]: rawValue }));
  };

  const handleInputBlur = (key: EditableKey) => {
    setActiveField(null);
    setValues((prev) => {
      const raw = prev[key];
      if (raw === "") {
        return { ...prev, [key]: DEFAULT_TARGETS[key] };
      }
      const num = parseFloat(String(raw));
      return { ...prev, [key]: isNaN(num) ? DEFAULT_TARGETS[key] : Math.max(0, num) };
    });
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
          calories: caloriesNum || DEFAULT_TARGETS.calories,
          protein: proteinNum || DEFAULT_TARGETS.protein,
          carbs: carbsNum || DEFAULT_TARGETS.carbs,
          fat: fatNum || DEFAULT_TARGETS.fat,
          fiber: fiberNum || DEFAULT_TARGETS.fiber,
          age: typeof calcAge === "number" ? calcAge : parseInt(String(calcAge)) || 25,
          gender: calcGender,
          heightCm: typeof calcHeight === "number" ? calcHeight : parseFloat(String(calcHeight)) || 170,
          weightKg: typeof calcWeight === "number" ? calcWeight : parseFloat(String(calcWeight)) || 70,
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
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden sm:overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-xl shadow-2xl relative flex flex-col h-[90dvh] sm:h-auto sm:max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
      >
        {/* Mobile Pull Handle Indicator */}
        <div className="w-10 h-1 rounded-full bg-slate-700/60 mx-auto mt-2.5 -mb-1 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 pb-3 sm:pb-4 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
              <Target className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">Nutrition Targets</h2>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                Personalise your daily intake & macro split
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0 ml-2"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Segmented Control */}
        <div className="px-3 sm:px-6 pt-2.5 pb-2 shrink-0">
          <div className="flex overflow-x-auto gap-1 p-1 bg-slate-950/80 rounded-xl sm:rounded-2xl border border-slate-800/80">
            <button
              type="button"
              onClick={() => setActiveTab("custom")}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-1 sm:px-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold transition-all min-h-[38px] sm:min-h-[42px] ${
                activeTab === "custom"
                  ? "bg-slate-800 text-white shadow-sm border border-slate-700/70"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
              }`}
            >
              <Sliders className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Sliders</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("presets")}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-1 sm:px-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold transition-all min-h-[38px] sm:min-h-[42px] ${
                activeTab === "presets"
                  ? "bg-slate-800 text-white shadow-sm border border-slate-700/70"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden min-[400px]:inline">Goal Presets</span>
              <span className="min-[400px]:hidden">Presets</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("calculator")}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-1 sm:px-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold transition-all min-h-[38px] sm:min-h-[42px] ${
                activeTab === "calculator"
                  ? "bg-slate-800 text-white shadow-sm border border-slate-700/70"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden min-[400px]:inline">Calculator</span>
              <span className="min-[400px]:hidden">Calc</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="px-3.5 sm:px-6 py-2 overflow-y-auto space-y-4 flex-1 overscroll-contain">
          {/* TAB 1: CUSTOM SLIDERS */}
          {activeTab === "custom" && (
            <>
              {/* Macro Split Progress Bar */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/60 space-y-2.5">
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1.5 text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    Macro Energy Split
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {Math.round(macroCalories)} / {caloriesNum} kcal
                    </span>
                    {Math.abs(calorieDiff) > 30 && (
                      <button
                        type="button"
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

                <div className="grid grid-cols-3 gap-1 text-[10px] sm:text-[11px] pt-0.5">
                  <span className="text-rose-400 font-medium flex items-center gap-1 truncate">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-500 shrink-0 inline-block" />
                    <span>Protein {proteinPct}%</span>
                    <span className="hidden min-[480px]:inline text-slate-400 font-normal">({proteinNum * 4} kcal)</span>
                  </span>
                  <span className="text-amber-400 font-medium flex items-center gap-1 truncate">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500 shrink-0 inline-block" />
                    <span>Carbs {carbsPct}%</span>
                    <span className="hidden min-[480px]:inline text-slate-400 font-normal">({carbsNum * 4} kcal)</span>
                  </span>
                  <span className="text-purple-400 font-medium flex items-center gap-1 truncate">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-500 shrink-0 inline-block" />
                    <span>Fat {fatPct}%</span>
                    <span className="hidden min-[480px]:inline text-slate-400 font-normal">({fatNum * 9} kcal)</span>
                  </span>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="space-y-2.5 sm:space-y-3">
                {fields.map((field) => {
                  const val = values[field.key];
                  const numVal = getNumVal(field.key);
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
                      <div className="p-3 sm:p-4">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                            <div className={`p-1.5 sm:p-2 rounded-xl ${field.bgColor} ${field.textColor} shrink-0`}>
                              {field.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-xs sm:text-sm font-bold text-slate-100 block truncate">{field.label}</span>
                              <p className="text-[10px] sm:text-[11px] text-slate-400 line-clamp-1 sm:line-clamp-none">{field.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-700/60 rounded-xl px-2 sm:px-2.5 py-1 shrink-0">
                            <input
                              type="text" inputMode="numeric" pattern="[0-9]*"
                              value={val}
                              onChange={(e) => handleInputChange(field.key, e.target.value)}
                              onFocus={() => setActiveField(field.key)}
                              onBlur={() => handleInputBlur(field.key)}
                              min={field.min}
                              max={field.max}
                              step={field.step}
                              className={`w-14 sm:w-20 text-right text-sm sm:text-lg font-extrabold bg-transparent border-none outline-none ${field.textColor} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                            />
                            <span className="text-[11px] sm:text-xs text-slate-400 font-medium w-6 sm:w-8 text-left">
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
                              value={numVal}
                              onChange={(e) =>
                                handleSliderChange(field.key, parseFloat(e.target.value) || 0)
                              }
                              onFocus={() => setActiveField(field.key)}
                              onBlur={() => handleInputBlur(field.key)}
                              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-700/80 accent-emerald-500
                                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-black/50 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-300 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125
                                [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-slate-300"
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span>{field.min} {field.unit}</span>
                            {isCalories && (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => bumpCalories(-50)}
                                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 text-[10px] font-medium transition active:scale-95"
                                >
                                  -50
                                </button>
                                <button
                                  type="button"
                                  onClick={() => bumpCalories(50)}
                                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 text-[10px] font-medium transition active:scale-95"
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
                Calories will remain {caloriesNum} kcal, and macros will automatically scale.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="p-3.5 sm:p-4 rounded-2xl bg-slate-800/40 hover:bg-slate-800/80 active:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-left transition-all group flex flex-col justify-between"
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
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
                    type="text" inputMode="numeric" pattern="[0-9]*"
                    value={calcAge}
                    onChange={(e) => setCalcAge(e.target.value)}
                    onBlur={() => {
                      if (calcAge === "" || isNaN(Number(calcAge)) || Number(calcAge) <= 0) {
                        setCalcAge(25);
                      }
                    }}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-1.5 text-sm text-white font-bold outline-none focus:border-emerald-500/50"
                  />
                </div>

                {/* Weight */}
                <div className="col-span-1">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="text" inputMode="numeric" pattern="[0-9]*"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(e.target.value)}
                    onBlur={() => {
                      if (calcWeight === "" || isNaN(Number(calcWeight)) || Number(calcWeight) <= 0) {
                        setCalcWeight(70);
                      }
                    }}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-1.5 text-sm text-white font-bold outline-none focus:border-emerald-500/50"
                  />
                </div>

                {/* Height */}
                <div className="col-span-1 sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="text" inputMode="numeric" pattern="[0-9]*"
                    value={calcHeight}
                    onChange={(e) => setCalcHeight(e.target.value)}
                    onBlur={() => {
                      if (calcHeight === "" || isNaN(Number(calcHeight)) || Number(calcHeight) <= 0) {
                        setCalcHeight(170);
                      }
                    }}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-1.5 text-sm text-white font-bold outline-none focus:border-emerald-500/50"
                  />
                </div>

                {/* Activity Level */}
                <div className="col-span-1 sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Activity Level
                  </label>
                  <select
                    value={calcActivity}
                    onChange={(e) => setCalcActivity(e.target.value as any)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs text-white font-medium outline-none focus:border-emerald-500/50"
                  >
                    <option value="sedentary">Sedentary (Little/no exercise)</option>
                    <option value="light">Light (1-3 days/wk workout)</option>
                    <option value="moderate">Moderate (3-5 days/wk workout)</option>
                    <option value="active">Active (6-7 days/wk intense)</option>
                  </select>
                </div>

                {/* Goal */}
                <div className="col-span-2 sm:col-span-4">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Primary Goal
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
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
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-slate-950/80 to-slate-900 border border-slate-800 space-y-3">
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Recommended Daily Intake
                    </span>
                    <div className="text-xl sm:text-2xl font-extrabold text-white flex items-baseline gap-1 mt-0.5">
                      <span>{calculated.targetCal}</span>
                      <span className="text-xs font-semibold text-emerald-400">kcal / day</span>
                    </div>
                  </div>
                  <div className="flex xs:flex-col items-center xs:items-end justify-between text-xs text-slate-400 gap-2 xs:gap-0.5">
                    <div>BMR: <span className="text-slate-200 font-semibold">{calculated.bmr} kcal</span></div>
                    <div>TDEE: <span className="text-slate-200 font-semibold">{calculated.tdee} kcal</span></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-center text-xs">
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
        <div className="flex items-center justify-between p-3.5 sm:p-5 border-t border-slate-800/80 bg-slate-950/60 shrink-0 pb-[calc(0.875rem+env(safe-area-inset-bottom))] sm:pb-4">
          <button
            type="button"
            onClick={resetToDefaults}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
            <span className="sm:hidden">Reset</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || saved}
              className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 shadow-lg ${
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
