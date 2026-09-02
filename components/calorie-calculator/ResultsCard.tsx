"use client";

import { CalculationResults, GoalType } from "@/lib/calorie-calculator";

interface ResultsCardProps {
  results: CalculationResults;
  selectedGoal: GoalType;
  onSelectGoal: (goal: GoalType) => void;
}

export default function ResultsCard({
  results,
  selectedGoal,
  onSelectGoal,
}: ResultsCardProps) {
  const { bmr, tdee, bmi, bmiCategory, selectedGoal: currentGoal, allGoals } = results;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-7 shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-6">
      {/* Hero Maintenance Counter */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white p-6 sm:p-7 rounded-2xl shadow-xl">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider">
                Daily Maintenance (TDEE)
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                {tdee.toLocaleString()}
              </span>
              <span className="text-blue-200 text-sm font-semibold">
                kcal / day
              </span>
            </div>
            <p className="text-xs text-blue-100/90 mt-1 max-w-sm leading-relaxed">
              The number of calories your body burns every day including normal daily activities and exercise.
            </p>
          </div>

          <div className="flex sm:flex-col gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 sm:border-l border-white/20 sm:pl-6 shrink-0">
            <div>
              <span className="text-[10px] text-blue-200 uppercase font-bold tracking-wider block">
                BMR (Base Metabolism)
              </span>
              <span className="text-lg font-bold text-white">
                {bmr.toLocaleString()} <span className="text-xs font-normal text-blue-200">kcal</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] text-blue-200 uppercase font-bold tracking-wider block">
                BMI Index
              </span>
              <span className="text-sm font-bold text-white">
                {bmi} <span className="text-xs font-normal text-blue-200">({bmiCategory})</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Target Goal Selector */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            Select Your Target Goal
          </label>
          <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
            {currentGoal.label}
          </span>
        </div>

        {/* Goal Pills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {allGoals.map((g) => {
            const isSelected = g.key === selectedGoal;
            return (
              <button
                key={g.key}
                type="button"
                onClick={() => onSelectGoal(g.key)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "border-blue-600 dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 shadow-sm"
                    : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isSelected ? "text-blue-700 dark:text-blue-300" : "text-zinc-800 dark:text-zinc-200"}`}>
                    {g.label}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      g.deltaCals < 0
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                        : g.deltaCals > 0
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                        : "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {g.deltaCals > 0 ? `+${g.deltaCals}` : g.deltaCals}
                  </span>
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className={`text-sm font-bold ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-zinc-900 dark:text-zinc-100"}`}>
                    {g.targetCals.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">kcal/day</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Goal Highlight Box */}
      <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
            Target Intake for {currentGoal.label}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {currentGoal.weeklyChangeText}
          </span>
        </div>
        <div className="text-right shrink-0">
          <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
            {currentGoal.targetCals.toLocaleString()}
          </span>
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 ml-1">
            kcal/day
          </span>
        </div>
      </div>
    </div>
  );
}
