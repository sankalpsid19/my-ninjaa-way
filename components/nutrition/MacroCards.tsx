import React from "react";
import { UserTargets } from "@/lib/nutrition/engine";

interface MacroCardsProps {
  totals: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  targets: UserTargets;
  onNutrientClick?: (nutrientId: keyof UserTargets) => void;
}

export const MacroCards: React.FC<MacroCardsProps> = ({ totals, targets, onNutrientClick }) => {
  const macros = [
    {
      id: "protein" as keyof UserTargets,
      name: "Protein",
      current: Math.round(totals.protein),
      target: targets.protein,
      unit: "g",
      color: "from-blue-500 to-cyan-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      id: "carbs" as keyof UserTargets,
      name: "Carbs",
      current: Math.round(totals.carbs),
      target: targets.carbs,
      unit: "g",
      color: "from-amber-500 to-orange-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      id: "fat" as keyof UserTargets,
      name: "Fat",
      current: Math.round(totals.fat),
      target: targets.fat,
      unit: "g",
      color: "from-purple-500 to-pink-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      id: "fiber" as keyof UserTargets,
      name: "Fiber",
      current: Math.round(totals.fiber),
      target: targets.fiber,
      unit: "g",
      color: "from-emerald-500 to-teal-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {macros.map((m) => {
        const pct = Math.min(Math.round((m.current / m.target) * 100), 100);
        return (
          <div
            key={m.name}
            onClick={() => onNutrientClick && onNutrientClick(m.id)}
            className={`bg-slate-900/80 backdrop-blur-md border ${m.borderColor} rounded-2xl p-4 shadow-lg cursor-pointer hover:border-slate-600 transition flex flex-col justify-between group`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition">{m.name}</span>
              <span className="text-xs font-bold text-slate-300">{pct}%</span>
            </div>

            <div className="my-3">
              <div className="text-xl font-extrabold text-white tracking-tight">
                {m.current}
                <span className="text-xs font-normal text-slate-400 ml-1">/ {m.target}{m.unit}</span>
              </div>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${m.color} transition-all duration-700`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
