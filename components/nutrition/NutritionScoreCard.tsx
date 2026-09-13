import React, { useState } from "react";
import { Award, Info, X } from "lucide-react";

interface NutritionScoreCardProps {
  score: number;
  scoreMessage: string;
}

export const NutritionScoreCard: React.FC<NutritionScoreCardProps> = ({ score, scoreMessage }) => {
  const [showInfo, setShowInfo] = useState(false);

  let badgeColor = "border-emerald-500 text-emerald-400 bg-emerald-500/10";
  let ringColor = "stroke-emerald-500";
  if (score < 50) {
    badgeColor = "border-amber-500 text-amber-400 bg-amber-500/10";
    ringColor = "stroke-amber-500";
  } else if (score < 75) {
    badgeColor = "border-blue-500 text-blue-400 bg-blue-500/10";
    ringColor = "stroke-blue-500";
  }

  const strokeDashoffset = 283 - (283 * score) / 100;

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200">Nutrition Score</h3>
        </div>
        <button
          onClick={() => setShowInfo(true)}
          className="text-slate-400 hover:text-slate-200 transition p-1"
          title="Score Methodology"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      <div className="my-6 flex flex-col items-center justify-center relative">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              className="stroke-slate-800 fill-none"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              className={`fill-none transition-all duration-1000 ease-out ${ringColor}`}
              strokeWidth="8"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold text-white">{score}</span>
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">out of 100</span>
          </div>
        </div>

        <div className={`mt-4 px-3 py-1 rounded-full border text-xs font-semibold ${badgeColor}`}>
          {scoreMessage}
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center">
        Evaluates calorie target, macro balance & vitamin/mineral coverage.
      </p>

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowInfo(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="text-lg font-bold text-white mb-2">Nutrition Score Methodology</h4>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Our Nutrition Score evaluates your daily intake across four main pillars:
            </p>
            <ul className="text-xs text-slate-400 space-y-2 mb-4">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Calorie Target Accuracy (25 pts):</strong> Staying close to your target range.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Protein Coverage (25 pts):</strong> Hitting optimal protein for muscle & recovery.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Fiber Target (25 pts):</strong> Gut health & sustained energy coverage.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Micronutrient Density (25 pts):</strong> RDA status of vitamins and minerals.</span>
              </li>
            </ul>
            <div className="p-3 bg-slate-800/80 rounded-xl text-[11px] text-slate-400">
              ℹ️ This is a product guidance score to help build healthier habits and is not a medical diagnostic tool.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
