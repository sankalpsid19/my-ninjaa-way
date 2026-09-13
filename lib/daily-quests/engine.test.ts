// Unit tests for the pure Daily Quests engine core.
// Run: pnpm test  (uses tsx + node:test — no extra deps)

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  computeLadderTarget,
  applyEaseBack,
  computeTodayTask,
  xpNeededForLevel,
  levelFromXp,
  applyXP,
  applyStreak,
  getConsistencyScore,
  evaluatePredicate,
  calcMissedDays,
} from "./engine";
import type { QuestSettings } from "./types";

const baseSettings: QuestSettings = {
  role: "adult",
  rotation: "auto",
  workoutCapMinutes: 120,
  studyCapMinutes: 180,
  readingCapMinutes: 90,
  heavyDayMultiplier: 1.25,
  resetHour: 23,
};

// --- §4.6 Ladder target ---
test("computeLadderTarget: starts at base, +step per completed quest, capped", () => {
  assert.equal(computeLadderTarget("workout", 0), 45);
  assert.equal(computeLadderTarget("workout", 1), 47);
  assert.equal(computeLadderTarget("workout", 3), 51);
  assert.equal(computeLadderTarget("workout", 100), 120); // hard cap
  assert.equal(computeLadderTarget("study", 0), 60);
  assert.equal(computeLadderTarget("reading", 2), 32);
  assert.equal(computeLadderTarget("reading", 100, 90), 90);
  assert.equal(computeLadderTarget("study", 5, 30), 30); // cap override clamps
});

// --- §4.6 Ease-back ---
test("applyEaseBack: eases back 1 step per missed week, floored at base", () => {
  assert.equal(applyEaseBack("workout", 49, 6), 49); // < 7 days → no easing
  assert.equal(applyEaseBack("workout", 49, 7), 47); // 1 missed week → 1 step
  assert.equal(applyEaseBack("workout", 60, 14), 56); // 2 missed weeks
  assert.equal(applyEaseBack("workout", 45, 30), 45); // floored at workout base 45
  assert.equal(applyEaseBack("reading", 32, 7), 31); // reading step = 1
  assert.equal(applyEaseBack("reading", 30, 21), 30); // floored at reading base 30
});

// --- §4.2 Weekday rhythm ---
test("computeTodayTask: Mon = Workout Strength, base target", () => {
  const mon = new Date(2026, 8, 7, 10, 0, 0); // Sep 7 2026 = Monday
  const t = computeTodayTask(mon, baseSettings, { completedByPillar: { workout: 0, study: 0, reading: 0 }, missesStreakDays: 0 });
  assert.equal(t.questType, "workout");
  assert.equal(t.discipline, "strength");
  assert.equal(t.heavy, false);
  assert.equal(t.targetMinutes, 45);
});

test("computeTodayTask: Sat = Heavy Day Endurance · 1.25 × ladder target, capped", () => {
  const sat = new Date(2026, 8, 12, 9, 0, 0); // Sat
  const t = computeTodayTask(sat, baseSettings, { completedByPillar: { workout: 0, study: 0, reading: 0 }, missesStreakDays: 0 });
  assert.equal(t.questType, "workout");
  assert.equal(t.discipline, "endurance");
  assert.equal(t.heavy, true);
  assert.equal(t.targetMinutes, 56); // round(45 × 1.25)

  // Capped: many completed workouts → ladder 120 (cap) → heavy = min(120, round(120×1.25)) = 120
  const t2 = computeTodayTask(sat, baseSettings, { completedByPillar: { workout: 50, study: 0, reading: 0 }, missesStreakDays: 0 });
  assert.equal(t2.targetMinutes, 120);
});

test("computeTodayTask: adult role → reading on Sun/Tue/Thu, student → study", () => {
  const sun = new Date(2026, 8, 13, 9, 0, 0);
  const adult = computeTodayTask(sun, baseSettings, { completedByPillar: { workout: 0, study: 0, reading: 0 }, missesStreakDays: 0 });
  assert.equal(adult.questType, "reading");

  const studentSettings = { ...baseSettings, role: "student" as const };
  const student = computeTodayTask(sun, studentSettings, { completedByPillar: { workout: 0, study: 0, reading: 0 }, missesStreakDays: 0 });
  assert.equal(student.questType, "study");
});

