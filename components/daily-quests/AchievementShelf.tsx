"use client";

import { useEffect, useState } from "react";
import type { AchievementView } from "@/lib/daily-quests/types";
import { getAchievements } from "@/lib/actions/daily-quest-actions";

/** Badge shelf: catalogue + unlocked state (§5.3). Refetches when refreshKey bumps. */
export default function AchievementShelf({ refreshKey }: { refreshKey: number }) {
  const [achievements, setAchievements] = useState<AchievementView[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    getAchievements().then((res) => {
      if (alive && res.ok && res.achievements) setAchievements(res.achievements);
      if (alive) setLoaded(true);
    });
    return () => {
      alive = false;
    };
  }, [refreshKey]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Achievements</h3>
        <span className="text-[10px] font-mono tabular-nums text-amber-400 font-bold">
          {unlockedCount}/{achievements.length}
        </span>
      </div>

      {!loaded ? (
        <p className="text-center text-xs text-zinc-500 py-6">Loading badges…</p>
      ) : (
        <div className="grid grid-cols-5 gap-2">
          {achievements.map((a) => (
            <div
              key={a.code}
              title={`${a.name} — ${a.description}${a.unlocked && a.unlockedAt ? `\nUnlocked ${new Date(a.unlockedAt).toLocaleDateString()}` : "\nLocked — keep training!"}`}
              className={`relative flex items-center justify-center aspect-square rounded-2xl border text-xl transition-transform ${
                a.unlocked
                  ? "bg-amber-500/10 border-amber-500/30 hover:scale-105"
                  : "bg-zinc-950/50 border-zinc-800 grayscale opacity-40"
              }`}
            >
              <span aria-hidden="true">{a.icon}</span>
              {!a.unlocked && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 text-[9px] text-zinc-400 flex items-center justify-center">
                  🔒
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}