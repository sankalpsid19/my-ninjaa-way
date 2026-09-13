import React from "react";
import { Sparkles, Plus } from "lucide-react";

interface DailyFocusCardProps {
  dailyFocus: {
    title: string;
    description: string;
    suggestedFoods: string[];
  };
  onLogSuggestedFood: (foodName: string) => void;
}

export const DailyFocusCard: React.FC<DailyFocusCardProps> = ({ dailyFocus, onLogSuggestedFood }) => {
  return (
    <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">One Thing to Improve Today</span>
        </div>

        <h3 className="text-xl font-bold text-white mb-1">{dailyFocus.title}</h3>
        <p className="text-xs text-slate-300 mb-4 leading-relaxed">{dailyFocus.description}</p>

        <div className="flex flex-wrap gap-2">
          {dailyFocus.suggestedFoods.map((food) => {
            const cleanName = food.replace(/^[^\w]+/, "").trim();
            return (
              <button
                key={food}
                onClick={() => onLogSuggestedFood(cleanName)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition active:scale-95 group"
              >
                <span>{food}</span>
                <Plus className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