test("computeTodayTask: ladder grows with completed counts + manual rotation + ease-back", () => {
  const tue = new Date(2026, 8, 8, 9, 0, 0); // Tue
  const t = computeTodayTask(tue, baseSettings, { completedByPillar: { workout: 0, study: 0, reading: 2 }, missesStreakDays: 0 });
  assert.equal(t.questType, "reading");
  assert.equal(t.targetMinutes, 32); // base 30 + 2×1

  const manual = computeTodayTask(tue, baseSettings, { completedByPillar: { workout: 4, study: 0, reading: 0 }, missesStreakDays: 0 }, "workout");
  assert.equal(manual.questType, "workout");
  assert.equal(manual.discipline, "strength");
  assert.equal(manual.targetMinutes, 53); // 45 + 4×2

  const eased = computeTodayTask(tue, baseSettings, { completedByPillar: { workout: 0, study: 0, reading: 2 }, missesStreakDays: 7 });
  assert.equal(eased.targetMinutes, 31); // 32 - 1, floor is 30
});

// --- §4.5 XP curve ---
test("XP curve: level 1→2 needs 100 XP, level 2→3 needs round(100·2^1.4)", () => {
  assert.equal(xpNeededForLevel(1), 100);
  assert.equal(xpNeededForLevel(2), Math.round(Math.pow(2, 1.4) * 100));
  assert.equal(levelFromXp(0), 1);
  assert.equal(levelFromXp(99), 1);
  assert.equal(levelFromXp(100), 2);
});

test("applyXP: reports level-up and in-level progress", () => {
  const r1 = applyXP(0, 100);
  assert.equal(r1.levelBefore, 1);
  assert.equal(r1.levelAfter, 2);
  assert.equal(r1.xpInLevel, 0);
  assert.equal(r1.leveledUp, true);

  const r2 = applyXP(100, 100);
  assert.equal(r2.levelAfter, 2);
  assert.equal(r2.xpInLevel, 100);
  assert.equal(r2.leveledUp, false);
});

// --- §4.5 Streak ---
test("applyStreak: increments only when lastCompleteKey ≠ today, updates best", () => {
  const a = applyStreak(5, 8, "2026-09-12", "2026-09-13");
  assert.deepEqual(a, { streak: 6, bestStreak: 8, incremented: true });
  const b = applyStreak(6, 8, "2026-09-13", "2026-09-13");
  assert.deepEqual(b, { streak: 6, bestStreak: 8, incremented: false });
  const c = applyStreak(8, 8, "2026-09-13", "2026-09-14");
  assert.deepEqual(c, { streak: 9, bestStreak: 9, incremented: true });
});

// --- §4.7 Consistency ---
test("getConsistencyScore: perfect days weight double", () => {
  assert.equal(getConsistencyScore(2, 3), 67);
  assert.equal(getConsistencyScore(3, 3), 100);
  assert.equal(getConsistencyScore(0, 10), 0);
  assert.equal(getConsistencyScore(4, 2), 100); // clamped
});

// --- §5 Achievement predicates ---
test("evaluatePredicate: thresholds are minimums", () => {
  const base = {
    completedDays: 1, streak: 0, bestStreak: 0, strength: 0, agility: 0, stamina: 0,
    intelligence: 0, sense: 0, level: 1, xp: 0, perfectDays: 0, earlyCompletions: 0,
    studyReading: 0, maxLadderPercent: 0,
  };
  assert.equal(evaluatePredicate(JSON.stringify({ completedDays: 1 }), base), true);
  assert.equal(evaluatePredicate(JSON.stringify({ strength: 50 }), { ...base, strength: 50 }), true);
  assert.equal(evaluatePredicate(JSON.stringify({ strength: 50 }), { ...base, strength: 49 }), false);
  assert.equal(evaluatePredicate(JSON.stringify({ maxLadderPercent: 1 }), { ...base, maxLadderPercent: 1 }), true);
  assert.equal(evaluatePredicate("not-json", base), false);
});

// --- §4.6 Missed-day computation ---
test("calcMissedDays: counts days strictly between lastComplete and today", () => {
  assert.equal(calcMissedDays("2026-09-01", null, "2026-09-10"), 9);
  assert.equal(calcMissedDays("2026-09-01", "2026-09-05", "2026-09-10"), 4);
  assert.equal(calcMissedDays("2026-09-01", "2026-09-10", "2026-09-10"), 0);
  assert.equal(calcMissedDays(null, null, "2026-09-10"), 0);
});