import React from "react";
import { Plus, Utensils } from "lucide-react";
import { MealData } from "@/lib/nutrition/engine";

interface CalorieRingProps {
  consumedCalories: number;
  targetCalories: number;
  meals: MealData[];
  onOpenLogModal: (mealType?: string) => void;
}

export const CalorieRing: React.FC<CalorieRingProps> = ({
  consumedCalories,
  targetCalories,
  meals,
  onOpenLogModal,
}) => {
  const remaining = targetCalories - consumedCalories;
  const pct = Math.min(Math.round((consumedCalories / targetCalories) * 100), 100);
  const dashoffset = 502 - (502 * pct) / 100;

  const mealTypes = ["Breakfast", "Lunch", "Snack", "Dinner"];

  const getMealCalories = (type: string) => {
    const found = meals.find((m) => m.mealType.toLowerCase() === type.toLowerCase());
    if (!found) return 0;
    return Math.round(
      found.items.reduce((sum, item) => sum + item.calories, 0)
    );
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Utensils className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200">Calories Overview</h3>
        </div>
        <button
          onClick={() => onOpenLogModal()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Log Food</span>
        </button>
      </div>

      <div className="my-4 flex items-center justify-center relative">
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 180 180">
            <circle
              cx="90"
              cy="90"
              r="80"
              className="stroke-slate-800 fill-none"
              strokeWidth="12"
            />
            <circle
              cx="90"
              cy="90"
              r="80"
              className="stroke-cyan-500 fill-none transition-all duration-1000 ease-out"
              strokeWidth="12"
              strokeDasharray="502"
              strokeDashoffset={dashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold text-white">{Math.round(consumedCalories)}</span>
            <span className="text-xs text-slate-400 font-medium">of {targetCalories} kcal</span>
            <span className={`text-[11px] font-semibold mt-1 px-2 py-0.5 rounded-md ${remaining >= 0 ? "bg-slate-800 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
              {remaining >= 0 ? `${Math.round(remaining)} remaining` : `${Math.abs(Math.round(remaining))} over target`}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800">
        {mealTypes.map((type) => {
          const cals = getMealCalories(type);
          return (
            <button
              key={type}
              onClick={() => onOpenLogModal(type)}
              className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-left transition flex flex-col justify-between"
            >
              <span className="text-[11px] text-slate-400 font-medium truncate">{type}</span>
              <span className="text-sm font-bold text-slate-200">{cals > 0 ? `${cals} kcal` : "-"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
