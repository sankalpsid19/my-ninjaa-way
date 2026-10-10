import React from "react";
import { ChevronLeft, ChevronRight, Calendar, SlidersHorizontal } from "lucide-react";

interface NutritionHeaderProps {
  dateStr: string;
  setDateStr: (d: string) => void;
  onEditTargets?: () => void;
}

export const NutritionHeader: React.FC<NutritionHeaderProps> = ({ dateStr, setDateStr, onEditTargets }) => {
  const currentHour = new Date().getHours();
  let greeting = "Good morning";
  if (currentHour >= 12 && currentHour < 17) greeting = "Good afternoon";
  else if (currentHour >= 17) greeting = "Good evening";

  const dateObj = new Date(dateStr + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const handlePrevDay = () => {
    const d = new Date(dateStr + "T00:00:00");
    d.setDate(d.getDate() - 1);
    setDateStr(d.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    const d = new Date(dateStr + "T00:00:00");
    d.setDate(d.getDate() + 1);
    setDateStr(d.toISOString().split("T")[0]);
  };

  const isToday = dateStr === new Date().toISOString().split("T")[0];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
      <div>
        <div className="text-emerald-400 font-medium text-xs sm:text-sm tracking-wide">{greeting} 👋</div>
        <h1 className="text-xl sm:text-3xl font-bold text-white tracking-tight mt-0.5">Your Daily Nutrition</h1>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
        {/* Edit Targets Button */}
        {onEditTargets && (
          <button
            onClick={onEditTargets}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 hover:border-emerald-500/40 border border-slate-700/60 text-slate-200 hover:text-emerald-400 transition shadow-inner text-xs font-semibold group cursor-pointer shrink-0 min-h-[38px]"
            title="Edit daily calorie & macro targets"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-400 group-hover:rotate-45 transition-transform duration-200 shrink-0" />
            <span>Targets</span>
          </button>
        )}

        {/* Date Navigator */}
        <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-800/80 border border-slate-700/60 rounded-xl p-1 sm:p-1.5 shadow-inner">
          <button
            onClick={handlePrevDay}
            className="p-1 sm:p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="Previous day"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 font-medium text-xs sm:text-sm text-slate-200 truncate">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
            <span className="truncate">{isToday ? "Today, " + formattedDate.split(", ")[1] : formattedDate}</span>
          </div>

          <button
            onClick={handleNextDay}
            className="p-1 sm:p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="Next day"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
