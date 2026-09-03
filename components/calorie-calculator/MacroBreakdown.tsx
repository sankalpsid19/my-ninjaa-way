"use client";

import {
  MacroPreset,
  MacroDistribution,
  CalculationResults,
} from "@/lib/calorie-calculator";

interface MacroBreakdownProps {
  results: CalculationResults;
  macroPreset: MacroPreset;
  customMacros: MacroDistribution;
  onPresetChange: (preset: MacroPreset) => void;
  onCustomMacrosChange: (macros: MacroDistribution) => void;
}

export default function MacroBreakdown({
  results,
  macroPreset,
  customMacros,
  onPresetChange,
  onCustomMacrosChange,
}: MacroBreakdownProps) {
  const { macros, macroPcts } = results;

  const handleProteinSlider = (val: number) => {
    const remaining = 100 - val;
    const currentCarbRatio = customMacros.carbPct / (customMacros.carbPct + customMacros.fatPct || 1);
    const newCarb = Math.round(remaining * currentCarbRatio);
    const newFat = remaining - newCarb;
    onCustomMacrosChange({
      proteinPct: val,
      carbPct: Math.max(0, newCarb),
      fatPct: Math.max(0, newFat),
    });
  };

  const handleCarbSlider = (val: number) => {
    const remaining = 100 - val;
    const currentProteinRatio = customMacros.proteinPct / (customMacros.proteinPct + customMacros.fatPct || 1);
    const newProtein = Math.round(remaining * currentProteinRatio);
    const newFat = remaining - newProtein;
    onCustomMacrosChange({
      proteinPct: Math.max(0, newProtein),
      carbPct: val,
      fatPct: Math.max(0, newFat),
    });
  };

  const handleFatSlider = (val: number) => {
    const remaining = 100 - val;
    const currentProteinRatio = customMacros.proteinPct / (customMacros.proteinPct + customMacros.carbPct || 1);
    const newProtein = Math.round(remaining * currentProteinRatio);
    const newCarb = remaining - newProtein;
    onCustomMacrosChange({
      proteinPct: Math.max(0, newProtein),
      carbPct: Math.max(0, newCarb),
      fatPct: val,
    });
  };

  const presetsList: { key: MacroPreset; label: string; desc: string }[] = [
    { key: "balanced", label: "Balanced", desc: "30P / 40C / 30F" },
    { key: "high_protein", label: "High Protein", desc: "40P / 35C / 25F" },
    { key: "low_carb", label: "Low Carb", desc: "35P / 20C / 45F" },
    { key: "keto", label: "Keto", desc: "25P / 5C / 70F" },
    { key: "custom", label: "Custom", desc: "Custom sliders" },
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-7 shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Macronutrient Distribution
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Recommended daily grams based on your chosen calorie target
          </p>
        </div>

        {/* Preset Selector Buttons */}
        <div className="flex flex-wrap gap-1.5 pt-1 sm:pt-0">
          {presetsList.map((p) => {
            const isSelected = macroPreset === p.key;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => {
                  onPresetChange(p.key);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Proportion Bar */}
      <div>
        <div className="h-4 w-full rounded-full overflow-hidden flex shadow-inner bg-zinc-100 dark:bg-zinc-800">
          <div
            style={{ width: `${macroPcts.proteinPct}%` }}
            className="bg-blue-600 dark:bg-blue-500 transition-all duration-300"
            title={`Protein: ${macroPcts.proteinPct}%`}
          />
          <div
            style={{ width: `${macroPcts.carbPct}%` }}
            className="bg-emerald-500 dark:bg-emerald-400 transition-all duration-300"
            title={`Carbohydrates: ${macroPcts.carbPct}%`}
          />
          <div
            style={{ width: `${macroPcts.fatPct}%` }}
            className="bg-amber-500 dark:bg-amber-400 transition-all duration-300"
            title={`Fats: ${macroPcts.fatPct}%`}
          />
        </div>

        <div className="flex items-center justify-between text-xs font-semibold mt-2 text-zinc-600 dark:text-zinc-400 px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-500" />
            Protein ({macroPcts.proteinPct}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            Carbs ({macroPcts.carbPct}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 dark:bg-amber-400" />
            Fats ({macroPcts.fatPct}%)
          </span>
        </div>
      </div>

      {/* Macro Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Protein Card */}
        <div className="p-4 rounded-xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
              Protein
            </span>
            <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
              4 kcal / g
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {macros.proteinGrams}
            </span>
            <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">g / day</span>
          </div>
          <div className="mt-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
            {macros.proteinCals} kcal ({macroPcts.proteinPct}%)
          </div>
        </div>

        {/* Carbohydrates Card */}
        <div className="p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Carbohydrates
            </span>
            <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
              4 kcal / g
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {macros.carbGrams}
            </span>
            <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">g / day</span>
          </div>
          <div className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            {macros.carbCals} kcal ({macroPcts.carbPct}%)
          </div>
        </div>

        {/* Fats Card */}
        <div className="p-4 rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Healthy Fats
            </span>
            <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
              9 kcal / g
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {macros.fatGrams}
            </span>
            <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">g / day</span>
          </div>
          <div className="mt-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
            {macros.fatCals} kcal ({macroPcts.fatPct}%)
          </div>
        </div>
      </div>

      {/* Custom Sliders Drawer (Visible when Custom preset selected) */}
      {macroPreset === "custom" && (
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Fine-tune Custom Percentages
            </span>
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
              Total: {customMacros.proteinPct + customMacros.carbPct + customMacros.fatPct}%
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400 mb-1 font-medium">
                <span>Protein: {customMacros.proteinPct}%</span>
                <span>{macros.proteinGrams}g</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={customMacros.proteinPct}
                onChange={(e) => handleProteinSlider(parseInt(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400 mb-1 font-medium">
                <span>Carbohydrates: {customMacros.carbPct}%</span>
                <span>{macros.carbGrams}g</span>
              </div>
              <input
                type="range"
                min="5"
                max="70"
                value={customMacros.carbPct}
                onChange={(e) => handleCarbSlider(parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400 mb-1 font-medium">
                <span>Fats: {customMacros.fatPct}%</span>
                <span>{macros.fatGrams}g</span>
              </div>
              <input
                type="range"
                min="10"
                max="70"
                value={customMacros.fatPct}
                onChange={(e) => handleFatSlider(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
