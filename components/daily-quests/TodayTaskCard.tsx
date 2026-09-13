"use client";

import { useState } from "react";
import { Check, Timer } from "lucide-react";
import type { LadderRungView, Pillar, QuestTaskView, QuestType } from "@/lib/daily-quests/types";
import { formatCountdown, formatMinutes } from "@/lib/daily-quests/dates";
import { rewardFor, PERFECT_DAY_BONUS } from "@/lib/daily-quests/quest-templates";
import { PILLAR_META, QUEST_TYPE_META, type StatKey } from "./questMeta";
import LogMinutesModal from "./LogMinutesModal";

const STAT_ICONS: Record<StatKey, string> = { strength: "💪", agility: "⚡", stamina: "❤️", intelligence: "🧠", sense: "👁️" };

function RewardPreview({ questType, discipline }: { questType: QuestType; discipline: QuestTaskView["discipline"] }) {
  const reward = rewardFor(questType, discipline);
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
        🎁 +{reward.xp} XP
      </span>
      {Object.entries(reward.stats).map(([k, v]) => (
        <span key={k} className="inline-flex items-center gap-1 font-semibold text-zinc-300 tabular-nums">
          +{v} {STAT_ICONS[k as StatKey]}
        </span>
      ))}
      <span className="text-zinc-500">· 💯 finish with a note → +{PERFECT_DAY_BONUS.xp} XP · +1 👁️</span>
    </div>
  );
}

