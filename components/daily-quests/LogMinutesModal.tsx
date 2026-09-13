"use client";

import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import type { QuestTaskView } from "@/lib/daily-quests/types";
import { formatMinutes } from "@/lib/daily-quests/dates";

/** Precision quick-log modal: +/- stepper + optional reflection note (§8.5). */
export default function LogMinutesModal({
  task,
  busy,
  onLog,
  onComplete,
  onClose,
}: {
  task: QuestTaskView;
  busy: boolean;
  onLog: (minutes: number) => Promise<void>;
  onComplete: (note?: string) => Promise<void>;
  onClose: () => void;
}) {
  const [minutes, setMinutes] = useState(15);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, saving]);

  const cap = Math.round(task.targetMinutes * 1.5);
  const room = Math.max(0, cap - task.progressMinutes);
  const step = Math.min(room, minutes);
  const reachesTarget = task.progressMinutes + minutes >= task.targetMinutes;

  const adjust = (delta: number) => {
    setMinutes((m) => Math.max(5, Math.min(1440, m + delta)));
  };

  const submit = async () => {
    if (busy || saving || step <= 0) return;
    setSaving(true);
    await onLog(step);
    if (reachesTarget) await onComplete(note.trim() || undefined);
    setSaving(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[75] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Log quest minutes"
    >
      <div className="dq-pop-in w-full sm:max-w-md bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-3xl p-6 sm:p-7 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-zinc-50">Log focused minutes</h3>
          <button
            onClick={onClose}
            disabled={saving}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center justify-center gap-4 mb-2">
          <button
            onClick={() => adjust(-15)}
            disabled={saving}
            className="w-12 h-12 rounded-2xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 flex items-center justify-center text-zinc-300 disabled:opacity-40"
            aria-label="Decrease minutes"
          >
            <Minus className="w-5 h-5" />
          </button>
          <div className="text-center min-w-[120px]">
            <div className="font-mono tabular-nums text-4xl font-black text-amber-400">{formatMinutes(minutes)}</div>
            <div className="text-[10px] text-zinc-500 mt-1">
              room left: {formatMinutes(Math.max(0, room - minutes))} (cap {formatMinutes(cap)})
            </div>
          </div>
          <button
            onClick={() => adjust(15)}
            disabled={saving}
            className="w-12 h-12 rounded-2xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 flex items-center justify-center text-zinc-300 disabled:opacity-40"
            aria-label="Increase minutes"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-center gap-2 mb-5">
          {[15, 30, 60].map((m) => (
            <button
              key={m}
              onClick={() => setMinutes(m)}
              disabled={saving}
              className="px-3 py-1.5 rounded-xl bg-zinc-800/70 hover:bg-zinc-700 border border-zinc-700 text-xs font-bold text-zinc-300 disabled:opacity-40"
            >
              +{m}m
            </button>
          ))}
        </div>

        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={140}
          placeholder="💯 Reflection note → completes as Perfect Day"
          className="w-full px-4 py-3 rounded-xl bg-zinc-950/60 border border-zinc-700/70 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/40 mb-5"
        />

        <button
          onClick={submit}
          disabled={busy || saving || step <= 0}
          className={`w-full py-3.5 rounded-2xl text-sm font-black transition-colors disabled:opacity-35 min-h-[48px] ${
            reachesTarget
              ? "bg-amber-400 hover:bg-amber-300 text-zinc-950"
              : "bg-zinc-100 hover:bg-white text-zinc-900"
          }`}
        >
          {saving ? "Saving…" : reachesTarget ? `Log ${formatMinutes(step)} & Complete Quest 🔥` : `Log ${formatMinutes(step)}`}
        </button>
      </div>
    </div>
  );
}