"use client";

import { STAT_LABELS, STAT_ICONS, type StatKey } from "./questMeta";
import type { PlayerStatsView } from "@/lib/daily-quests/types";

const ORDER: StatKey[] = ["agility", "strength", "stamina", "intelligence", "sense"];

function softValue(v: number): number {
  return Math.min(1, v / Math.max(70, v * 1.18));
}

function pointAt(cx: number, cy: number, radius: number, angleDeg: number): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

/** Stat radar / hexagon visualization (5 gauges, normalized to a soft tier cap). */
export default function StatHexagon({
  stats,
  size = 200,
  glow = false,
}: {
  stats: PlayerStatsView;
  size?: number;
  glow?: boolean;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 22;
  const values = ORDER.map((k) => stats[k]);
  const pts = values.map((v, i) => pointAt(cx, cy, maxR * softValue(v), (360 / ORDER.length) * i));
  const fullHex = ORDER.map((_, i) => pointAt(cx, cy, maxR, (360 / ORDER.length) * i)).map(
    (p) => `${p.x},${p.y}`,
  );
  const rings = [0.25, 0.5, 0.75, 1].map((frac) =>
    ORDER.map((_, i) => pointAt(cx, cy, maxR * frac, (360 / ORDER.length) * i)).map((p) => `${p.x},${p.y}`),
  );
  const poly = pts.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} role="img" aria-label="Stat radar">
        {rings.map((ring, i) => (
          <polygon key={i} points={ring.join(" ")} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
        ))}
        <polygon
          points={fullHex.join(" ")}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        <polygon
          points={poly}
          fill={"rgba(245,158,11,0.14)"}
          stroke={"#f59e0b"}
          strokeWidth={2}
          strokeLinejoin="round"
          className={glow ? "drop-shadow-[0_0_12px_rgba(245,158,11,0.45)] transition-all duration-500" : "transition-all duration-500"}
        />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={2.5} fill={STAT_LABELS[ORDER[i]].color} />
        ))}
      </svg>
      <div className="absolute inset-0 pointer-events-none">
        {ORDER.map((k, i) => {
          const p = pointAt(cx, cy, maxR + 16, (360 / ORDER.length) * i);
          const meta = STAT_LABELS[k];
          return (
            <div
              key={k}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
              style={{ left: p.x, top: p.y }}
              title={`${meta.label}: ${stats[k]} pts — ${meta.blurb}`}
            >
              <div className="text-sm leading-none">{STAT_ICONS[k]}</div>
              <div className="text-[8px] font-semibold mt-0.5" style={{ color: meta.color }}>
                {meta.label}
              </div>
              <div className="text-[9px] font-bold font-mono tabular-nums" style={{ color: meta.color }}>
                {stats[k]}
              </div>
              <div className="text-[7px] text-zinc-600 leading-tight max-w-[52px]">
                {meta.blurb}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}