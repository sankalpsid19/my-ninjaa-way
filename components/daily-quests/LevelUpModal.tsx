"use client";

import { useEffect } from "react";
import type { AchievementView } from "@/lib/daily-quests/types";

const CONFETTI_COLORS = ["#f59e0b", "#ef4444", "#22d3ee", "#22c55e", "#a78bfa", "#f43f5e"];

// Deterministic pseudo-random particles (pure — no Math.random during render).
const CONFETTI = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: (i * 37 + 11) % 100,
  delay: ((i * 7) % 10) / 10,
  duration: 2.6 + ((i * 13) % 24) / 10,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  w: 5 + (i % 4) * 2,
  h: 8 + ((i * 3) % 4) * 2,
}));

function Confetti() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {CONFETTI.map((p) => (
        <span
          key={p.id}
          className="dq-confetti"
          style={{
            left: `${p.left}%`,
            width: p.w,
            height: p.h,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

/** Full-screen level-up celebration with confetti + new badge chips. */
export default function LevelUpModal({
  levelBefore,
  levelAfter,
  newAchievements,
  xpGained,
  onClose,
}: {
  levelBefore: number;
  levelAfter: number;
  newAchievements: AchievementView[];
  xpGained?: number;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Level up! You reached level ${levelAfter}`}
    >
      <Confetti />
      <div className="dq-pop-in relative w-full max-w-md bg-zinc-900 border border-amber-500/30 rounded-3xl p-8 text-center shadow-2xl shadow-amber-500/10">
        <div className="text-5xl mb-2">🎊</div>
        <div className="text-xs uppercase tracking-[0.3em] text-amber-400 font-bold">Level Up!</div>
        <div className="mt-3 flex items-center justify-center gap-4">
          <span className="text-5xl font-black text-zinc-500 font-mono tabular-nums line-through decoration-zinc-600">
            {levelBefore}
          </span>
          <span className="text-2xl font-black text-amber-400">➜</span>
          <span className="text-6xl font-black text-amber-400 font-mono tabular-nums dq-pop-in">{levelAfter}</span>
        </div>
        {xpGained != null && xpGained > 0 && (
          <p className="mt-4 text-sm text-zinc-300 font-medium">
            Quest rewards minted: <span className="text-emerald-400 font-mono tabular-nums">+{xpGained} XP</span>
          </p>
        )}
        {newAchievements.length > 0 && (
          <div className="mt-5">
            <div className="text-[11px] uppercase tracking-widest text-zinc-500 font-semibold mb-2">New badge earned</div>
            <div className="flex flex-wrap justify-center gap-2">
              {newAchievements.map((a) => (
                <span
                  key={a.code}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold"
                  style={{ borderColor: `${a.color}55`, color: a.color, background: `${a.color}14` }}
                >
                  <span>{a.icon}</span> {a.name}
                </span>
              ))}
            </div>
          </div>
        )}
        <button
          onClick={onClose}
          className="mt-7 w-full py-3 px-6 rounded-2xl text-sm font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-lg shadow-amber-500/20"
        >
          CONTINUE
        </button>
      </div>
    </div>
  );
}