"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import type { DailyBoardSnapshot } from "@/lib/daily-quests/types";
import { updateQuestSettings } from "@/lib/actions/daily-quest-actions";
import { LADDERS } from "@/lib/daily-quests/engine";
import { formatMinutes } from "@/lib/daily-quests/dates";

function Stepper({
  value,
  onChange,
  min,
  max,
  step,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(min, value - step))}
        className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 flex items-center justify-center text-zinc-300"
        aria-label="Decrease"
      >
        <Minus className="w-4 h-4" />
      </button>
      <div className="text-center min-w-[72px] font-mono tabular-nums text-sm font-bold text-amber-400">
        {formatMinutes(value)}
      </div>
      <button
        onClick={() => onChange(Math.min(max, value + step))}
        className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 flex items-center justify-center text-zinc-300"
        aria-label="Increase"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}

/** Quest settings panel (§4.5/§8.1). Caps are floored at the pillar base server-side. */
export default function SettingsPanel({
  profile,
  onSaved,
  onClose,
  notify,
}: {
  profile: DailyBoardSnapshot["profile"];
  onSaved: (snap: DailyBoardSnapshot) => void;
  onClose: () => void;
  notify: (message: string, kind: "success" | "error") => void;
}) {
  const [role, setRole] = useState<"student" | "adult">(profile.role);
  const [rotation, setRotation] = useState<"auto" | "manual">(profile.rotation);
  const [workoutCap, setWorkoutCap] = useState(profile.workoutCapMinutes);
  const [studyCap, setStudyCap] = useState(profile.studyCapMinutes);
  const [readingCap, setReadingCap] = useState(profile.readingCapMinutes);
  const [heavy, setHeavy] = useState(profile.heavyDayMultiplier);
  const [resetHour, setResetHour] = useState(profile.resetHour);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (saving) return;
    setSaving(true);
    const res = await updateQuestSettings({
      role,
      rotation,
      workoutCapMinutes: Math.max(LADDERS.workout.base, workoutCap),
      studyCapMinutes: Math.max(LADDERS.study.base, studyCap),
      readingCapMinutes: Math.max(LADDERS.reading.base, readingCap),
      heavyDayMultiplier: heavy,
      resetHour,
    });
    setSaving(false);
    if (res.ok && res.snapshot) {
      onSaved(res.snapshot);
      notify("Settings saved — the dojo recalibrates from tomorrow.", "success");
    } else {
      notify(res.reason ?? "Failed to save settings.", "error");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[75] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Quest settings"
    >
      <div className="dq-pop-in w-full sm:max-w-lg max-h-[85vh] flex flex-col bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-zinc-800/70">
          <h3 className="text-base font-bold text-zinc-50">⚙️ Dojo Settings</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 block mb-2">Your path</label>
            <div className="grid grid-cols-2 gap-2">
              {(["student", "adult"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`px-4 py-3 rounded-2xl border text-sm font-bold transition-colors ${
                    role === r
                      ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                      : "bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  {r === "student" ? "🎓 Student — study 1h→3h" : "💼 Adult — read 30m→1.5h"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 block mb-2">Rotation</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setRotation("auto")}
                className={`px-4 py-3 rounded-2xl border text-sm font-bold transition-colors ${
                  rotation === "auto"
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                    : "bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                📅 Auto — weekday rhythm
              </button>
              <button
                onClick={() => setRotation("manual")}
                className={`px-4 py-3 rounded-2xl border text-sm font-bold transition-colors ${
                  rotation === "manual"
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                    : "bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                🎯 Manual — I pick before starting
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 block mb-1">
              Consistency Ladder caps (the most you’d ever want)
            </label>
            <p className="text-[11px] text-zinc-600 mb-3">Difficulty climbs in tiny fixed steps from the base — never a slider.</p>
            <div className="space-y-3">
              {(
                [
                  { key: "workout", label: "⚔️ Workout", value: workoutCap, set: setWorkoutCap, max: 240 },
                  { key: "study", label: "📚 Study", value: studyCap, set: setStudyCap, max: 360 },
                  { key: "reading", label: "📖 Reading", value: readingCap, set: setReadingCap, max: 180 },
                ] as const
              ).map((c) => (
                <div key={c.key} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-zinc-300 font-medium">{c.label}</span>
                  <Stepper value={c.value} onChange={c.set} min={LADDERS[c.key].base} max={c.max} step={15} />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 block mb-2">
                Heavy-day multiplier
              </label>
              <select
                value={heavy}
                onChange={(e) => setHeavy(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-950/60 border border-zinc-700/70 text-sm text-zinc-200 focus:outline-none focus:border-amber-500/40"
              >
                {[1, 1.1, 1.25, 1.5, 1.75, 2].map((m) => (
                  <option key={m} value={m}>
                    ×{m.toFixed(2)}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-zinc-600 mt-1">Saturday Endurance day</p>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 block mb-2">Daily reset hour</label>
              <select
                value={resetHour}
                onChange={(e) => setResetHour(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-950/60 border border-zinc-700/70 text-sm text-zinc-200 focus:outline-none focus:border-amber-500/40"
              >
                {Array.from({ length: 23 }, (_, i) => i + 1).map((h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, "0")}:59 — {h >= 12 ? "PM" : "AM"} deadline
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-zinc-600 mt-1">The dojo closes at {String(resetHour).padStart(2, "0")}:59 local.</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-zinc-800/70 flex gap-2">
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-sm font-bold text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-sm font-black transition-colors disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}