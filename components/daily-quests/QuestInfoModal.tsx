"use client";

import { useEffect } from "react";
import type { QuestTaskView } from "@/lib/daily-quests/types";
import { formatCountdown, formatMinutes } from "@/lib/daily-quests/dates";
import { formatExerciseAmount } from "@/lib/daily-quests/workout-plan";

export default function QuestInfoModal({
  task,
  remainingMs,
  onClose,
}: {
  task: QuestTaskView;
  remainingMs: number;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quest-info-title"
    >
      <section className="dq-pop-in max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-amber-500/30 bg-zinc-900 p-6 shadow-2xl sm:p-8">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">Quest briefing</p>
            <h2 id="quest-info-title" className="mt-1 text-2xl font-black text-zinc-50">{task.label}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            aria-label="Close quest briefing"
          >
            ✕
          </button>
        </div>

        <p className="mb-5 text-sm leading-relaxed text-zinc-300">{task.description}</p>

        <div className="mb-5 flex flex-col gap-2 rounded-2xl border border-zinc-700 bg-zinc-950/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Time remaining</p>
            <p className="mt-1 font-mono text-xl font-bold tabular-nums text-amber-300">
              {remainingMs > 0 ? formatCountdown(remainingMs) : "Quest expired"}
            </p>
          </div>
          <span className="text-xs text-zinc-500 sm:text-right">Resets at the daily dojo close</span>
        </div>

        {task.questType === "workout" ? (
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-400">Workout objectives</h3>
            <ul className="space-y-2">
              {task.workoutExercises.map((exercise) => (
                <li key={exercise.id} className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-zinc-100">{exercise.name}</span>
                    <span className="whitespace-nowrap font-mono text-sm font-bold text-amber-300">
                      {formatExerciseAmount(exercise.progress, exercise.unit)} / {formatExerciseAmount(exercise.target, exercise.unit)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">{exercise.instruction}</p>
                </li>
              ))}
            </ul>
            {task.discipline === "endurance" && (
              <p className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs leading-relaxed text-emerald-200/80">
                The popular 100 push-ups, 100 sit-ups, 100 squats and 10 km run is an advanced challenge, not a required baseline. Build toward it gradually; scale or stop if anything hurts.
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-700 bg-zinc-950/60 p-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Objective and progress</h3>
            <p className="mt-2 text-sm text-zinc-200">Complete a focused {task.questType} session.</p>
            <p className="mt-2 font-mono text-sm font-bold text-amber-300">
              {formatMinutes(task.progressMinutes)} / {formatMinutes(task.targetMinutes)}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-6 min-h-12 w-full rounded-2xl bg-amber-400 px-5 py-3 text-sm font-black text-zinc-950 transition-colors hover:bg-amber-300"
        >
          Got it — start quest
        </button>
      </section>
    </div>
  );
}
