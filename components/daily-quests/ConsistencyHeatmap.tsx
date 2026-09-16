"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ConsistencyCellView, ConsistencyView, LadderRungView, Pillar } from "@/lib/daily-quests/types";
import { getConsistency } from "@/lib/actions/daily-quest-actions";
import { parseDayKey, monthKey, formatMinutes } from "@/lib/daily-quests/dates";
import { PILLAR_META, QUEST_TYPE_META } from "./questMeta";

const CELL = 16;
const GAP = 3;
const ROWS = 7;
const DOW_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CELL_STYLE: Record<string, { bg: string; ring?: string }> = {
  none: { bg: "transparent" },
  failed: { bg: "#ef4444" },
  completed: { bg: "#16a34a" },
  perfect: { bg: "#f59e0b" },
  active: { bg: "#f59e0b", ring: "rgba(245,158,11,0.6)" },
};

type FilterKey = "all" | "workout" | "study" | "reading" | "perfect";
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "workout", label: "⚔️ Workout" },
  { key: "study", label: "📚 Study" },
  { key: "reading", label: "📖 Reading" },
  { key: "perfect", label: "💯 Perfect" },
];

function LadderMeter({ pillar, rung }: { pillar: Pillar; rung: LadderRungView }) {
  const span = Math.max(1, rung.cap - rung.base);
  const pos = Math.max(0, Math.min(1, (rung.current - rung.base) / span));
  const meta = PILLAR_META[pillar];
  return (
    <div className="flex items-center gap-3" title={`${meta.label}: target ${formatMinutes(rung.current)} of cap ${formatMinutes(rung.cap)}`}>
      <span className="w-16 shrink-0 text-[11px] font-semibold text-zinc-400">{meta.icon} {formatMinutes(rung.base)}→{formatMinutes(rung.cap)}</span>
      <div className="relative flex-1 h-2 rounded-full bg-zinc-800/80">
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-zinc-950"
          style={{ left: `calc(${pos * 100}% - 7px)`, background: meta.color }}
        />
      </div>
      <span className="w-12 shrink-0 text-right font-mono tabular-nums text-[11px] font-bold text-zinc-300">
        {formatMinutes(rung.current)}
      </span>
    </div>
  );
}

