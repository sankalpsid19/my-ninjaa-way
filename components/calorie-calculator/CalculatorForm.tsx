"use client";

import { useState } from "react";
import {
  Gender,
  UnitSystem,
  ActivityLevel,
  CalculatorInputs,
  ACTIVITY_MULTIPLIERS,
  cmToFtIn,
  ftInToCm,
  kgToLbs,
  lbsToKg,
} from "@/lib/calorie-calculator";

interface CalculatorFormProps {
  inputs: CalculatorInputs;
  onChange: (newInputs: CalculatorInputs) => void;
}

export default function CalculatorForm({ inputs, onChange }: CalculatorFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(Boolean(inputs.bodyFatPct));

  // Local imperial input states to allow natural typing
  const ftIn = cmToFtIn(inputs.heightCm);
  const [feet, setFeet] = useState(ftIn.feet);
  const [inches, setInches] = useState(ftIn.inches);
  const [weightLbs, setWeightLbs] = useState(Math.round(kgToLbs(inputs.weightKg)));

  const handleUnitToggle = (unit: UnitSystem) => {
    if (unit === inputs.unit) return;
    if (unit === "imperial") {
      setWeightLbs(Math.round(kgToLbs(inputs.weightKg)));
      const res = cmToFtIn(inputs.heightCm);
      setFeet(res.feet);
      setInches(res.inches);
    }
    onChange({ ...inputs, unit });
  };

  const handleGenderChange = (gender: Gender) => {
    onChange({ ...inputs, gender });
  };

  const handleAgeChange = (val: number) => {
    onChange({ ...inputs, age: Math.max(12, Math.min(100, val)) });
  };

  const handleWeightKgChange = (val: number) => {
    onChange({ ...inputs, weightKg: Math.max(30, Math.min(300, val)) });
  };

  const handleWeightLbsChange = (val: number) => {
    setWeightLbs(val);
    const kg = lbsToKg(val);
    onChange({ ...inputs, weightKg: Math.round(kg * 10) / 10 });
  };

  const handleHeightCmChange = (val: number) => {
    onChange({ ...inputs, heightCm: Math.max(100, Math.min(250, val)) });
  };

  const handleFeetChange = (f: number) => {
    setFeet(f);
    const cm = Math.round(ftInToCm(f, inches));
    onChange({ ...inputs, heightCm: cm });
  };

  const handleInchesChange = (i: number) => {
    setInches(i);
    const cm = Math.round(ftInToCm(feet, i));
    onChange({ ...inputs, heightCm: cm });
  };

  const handleActivityChange = (activity: ActivityLevel) => {
    onChange({ ...inputs, activity });
  };

  const handleBodyFatChange = (val: number | null) => {
    onChange({
      ...inputs,
      bodyFatPct: val,
      formula: val ? "katch" : "mifflin",
    });
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-7 shadow-sm border border-zinc-200 dark:border-zinc-800">
      {/* Unit Switcher */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Personal Details
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Enter your physical attributes & activity
          </p>
        </div>

        <div className="inline-flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => handleUnitToggle("metric")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              inputs.unit === "metric"
                ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            Metric (kg/cm)
          </button>
          <button
            type="button"
            onClick={() => handleUnitToggle("imperial")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              inputs.unit === "imperial"
                ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            Imperial (lbs/ft)
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {/* Gender Selection */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
            Biological Gender
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleGenderChange("male")}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-semibold text-sm transition-all ${
                inputs.gender === "male"
                  ? "border-blue-600 dark:border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-sm"
                  : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <span className="text-lg">👨</span> Male
            </button>
            <button
              type="button"
              onClick={() => handleGenderChange("female")}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-semibold text-sm transition-all ${
                inputs.gender === "female"
                  ? "border-blue-600 dark:border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-sm"
                  : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <span className="text-lg">👩</span> Female
            </button>
          </div>
        </div>

        {/* Age & Weight Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Age */}
          <div>
            <label htmlFor="age-input" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
              Age (Years)
            </label>
            <div className="relative">
              <input
                id="age-input"
                type="number"
                inputMode="numeric"
                min={12}
                max={100}
                value={inputs.age}
                onChange={(e) => handleAgeChange(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-zinc-400 font-medium pointer-events-none">
                yrs
              </span>
            </div>
          </div>

          {/* Weight */}
          <div>
            <label htmlFor="weight-input" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
              Weight ({inputs.unit === "metric" ? "kg" : "lbs"})
            </label>
            <div className="relative">
              {inputs.unit === "metric" ? (
                <input
                  id="weight-input"
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  min={30}
                  max={300}
                  value={inputs.weightKg}
                  onChange={(e) => handleWeightKgChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              ) : (
                <input
                  id="weight-input"
                  type="number"
                  inputMode="numeric"
                  step="1"
                  min={60}
                  max={650}
                  value={weightLbs}
                  onChange={(e) => handleWeightLbsChange(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              )}
              <span className="absolute right-3.5 top-2.5 text-xs text-zinc-400 font-medium pointer-events-none">
                {inputs.unit === "metric" ? "kg" : "lbs"}
              </span>
            </div>
          </div>
        </div>

        {/* Height */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
            Height ({inputs.unit === "metric" ? "Centimeters" : "Feet & Inches"})
          </label>
          {inputs.unit === "metric" ? (
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                min={100}
                max={250}
                value={inputs.heightCm}
                onChange={(e) => handleHeightCmChange(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-zinc-400 font-medium pointer-events-none">
                cm
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  min={3}
                  max={7}
                  value={feet}
                  onChange={(e) => handleFeetChange(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-zinc-400 font-medium pointer-events-none">
                  ft
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={11}
                  value={inches}
                  onChange={(e) => handleInchesChange(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-zinc-400 font-medium pointer-events-none">
                  in
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Activity Level Selection */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
            Activity Level (Exercise & Work)
          </label>
          <div className="space-y-2">
            {(Object.keys(ACTIVITY_MULTIPLIERS) as ActivityLevel[]).map((level) => {
              const item = ACTIVITY_MULTIPLIERS[level];
              const isSelected = inputs.activity === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => handleActivityChange(level)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? "border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-zinc-900 dark:text-zinc-100 shadow-sm"
                      : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/30 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-blue-600 dark:bg-blue-400 animate-pulse" : "bg-zinc-400"}`} />
                      <span className="font-semibold text-xs sm:text-sm">{item.label}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 ml-4">
                      {item.description}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 shrink-0">
                    &times;{item.multiplier}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Advanced: Katch-McArdle & Body Fat % */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 py-1 transition-colors"
          >
            <span>Advanced: Body Fat % (Katch-McArdle Formula)</span>
            <span>{showAdvanced ? "▲" : "▼"}</span>
          </button>

          {showAdvanced && (
            <div className="mt-3 p-3.5 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
              <label htmlFor="body-fat-input" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Known Body Fat Percentage (Optional)
              </label>
              <div className="relative">
                <input
                  id="body-fat-input"
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  min={4}
                  max={60}
                  placeholder="e.g. 15"
                  value={inputs.bodyFatPct || ""}
                  onChange={(e) => {
                    const val = e.target.value ? parseFloat(e.target.value) : null;
                    handleBodyFatChange(val);
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute right-3.5 top-2 text-xs text-zinc-400 font-medium">
                  %
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                When provided, the calculator uses the Katch-McArdle equation based on lean body mass rather than total body weight.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
