"use client";

import { useState } from "react";
import type { DailyBoardSnapshot } from "@/lib/daily-quests/types";
import { updateQuestSettings } from "@/lib/actions/daily-quest-actions";
import { LADDERS } from "@/lib/daily-quests/engine";
import { formatMinutes } from "@/lib/daily-quests/dates";
import { PILLAR_META } from "./questMeta";

const DEFAULT_CAPS = { workout: 120, study: 180, reading: 90 };

function StepDots({ current }: { current: number }) {
  return (
    <div className="flex justify-center gap-1.5 mb-6">
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            i === current ? "w-6 bg-amber-400" : i < current ? "w-1.5 bg-amber-700" : "w-1.5 bg-zinc-700"
          }`}
        />
      ))}
    </div>
  );
}

/** First-run 3-step wizard: role → ladder caps → reset time (§8.5). Finishes via updateQuestSettings. */
export default function OnboardingWizard({ onDone }: { onDone: (snap: DailyBoardSnapshot) => void }) {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<"student" | "adult">("student");
  const [caps, setCaps] = useState({ ...DEFAULT_CAPS });
  const [resetHour, setResetHour] = useState(23);
  const [saving, setSaving] = useState(false);

  const finish = async () => {
    if (saving) return;
    setSaving(true);
    const res = await updateQuestSettings({
      role,
      rotation: "auto",
      workoutCapMinutes: Math.max(LADDERS.workout.base, caps.workout),
      studyCapMinutes: Math.max(LADDERS.study.base, caps.study),
      readingCapMinutes: Math.max(LADDERS.reading.base, caps.reading),
      heavyDayMultiplier: 1.25,
      resetHour,
    });
    setSaving(false);
    if (res.ok && res.snapshot) onDone(res.snapshot);
  };

  return (
    <div className="max-w-xl mx-auto p-6 sm:p-10 rounded-3xl bg-zinc-900/80 border border-zinc-800 text-center">
      <div className="text-5xl mb-3" aria-hidden="true">
        🥷
      </div>
      <h1 className="text-2xl sm:text-3xl font-black text-zinc-50 tracking-tight">Welcome to the Dojo</h1>
      <p className="text-sm text-zinc-400 mt-2 mb-8 max-w-md mx-auto">
        One quest per day. Complete it before the dojo closes and you earn XP, stats, streaks &amp; badges — consistency is the engine.
      </p>

      <StepDots current={step} />

      {step === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left" role="radiogroup" aria-label="Choose your path">
          {(["student", "adult"] as const).map((r) => (
            <button
              key={r}
              role="radio"
              aria-checked={role === r}
              onClick={() => setRole(r)}
              className={`p-5 rounded-2xl border text-left transition-colors ${
                role === r ? "bg-amber-500/10 border-amber-500/40" : "bg-zinc-950/40 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="text-3xl mb-2">{r === "student" ? "🎓" : "💼"}</div>
              <div className="font-bold text-zinc-100">{r === "student" ? "I'm a Student" : "I'm an Adult"}</div>
              <div className="text-xs text-zinc-500 mt-1">
                {r === "student" ? "Study days: Deep Study blocks (1h → 3h)" : "Reading days: book-reading hours (30m → 1h30m)"}
              </div>
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 text-left">
          <p className="text-sm text-zinc-400">
            Optional — set the <span className="text-amber-300 font-semibold">most you’d ever want</span> per pillar. Your targets start
            beginner-easy and climb a tiny step each completed day until the cap.
          </p>
          {(["workout", "study", "reading"] as const).map((key) => (
            <div key={key} className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-zinc-200">
                  {PILLAR_META[key].icon} {PILLAR_META[key].label}
                </span>
                <span className="font-mono tabular-nums text-sm font-bold text-amber-400">{formatMinutes(caps[key])}</span>
              </div>
              <input
                type="range"
                min={LADDERS[key].base}
                max={key === "study" ? 360 : key === "reading" ? 180 : 240}
                step={15}
                value={caps[key]}
                onChange={(e) => setCaps((c) => ({ ...c, [key]: Number(e.target.value) }))}
                className="w-full accent-amber-400"
                aria-label={`${PILLAR_META[key].label} cap`}
              />
              <div className="flex justify-between text-[10px] text-zinc-600 font-mono">
                <span>day 1: {formatMinutes(LADDERS[key].base)}</span>
                <span>cap</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="text-left space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 block mb-2">Daily reset — the dojo closes at</label>
            <select
              value={resetHour}
              onChange={(e) => setResetHour(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-2xl bg-zinc-950/60 border border-zinc-700/70 text-sm text-zinc-200 focus:outline-none focus:border-amber-500/40"
            >
              {Array.from({ length: 23 }, (_, i) => i + 1).map((h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, "0")}:59 {h >= 12 ? "PM" : "AM"} {h === 23 ? "— night owl" : h === 5 ? "— early bird" : ""}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-zinc-500 mt-2">
              Miss the deadline and the day is recorded as failed — no XP, streak rests, and a fresh task starts at reset.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800 text-sm">
            <div className="font-bold text-zinc-200 mb-2">Your Day-1 board</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {(["workout", "study", "reading"] as const).map((key) => (
                <div key={key} className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <div className="text-lg">{PILLAR_META[key].icon}</div>
                  <div className="text-[10px] text-zinc-500 mt-1">{formatMinutes(LADDERS[key].base)} starting</div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-zinc-500 mt-2 text-center">
              {role === "student" ? "🎓 Student path — Study days 1h → " : "💼 Adult path — Reading days 30m → "}
              {formatMinutes(caps[role === "student" ? "study" : "reading"])} cap
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-8">
        {step > 1 ? (
          <button
            onClick={() => setStep(step - 1)}
            disabled={saving}
            className="px-5 py-3 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-sm font-bold text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            ← Back
          </button>
        ) : (
          <span />
        )}
        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-sm font-black transition-colors"
          >
            Continue →
          </button>
        ) : (
          <button
            onClick={finish}
            disabled={saving}
            className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-sm font-black transition-colors disabled:opacity-40"
          >
            {saving ? "Entering the dojo…" : "🥷 Begin Training"}
          </button>
        )}
      </div>
    </div>
  );
}