export default function TodayTaskCard({
  task,
  ladder,
  rotation,
  deadlineAtIso,
  now,
  busy,
  onLog,
  onComplete,
  onPickTask,
}: {
  task: QuestTaskView;
  ladder: Record<Pillar, LadderRungView>;
  rotation: "auto" | "manual";
  deadlineAtIso: string;
  now: Date;
  busy: boolean;
  onLog: (minutes: number) => Promise<void>;
  onComplete: (note?: string) => Promise<void>;
  onPickTask: (choice: QuestType) => Promise<void>;
}) {
  const [showLog, setShowLog] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");

  const meta = QUEST_TYPE_META[task.questType];
  const percent = Math.min(100, Math.round((task.progressMinutes / Math.max(1, task.targetMinutes)) * 100));
  const over = task.progressMinutes > task.targetMinutes;
  const ladderBar = ladder[task.questType];
  const isCompleted = task.status === "completed";
  const isFailed = task.status === "failed";
  const remainingMs = new Date(deadlineAtIso).getTime() - now.getTime();
  const lowTime = remainingMs > 0 && remainingMs < 60 * 60 * 1000;

  if (isFailed) {
    return (
      <div className="rounded-3xl bg-zinc-900/50 border border-zinc-800 p-6 sm:p-8 opacity-70">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">⚰️</span>
          <div>
            <div className="text-lg font-bold text-zinc-400">{task.label}</div>
            <div className="text-sm text-zinc-500">Quest expired — the dojo closed before completion.</div>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-center">
          <div className="text-sm text-zinc-400 font-semibold">FAILED</div>
          <div className="text-xs text-zinc-600 mt-1">No XP · No stats · Streak rests</div>
        </div>
        <div className="mt-4 text-center text-sm text-zinc-500 font-medium">
          🌅 Tomorrow’s task is already waiting — fresh start at reset.
        </div>
      </div>
    );
  }

  return (
    <article className="rounded-3xl bg-zinc-900/80 border border-zinc-800 p-6 sm:p-8 relative overflow-hidden">
      <div
        className="absolute inset-x-0 top-0 h-1 transition-colors duration-700"
        style={{
          background: percent >= 100 ? "#f59e0b" : percent >= 70 ? "#fbbf24" : "#10b981",
          opacity: 0.9,
        }}
        aria-hidden="true"
      />

      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <span
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border"
            style={{ color: meta.color, background: `${meta.color}12`, borderColor: `${meta.color}33` }}
            aria-hidden="true"
          >
            {meta.icon}
          </span>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-50 tracking-tight leading-tight">{task.label}</h2>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {task.discipline && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-400 border border-zinc-700/60 capitalize">
                  {task.discipline}
                </span>
              )}
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/25">
                {PILLAR_META[task.questType].label}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" title="Exactly one task per day">
                1/1
              </span>
            </div>
          </div>
        </div>
      </div>
        {!isCompleted && (
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono tabular-nums text-sm font-semibold ${
              lowTime ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-zinc-950/40 border-zinc-700/70 text-zinc-300"
            }`}
            aria-live="polite"
          >
            <Timer className="w-4 h-4" />
            {remainingMs > 0 ? formatCountdown(remainingMs) : "rolling over…"}
          </div>
        )}
{isCompleted ? (
        <div className="text-center py-6">
          <div className="inline-block px-5 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black uppercase tracking-[0.2em] text-sm dq-pop-in">
            <span className="inline-flex items-center gap-2">
              <Check className="w-4 h-4" /> Completed
            </span>
          </div>
          <div className="mt-4 font-mono tabular-nums text-zinc-300 text-sm">
            {formatMinutes(task.progressMinutes)} / {formatMinutes(task.targetMinutes)}
          </div>
          <div className="mt-1 text-xs text-emerald-400 font-bold">+{task.awardedXp} XP earned</div>
          {task.perfectDay && (
            <div className="mt-2 inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
              💯 Perfect Day
            </div>
          )}
          {task.reflectionNote && (
            <p className="mt-3 text-sm text-zinc-400 italic max-w-md mx-auto">&ldquo;{task.reflectionNote}&rdquo;</p>
          )}
        </div>
      ) : (
        <>
          {/* Progress */}
          <div className="mb-4" aria-live="polite">
            <div className="flex items-baseline justify-between mb-2">
              <div className="font-mono tabular-nums text-2xl font-black text-zinc-100">
                {formatMinutes(task.progressMinutes)}
                <span className="text-zinc-500 text-base font-bold mx-1.5">/</span>
                <span className="text-zinc-300">{formatMinutes(task.targetMinutes)}</span>
                {over && <span className="ml-2 text-[10px] text-amber-400 font-bold uppercase align-middle">over target</span>}
              </div>
              <span className="text-xs font-bold font-mono tabular-nums text-zinc-500">{percent}%</span>
            </div>
            <div className="h-3 rounded-full bg-zinc-800/80 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${percent}%`,
                  background: percent >= 100 ? "#f59e0b" : percent >= 70 ? "#fbbf24" : "#10b981",
                }}
              />
            </div>
          </div>
{/* Ladder chip — names the source of difficulty (§4.6) */}
          {ladderBar && (
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
                🌱 Ladder {ladderBar.current}→{ladderBar.cap} min · +{ladderBar.step}m next day
              </span>
              <span className="text-[10px] text-zinc-600">
                target climbs only when days are completed · never backwards on a miss
              </span>
            </div>
          )}

          {/* Quick log */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="flex gap-2">
              {[15, 30, 60].map((m) => (
                <button
                  key={m}
                  onClick={() => onLog(m)}
                  disabled={busy}
                  className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-bold text-zinc-200 transition-colors disabled:opacity-40 min-h-[44px]"
                >
                  +{m}m
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowLog(true)}
              disabled={busy}
              className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-colors disabled:opacity-40 min-h-[44px]"
            >
              + Log
            </button>
          </div>

          {/* Rewards preview */}
          <div className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800 mb-4">
            <RewardPreview questType={task.questType} discipline={task.discipline} />
          </div>

          {/* Manual rotation — swap before starting (§4.5) */}
          {rotation === "manual" && task.progressMinutes === 0 && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-xs text-zinc-500 font-semibold">Pick today’s quest:</span>
              {(["workout", "study", "reading"] as QuestType[]).map((q) => (
                <button
                  key={q}
                  onClick={() => onPickTask(q)}
                  disabled={busy}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-bold text-zinc-200 transition-colors disabled:opacity-40"
                >
                  {QUEST_TYPE_META[q].icon} {PILLAR_META[q].label}
                </button>
              ))}
            </div>
          )}
{/* Completion with reflection → Perfect Day */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              maxLength={140}
              placeholder="💯 Reflect to complete as a Perfect Day (optional one-liner)"
              className="flex-1 px-4 py-3 rounded-xl bg-zinc-950/60 border border-zinc-700/70 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/40 min-h-[44px]"
              aria-label="Completion reflection note"
            />
            <button
              onClick={() => onComplete(noteDraft || undefined)}
              disabled={busy || percent < 100}
              className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-sm font-black transition-colors disabled:opacity-35 disabled:cursor-not-allowed min-h-[44px]"
            >
              Complete Quest
            </button>
          </div>
          {busy && <p className="mt-2 text-xs text-zinc-500">Saving…</p>}
        </>
      )}

      {showLog && (
        <LogMinutesModal
          task={task}
          busy={busy}
          onLog={onLog}
          onComplete={onComplete}
          onClose={() => setShowLog(false)}
        />
      )}
    </article>
  );
}