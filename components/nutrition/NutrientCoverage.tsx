import React from "react";
import { NutrientStatus, UserTargets } from "@/lib/nutrition/engine";
import { ChevronRight, ShieldCheck } from "lucide-react";

interface NutrientCoverageProps {
  nutrients: NutrientStatus[];
  onSelectNutrient: (nutrientId: keyof UserTargets) => void;
}

export const NutrientCoverage: React.FC<NutrientCoverageProps> = ({ nutrients, onSelectNutrient }) => {
  const onTrackCount = nutrients.filter((n) => n.status === "excellent" || n.status === "good").length;
  const attentionCount = nutrients.filter((n) => n.status === "needs_attention").length;
  const lowCount = nutrients.filter((n) => n.status === "low").length;

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-200">Nutrient Coverage</h3>
            <p className="text-xs text-slate-400">Vitamins & minerals daily target RDA percentage</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            🟢 {onTrackCount} On track
          </span>
          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            🟡 {attentionCount} Attention
          </span>
          <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
            🔴 {lowCount} Low
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {nutrients.map((n) => {
          let badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
          let badgeText = "Excellent";
          if (n.status === "good") badgeText = "Good";
          if (n.status === "needs_attention") {
            badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
            badgeText = "Needs attention";
          } else if (n.status === "low") {
            badgeColor = "bg-red-500/10 text-red-400 border-red-500/20";
            badgeText = "Low";
          }

          return (
            <div
              key={n.id}
              onClick={() => onSelectNutrient(n.id)}
              className="p-3.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{n.icon}</span>
                <div>
                  <div className="text-sm font-semibold text-slate-200 group-hover:text-white transition">
                    {n.name}
                  </div>
                  <div className="text-xs text-slate-400">
                    {n.current} / {n.target} {n.unit} ({n.percentage}%)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${badgeColor}`}>
                  {badgeText}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
