import React from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface NutritionHeaderProps {
  dateStr: string;
  setDateStr: (d: string) => void;
}

export const NutritionHeader: React.FC<NutritionHeaderProps> = ({ dateStr, setDateStr }) => {
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div>
        <div className="text-emerald-400 font-medium text-sm tracking-wide">{greeting} 👋</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-0.5">Your Daily Nutrition</h1>
      </div>

      <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-xl p-1.5 self-start sm:self-auto shadow-inner">
        <button
          onClick={handlePrevDay}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition"
          title="Previous day"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2 px-3 py-1 font-medium text-sm text-slate-200">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span>{isToday ? "Today, " + formattedDate.split(", ")[1] : formattedDate}</span>
        </div>

        <button
          onClick={handleNextDay}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition"
          title="Next day"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
