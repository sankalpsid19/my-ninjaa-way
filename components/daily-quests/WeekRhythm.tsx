"use client";

import { WEEKDAY_RHYTHM } from "@/lib/daily-quests/quest-templates";
import { PILLAR_META } from "./questMeta";

const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon..Sun
const DOW_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Mon–Sun strip showing which pillar each weekday trains. Today gets a gold ring. */
export default function WeekRhythm({ todayDow }: { todayDow: number }) {
  return (
    <div className="p-4 rounded-3xl bg-zinc-900/80 border border-zinc-800">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Weekly Rhythm</h3>
        <span className="text-[10px] text-zinc-600">one task per day</span>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {DISPLAY_ORDER.map((dow, i) => {
          const slot = WEEKDAY_RHYTHM[dow];
          const isToday = dow === todayDow;
          const meta = PILLAR_META[slot.questType];
          return (
            <div
              key={dow}
              className={`flex flex-col items-center gap-1 rounded-2xl border px-1 py-2.5 transition-colors ${
                isToday
                  ? "bg-amber-500/10 border-amber-500/40 dq-pulse-ring"
                  : "bg-zinc-950/40 border-zinc-800/80 hover:border-zinc-700"
              }`}
              title={`${DOW_LABELS[i]} — ${meta.label}${slot.heavy ? " (Heavy)" : ""}`}
            >
              <span className={`text-[9px] font-bold uppercase tracking-wide ${isToday ? "text-amber-400" : "text-zinc-500"}`}>
                {DOW_LABELS[i]}
              </span>
              <span className="text-lg leading-none" style={{ color: meta.color }}>
                {slot.questType === "workout" ? "⚔️" : slot.questType === "study" ? "📚" : "📖"}
              </span>
              {slot.heavy && <span className="text-[8px] text-orange-400 font-semibold -mt-1">HEAVY</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}