import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, TrendingDown, Flame, Target, ArrowUpRight } from "lucide-react";

interface HistoryDay {
  date: string;
  score: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  mealsLogged: number;
  micronutrientScore: number;
}

interface NutrientTrend {
  nutrientId: string;
  label: string;
  currentAvg: number;
  previousAvg: number;
  trend: "up" | "down" | "stable";
}

interface HistorySummary {
  daysTracked: number;
  avgScore: number;
  avgCalories: number;
  avgProtein: number;
  totalMealsLogged: number;
  bestDay: string;
  bestScore: number;
  nutrientTrends: NutrientTrend[];
  dailyScores: HistoryDay[];
}

interface NutritionHistoryProps {
  userId: string;
}

export const NutritionHistory: React.FC<NutritionHistoryProps> = ({ userId }) => {
  const [history, setHistory] = useState<HistorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    if (!userId) return;
    fetchHistory();
  }, [userId, days]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/nutrition/history?userId=${userId}&days=${days}`);
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="py-12 text-center">
          <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading nutrition history...</p>
        </div>
      </div>
    );
  }

  if (!history || history.daysTracked === 0) {
    return (
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200">Nutrition Trends</h3>
        </div>
        <div className="py-12 text-center text-slate-500 text-sm">
          <p className="mb-2">No history data yet.</p>
          <p className="text-xs">Start logging meals to see your nutrition trends here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard label="Avg Score" value={history.avgScore.toFixed(1)} suffix="/100" color="emerald" icon={<Target className="w-4 h-4" />} />
        <SummaryCard label="Avg Calories" value={Math.round(history.avgCalories).toString()} suffix="kcal" color="amber" icon={<Flame className="w-4 h-4" />} />
        <SummaryCard label="Avg Protein" value={Math.round(history.avgProtein).toString()} suffix="g" color="cyan" icon={<ArrowUpRight className="w-4 h-4" />} />
        <SummaryCard label="Meals Logged" value={history.totalMealsLogged.toString()} suffix="total" color="purple" icon={<BarChart3 className="w-4 h-4" />} />
      </div>

      {/* Daily Score Chart */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-200">Daily Scores</h3>
              <p className="text-[11px] text-slate-400">Last {days} days nutrition performance</p>
            </div>
          </div>
          <div className="flex gap-1 bg-slate-800 rounded-lg p-0.5 border border-slate-700/50">
            {[7, 14, 30].map((d) => (
              <button key={d} onClick={() => setDays(d)} className={`px-3 py-1 rounded-md text-[11px] font-semibold transition ${days === d ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}>
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="flex items-end gap-2 h-40 mb-4">
          {history.dailyScores.map((day) => {
            const barHeight = Math.max((day.score / 100) * 100, 8);
            const dateLabel = new Date(day.date).toLocaleDateString("en-US", { weekday: "short" });
            const barColor = day.score >= 70 ? "bg-emerald-500" : day.score >= 40 ? "bg-amber-500" : "bg-red-500";
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-slate-400 font-semibold">{Math.round(day.score)}</span>
                <div className={`w-full rounded-t-lg transition-all ${barColor} opacity-80 hover:opacity-100`} style={{ height: `${barHeight}%` }} />
                <span className="text-[10px] text-slate-500 font-medium">{dateLabel}</span>
              </div>
            );
          })}
        </div>

        {/* Calories trend */}
        <div className="border-t border-slate-800 pt-4 mt-2">
          <p className="text-[11px] text-slate-400 font-semibold mb-2">Daily Calorie Intake</p>
          <div className="flex items-center gap-2 overflow-x-auto">
            {history.dailyScores.map((day) => (
              <div key={day.date} className="flex flex-col items-center min-w-[48px] bg-slate-800/60 rounded-lg p-2 border border-slate-700/40">
                <span className="text-[10px] text-slate-500 mb-1">{new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                <span className="text-xs font-bold text-amber-400">{Math.round(day.calories)}</span>
                <span className="text-[9px] text-slate-500">kcal</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nutrient Trends */}
      {history.nutrientTrends.length > 0 && (
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-200">Nutrient Trends</h3>
              <p className="text-[11px] text-slate-400">How your nutrition is changing over time</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {history.nutrientTrends.map((trend) => (
              <div key={trend.nutrientId} className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-200">{trend.label}</p>
                  <p className="text-[11px] text-slate-400">Avg {Math.round(trend.currentAvg)}%</p>
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold ${trend.trend === "up" ? "text-emerald-400" : trend.trend === "down" ? "text-red-400" : "text-slate-400"}`}>
                  {trend.trend === "up" ? <TrendingUp className="w-3.5 h-3.5" /> : trend.trend === "down" ? <TrendingDown className="w-3.5 h-3.5" /> : <span>\u2014</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best Day */}
      {history.bestDay && (
        <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-300">Best Day</p>
              <p className="text-xs text-slate-300">
                {new Date(history.bestDay).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} \u2014 Score: {history.bestScore}/100
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard: React.FC<{ label: string; value: string; suffix: string; color: string; icon: React.ReactNode }> = ({ label, value, suffix, color, icon }) => {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    cyan: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
    purple: "bg-purple-500/10 border-purple-500/20 text-purple-400",
  };
  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-xl">
      <div className={`inline-flex p-2 rounded-xl border ${colorMap[color] || colorMap.emerald} mb-3`}>{icon}</div>
      <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">{label}</p>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-xl font-extrabold text-white">{value}</span>
        <span className="text-xs text-slate-400">{suffix}</span>
      </div>
    </div>
  );
};
