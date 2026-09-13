import React from "react";
import { NutrientStatus, UserTargets } from "@/lib/nutrition/engine";
import { AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";

interface NutrientGapCardProps {
  gaps: NutrientStatus[];
  goodNutrients: NutrientStatus[];
  onSelectNutrient: (nutrientId: keyof UserTargets) => void;
}

export const NutrientGapCard: React.FC<NutrientGapCardProps> = ({ gaps, goodNutrients, onSelectNutrient }) => {
  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200">Today's Nutrition Gaps</h3>
        </div>

        {/* Priority Gaps */}
        <div className="mb-5">
          <span className="text-xs font-semibold text-slate-400 block mb-2 uppercase tracking-wider">
            You could improve:
          </span>
          {gaps.length === 0 ? (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400">
              🎉 Outstanding! No critical nutrient gaps identified today.
            </div>
          ) : (
            <div className="space-y-2">
              {gaps.slice(0, 3).map((g) => (
                <div
                  key={g.id}
                  onClick={() => onSelectNutrient(g.id)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition cursor-pointer text-xs group"
                >
                  <div className="flex items-center gap-2">
                    <span>{g.status === "low" ? "🔴" : "🟡"}</span>
                    <span className="font-semibold text-slate-200 group-hover:text-white">{g.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span>{g.percentage}%</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Doing Well */}
        <div>
          <span className="text-xs font-semibold text-slate-400 block mb-2 uppercase tracking-wider">
            Doing well with:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {goodNutrients.slice(0, 4).map((g) => (
              <span
                key={g.id}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3" />
                {g.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