/** GitHub-style consistency heatmap over the snapshot range + ladder meters (§8.7). */
export default function ConsistencyHeatmap({
  consistency: initial,
  ladder,
  onCellClick,
}: {
  consistency: ConsistencyView;
  ladder: Record<Pillar, LadderRungView>;
  onCellClick: (cell: ConsistencyCellView) => void;
}) {
  const [consistency, setConsistency] = useState(initial);
  const [filter, setFilter] = useState<FilterKey>("all");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    getConsistency(12).then((res) => {
      if (alive && res.ok && res.consistency) setConsistency(res.consistency);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Scroll to the latest week whenever data changes (default view lands on current week).
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [consistency.cells.length]);

  const layout = useMemo(() => {
    const firstDow = parseDayKey(consistency.from).getDay();
    const cols = Math.ceil((consistency.cells.length + firstDow) / ROWS);
    const months: { label: string; start: number; span: number }[] = [];
    consistency.cells.forEach((c, i) => {
      const col = Math.floor((i + firstDow) / ROWS);
      const label = monthKey(c.date);
      const prev = months[months.length - 1];
      if (!prev || prev.label !== label) months.push({ label, start: col, span: 1 });
      else prev.span += 1;
    });
    return { firstDow, cols, months };
  }, [consistency]);

  const width = layout.cols * CELL + Math.max(0, layout.cols - 1) * GAP;

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-1">
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Consistency</h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[11px] text-zinc-500">score</span>
          <span className={`font-mono tabular-nums font-black text-base ${consistency.score >= 70 ? "text-emerald-400" : consistency.score >= 40 ? "text-amber-400" : "text-zinc-400"}`}>
            {consistency.score}%
          </span>
        </div>
      </div>
      <p className="text-[11px] text-zinc-600 mb-3">
        {consistency.completedDays} completed · {consistency.daysSinceStart} days alive · 💯 counts double
      </p>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
              filter === f.key
                ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                : "bg-zinc-950/40 border-zinc-800 text-zinc-500 hover:border-zinc-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Heatmap grid */}
      <div ref={scrollRef} className="overflow-x-auto pb-2 -mx-1 px-1" dir="ltr">
        <div className="inline-block">
          {/* Month labels row */}
          <div
            className="grid mb-1"
            style={{ gridTemplateColumns: `repeat(${layout.cols}, ${CELL}px)`, columnGap: GAP }}
          >
            {layout.months.map((m, i) => (
              <div
                key={i}
                className="h-3 text-[8px] font-bold uppercase tracking-wide text-zinc-500 overflow-hidden whitespace-nowrap"
                style={{ gridColumn: `${m.start + 1} / span ${m.span}` }}
              >
                {m.label}
              </div>
            ))}
          </div>
          <div className="flex">
            {/* Weekday labels */}
            <div className="grid mr-1.5" style={{ gridTemplateRows: `repeat(7, ${CELL}px)`, rowGap: GAP }}>
              {DOW_LABELS.map((d) => (
                <div key={d} className="text-[8px] font-semibold uppercase text-zinc-600 flex items-center">
                  {d}
                </div>
              ))}
            </div>

            {/* Cells */}
            <div
              className="grid"
              style={{
                gridTemplateRows: `repeat(7, ${CELL}px)`,
                gridAutoFlow: "column",
                gridAutoColumns: `${CELL}px`,
                rowGap: GAP,
                columnGap: GAP,
                width,
              }}
            >
              {consistency.cells.map((c, i) => {
                const col = Math.floor((i + layout.firstDow) / ROWS);
                const row = (i + layout.firstDow) % ROWS;
                const style = CELL_STYLE[c.status] ?? CELL_STYLE.none;
                const dim = filter !== "all" && !(filter === "perfect" ? c.perfectDay : c.questType === filter);
                const qMeta = c.questType ? QUEST_TYPE_META[c.questType] : null;
                return (
                  <button
                    key={c.date}
                    onClick={() => onCellClick(c)}
                    aria-label={`${c.date} — ${c.status === "none" ? "no quest" : `${c.status === "failed" ? "missed" : c.status}${qMeta ? ` ${qMeta.label}` : ""}${c.xp ? `, +${c.xp} XP` : ""}`}`}
                    title={`${c.date}${qMeta ? ` · ${qMeta.label}` : ""}${c.status !== "none" ? ` · ${c.status === "failed" ? "missed" : c.status}${c.xp ? ` · +${c.xp} XP` : ""}` : " · no quest"}`}
                    className="rounded-[3px] transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
                    style={{
                      gridColumn: col + 1,
                      gridRow: row + 1,
                      width: CELL,
                      height: CELL,
                      background: c.status === "none" ? "transparent" : style.bg,
                      outline: c.status === "none" ? "1px dashed rgba(255,255,255,0.08)" : "none",
                      boxShadow: c.status === "active" ? `0 0 0 1.5px ${style.ring}` : "none",
                      opacity: dim ? 0.18 : 1,
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-2 text-[9px] text-zinc-500">
            <span>less</span>
            {[{ k: "none", label: "empty" }, { k: "failed", label: "missed" }, { k: "completed", label: "done" }, { k: "perfect", label: "💯 perfect" }, { k: "active", label: "today" }].map((l) => (
              <span key={l.k} className="inline-flex items-center gap-0.5">
                <span
                  className="w-3 h-3 rounded-[2px] border border-zinc-700/50"
                  style={{
                    background: l.k === "none" ? "transparent" : CELL_STYLE[l.k]?.bg,
                    boxShadow: l.k === "active" ? "0 0 0 1px rgba(245,158,11,0.6)" : "none",
                  }}
                />
                {l.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Ladder meters — a rail advances exactly when a heatmap cell turns green (§4.6) */}
      <div className="mt-4 pt-3 border-t border-zinc-800/70 space-y-2.5">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Consistency Ladder</h4>
        {(["workout", "study", "reading"] as Pillar[]).map((p) => (
          <LadderMeter key={p} pillar={p} rung={ladder[p]} />
        ))}
      </div>
    </div>
  );
}