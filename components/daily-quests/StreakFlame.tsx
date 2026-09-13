"use client";

import { Flame } from "lucide-react";

/** Streak counter with a pulsing flame (gold when alive, dimmed at 0). */
export default function StreakFlame({ streak, bestStreak }: { streak: number; bestStreak: number }) {
  const alive = streak > 0;
  return (
    <div className="flex items-center justify-center gap-3">
      <div
        className={`relative flex items-center justify-center w-12 h-12 rounded-2xl border transition-colors ${
          alive
            ? "bg-orange-500/15 border-orange-500/30 dq-pulse-ring"
            : "bg-zinc-800/60 border-zinc-700/60 grayscale opacity-60"
        }`}
        aria-hidden="true"
      >
        <Flame className={`w-6 h-6 ${alive ? "text-orange-400" : "text-zinc-500"}`} />
      </div>
      <div className="text-left leading-tight">
        <div className="flex items-baseline gap-1.5">
          <span className={`text-2xl font-black font-mono tabular-nums ${alive ? "text-orange-400" : "text-zinc-500"}`}>
            {streak}
          </span>
          <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">day streak</span>
        </div>
        <div className="text-[11px] text-zinc-400">Best: {bestStreak} 🔥</div>
      </div>
    </div>
  );
}