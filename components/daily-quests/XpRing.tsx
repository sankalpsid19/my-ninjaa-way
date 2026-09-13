"use client";

import { xpNeededForLevel } from "@/lib/daily-quests/engine";

function xpInLevel(xp: number, level: number): number {
  let rem = Math.max(0, xp);
  for (let l = 1; l < level; l += 1) rem -= xpNeededForLevel(l);
  return Math.max(0, rem);
}

/** Circular Level + XP ring. Ring fills toward the next level. */
export default function XpRing({ xp, level }: { xp: number; level: number }) {
  const size = 148;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const need = xpNeededForLevel(level);
  const have = Math.min(need, xpInLevel(xp, level));
  const frac = Math.min(1, have / Math.max(1, need));
  const offset = circ * (1 - frac);

  return (
    <div className="relative w-[148px] h-[148px] mx-auto" role="img" aria-label={`Level ${level}, ${have}/${need} XP`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] uppercase tracking-[0.25em] text-amber-500/80 font-semibold">Level</span>
        <span className="text-4xl font-black text-amber-400 font-mono tabular-nums leading-none my-1">{level}</span>
        <span className="text-[11px] text-zinc-400 font-mono tabular-nums">
          {have}/{need} XP
        </span>
      </div>
    </div>
  );
}