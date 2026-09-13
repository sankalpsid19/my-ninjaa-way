"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DaySummaryView } from "@/lib/daily-quests/types";
import { getHistory } from "@/lib/actions/daily-quest-actions";
import { addMonths, formatMinutes } from "@/lib/daily-quests/dates";
import { QUEST_TYPE_META } from "./questMeta";

function DayRow({ day, highlight }: { day: DaySummaryView; highlight: boolean }) {
  const meta = QUEST_TYPE_META[day.questType];
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl border ${
        highlight ? "bg-amber-500/10 border-amber-500/30" : "bg-zinc-950/40 border-zinc-800/70"
      }`}
    >
      <span
        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg border shrink-0"
        style={{ color: meta.color, background: `${meta.color}12`, borderColor: `${meta.color}30` }}
        aria-hidden="true"
      >
        {meta.icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-zinc-100">{day.label}</span>
          <span
            className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wide ${
              day.status === "completed"
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            {day.status === "completed" ? (day.perfectDay ? "💯 perfect" : "done") : "missed"}
          </span>
        </div>
        <div className="text-[11px] text-zinc-500 font-mono tabular-nums">
          {day.date} · {formatMinutes(day.progressMinutes)}/{formatMinutes(day.targetMinutes)}
          {day.xp > 0 && <span className="text-emerald-400"> · +{day.xp} XP</span>}
        </div>
        {day.reflectionNote && <p className="text-[11px] text-zinc-400 italic mt-0.5">&ldquo;{day.reflectionNote}&rdquo;</p>}
      </div>
    </div>
  );
}

/** History drill-down drawer: one month of day rows, opened from a heatmap cell (§8.5/§8.6). */
export default function HistoryView({
  open,
  month,
  selectedDate,
  onClose,
  onMonthChange,
}: {
  open: boolean;
  month: string;
  selectedDate: string | null;
  onClose: () => void;
  onMonthChange: (m: string) => void;
}) {
  const [days, setDays] = useState<DaySummaryView[] | null>(null);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  useEffect(() => {
    if (!open || loadedFor === month) return;
    let alive = true;
    getHistory(month).then((res) => {
      if (alive) {
        setDays(res.ok && res.days ? res.days : []);
        setLoadedFor(month);
      }
    });
    return () => {
      alive = false;
    };
  }, [open, month, loadedFor]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const visible = loadedFor === month ? (days ?? []) : [];
  const loading = loadedFor !== month;
  const done = visible.filter((d) => d.status === "completed").length;
  const xp = visible.reduce((a, d) => a + d.xp, 0);

  return (
    <div
      className="fixed inset-0 z-[75] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`History for ${month}`}
      onClick={onClose}
    >
      <div
        className="dq-pop-in w-full sm:max-w-lg max-h-[80vh] flex flex-col bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 p-5 border-b border-zinc-800/70">
          <button
            onClick={() => onMonthChange(addMonths(`${month}-01`, -1).slice(0, 7))}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h3 className="text-base font-bold text-zinc-50">
              {new Date(`${month}-01T12:00:00`).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h3>
            <p className="text-[10px] text-zinc-500 font-mono tabular-nums">
              {done} completed · {xp} XP
            </p>
          </div>
          <button
            onClick={() => onMonthChange(addMonths(`${month}-01`, 1).slice(0, 7))}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading && <p className="text-center text-sm text-zinc-500 py-8">Loading…</p>}
          {!loading && visible.length === 0 && (
            <p className="text-center text-sm text-zinc-500 py-10">
              No quests in {month}. Click a heatmap cell to drill into a day.
            </p>
          )}
          {visible.map((d) => (
            <DayRow key={d.date} day={d} highlight={d.date === selectedDate} />
          ))}
        </div>

        <div className="p-4 border-t border-zinc-800/70">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-zinc-100 hover:bg-white text-zinc-900 text-sm font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}