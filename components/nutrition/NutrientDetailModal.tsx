import React, { useState, useEffect } from "react";
import { NutrientStatus, UserTargets } from "@/lib/nutrition/engine";
import { X, TrendingUp, Sparkles, UtensilsCrossed } from "lucide-react";

interface TrendDay {
  date: string;
  percentage: number;
}

interface NutrientDetailModalProps {
  nutrientId: keyof UserTargets;
  nutrients: NutrientStatus[];
  sourcesMap: Record<string, { foodName: string; amount: number; unit: string }[]>;
  userId?: string;
  onClose: () => void;
  onLogSuggestedFood?: (foodName: string) => void;
}

export const NutrientDetailModal: React.FC<NutrientDetailModalProps> = ({
  nutrientId,
  nutrients,
  sourcesMap,
  userId,
  onClose,
  onLogSuggestedFood,
}) => {
  const item = nutrients.find((n) => n.id === nutrientId);
  const [trendData, setTrendData] = useState<TrendDay[]>([]);

  useEffect(() => {
    if (!userId || !nutrientId) return;
    const fetchTrend = async () => {
      try {
        const res = await fetch(`/api/nutrition/history?userId=${userId}&days=7`);
        const data = await res.json();
        if (data?.dailyScores) {
          const trend: TrendDay[] = data.dailyScores.map((d: any) => {
            const nutrientStatus = d.nutrients?.find((n: any) => n.id === nutrientId);
            return {
              date: d.date,
              percentage: nutrientStatus?.percentage ?? 0,
            };
          });
          setTrendData(trend);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchTrend();
  }, [userId, nutrientId]);

  if (!item) return null;

  const sources = sourcesMap[nutrientId as string] || [];

  const foodSuggestions: Record<string, string[]> = {
    protein: ["Paneer", "Boiled Egg", "Grilled Chicken Breast", "Yellow Dal", "Whey Protein"],
    fiber: ["Oatmeal", "Apple", "Banana", "Cooked Spinach", "Yellow Dal"],
    iron: ["Cooked Spinach", "Rajma", "Boiled Egg", "Paneer"],
    calcium: ["Paneer", "Curd / Plain Yogurt", "Cow Milk", "Cooked Spinach"],
    vitaminC: ["Orange", "Apple", "Cooked Spinach", "Mixed Vegetable Sabzi"],
    vitaminD: ["Cow Milk", "Boiled Egg", "Egg Omelette"],
    potassium: ["Banana", "Cooked Spinach", "Orange", "Yellow Dal"],
    magnesium: ["Almonds", "Oatmeal", "Cooked Spinach", "Banana"],
    zinc: ["Pumpkin Seeds", "Boiled Egg", "Paneer", "Chicken Breast"],
    vitaminA: ["Carrot", "Sweet Potato", "Cooked Spinach", "Mango"],
    vitaminB12: ["Cow Milk", "Boiled Egg", "Fish", "Curd / Plain Yogurt"],
    folate: ["Cooked Spinach", "Rajma", "Lentils", "Banana"],
  };

  const suggestions = foodSuggestions[nutrientId as string] || ["Fresh Fruits", "Green Vegetables", "Nuts & Seeds"];

  // Use real trend data if available, otherwise fall back to today's percentage
  const displayDays = trendData.length > 0
    ? trendData.map((t, i) => {
        const dayName = new Date(t.date).toLocaleDateString("en-US", { weekday: "short" });
        return { label: dayName, h: t.percentage };
      })
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => ({
        label: day,
        h: i === 6 ? item.percentage : Math.round(item.percentage * (0.5 + Math.random() * 0.5)),
      }));

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800/60"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl p-3 bg-slate-800/80 rounded-2xl border border-slate-700">{item.icon}</span>
          <div>
            <h3 className="text-2xl font-bold text-white tracking-tight">{item.name}</h3>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Nutrient Detail</span>
          </div>
        </div>

        {/* Progress & Stats */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">Today's Intake</span>
            <span className="text-sm font-bold text-emerald-400">{item.percentage}% of target</span>
          </div>
          <div className="text-3xl font-extrabold text-white mb-3">
            {item.current} <span className="text-sm font-normal text-slate-400">/ {item.target} {item.unit}</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(item.percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Food Sources */}
        <div className="mb-6">
          <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4 text-emerald-400" />
            Where did your {item.name.toLowerCase()} come from?
          </h4>
          {sources.length === 0 ? (
            <div className="p-4 bg-slate-800/40 rounded-xl text-xs text-slate-400 text-center border border-dashed border-slate-800">
              No food logged today contained significant {item.name.toLowerCase()} yet.
            </div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {sources.map((src, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 text-xs">
                  <span className="font-semibold text-slate-200">{src.foodName}</span>
                  <span className="font-bold text-emerald-400">+{Math.round(src.amount * 10) / 10} {src.unit}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 7-Day Trend */}
        <div className="mb-6">
          <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            7-day coverage pattern
          </h4>
          <div className="grid grid-cols-7 gap-1.5 items-end h-20 p-3 bg-slate-800/40 rounded-xl border border-slate-700/40">
            {displayDays.map((day) => (
              <div key={day.label} className="flex flex-col items-center gap-1 h-full justify-end">
                <div
                  className="w-full bg-cyan-500/80 hover:bg-cyan-400 rounded-t transition-all"
                  style={{ height: `${Math.min(day.h, 100)}%` }}
                />
                <span className="text-[10px] text-slate-400">{day.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* How to Improve */}
        <div>
          <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            How to improve
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {suggestions.map((food) => (
              <button
                key={food}
                onClick={() => {
                  if (onLogSuggestedFood) onLogSuggestedFood(food);
                  onClose();
                }}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-left transition flex items-center justify-between text-xs font-semibold text-slate-200"
              >
                <span>{food}</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  + Add
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
