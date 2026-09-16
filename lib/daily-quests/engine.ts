// Pure engine core — Daily Quests Gamification Module.
// Ladder math (§4.6), weekly task generation (§4.2), validation (§4.4),
// XP curve & streaks (§4.5), consistency score & achievement predicates (§5).

import type { Discipline, Pillar, QuestSettings, QuestType } from "./types";
import {
  WEEKDAY_RHYTHM,
  WORKOUT_CYCLE,
  WORKOUT_CYCLE_DAY,
  labelFor,
  descriptionFor,
  variantCountFor,
} from "./quest-templates";

// §4.6 Consistency Ladder — pillar → base/step/cap (minutes).
// Base = Day-1 target; step = +minutes per completed day; cap = hard ceiling.
export const LADDERS: Record<Pillar, { base: number; step: number; cap: number }> = {
  workout: { base: 45, step: 2, cap: 120 },
  study: { base: 60, step: 2, cap: 180 },
  reading: { base: 30, step: 1, cap: 90 },
};

export type HistorySummary = {
  completedByPillar: Record<Pillar, number>;
  /** Consecutive calendar days without a completed task since the last completion (or start). */
  missesStreakDays: number;
};

export interface QuestTemplate {
  questType: QuestType;
  discipline: Discipline;
  label: string;
  description: string;
  /** Flavor variant index chosen for this slot — persisted on QuestLog so views render it. */
  variant: number;
  targetMinutes: number;
  heavy: boolean;
}

export function capFor(pillar: Pillar, settings: QuestSettings): number {
  switch (pillar) {
    case "workout":
      return settings.workoutCapMinutes;
    case "study":
      return settings.studyCapMinutes;
    case "reading":
      return settings.readingCapMinutes;
  }
}

// §4.6 — Ladder difficulty is derived at issue time from completed counts,
// never stored as skill points.
export function computeLadderTarget(pillar: Pillar, completedOfPillar: number, capOverride?: number): number {
  const ladder = LADDERS[pillar];
  const cap = capOverride ?? ladder.cap;
  return Math.min(cap, ladder.base + Math.max(0, Math.floor(completedOfPillar)) * ladder.step);
}

// §4.6 — Ease-back: after 7+ consecutive missed days the target eases back
// ~1 ladder step per missed week, floored at the pillar base.
export function applyEaseBack(pillar: Pillar, targetMinutes: number, consecutiveMissedDays: number): number {
  const ladder = LADDERS[pillar];
  const missedWeeks = Math.max(0, Math.floor(Math.max(0, consecutiveMissedDays) / 7));
  if (missedWeeks === 0) return targetMinutes;
  return Math.max(ladder.base, targetMinutes - missedWeeks * ladder.step);
}

/** §4.6 — fraction (0..1) of the ladder span the current target covers. */
export function computeLadderPercent(pillar: Pillar, completedOfPillar: number, capOverride?: number): number {
  const ladder = LADDERS[pillar];
  const cap = capOverride ?? ladder.cap;
  const span = Math.max(1, cap - ladder.base);
  const current = computeLadderTarget(pillar, completedOfPillar, capOverride);
  return clamp((current - ladder.base) / span, 0, 1);
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Deterministic string hash (djb2) — stable across runs & users. */
export function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return h;
}

/**
 * §per-user variety — deterministic flavor-variant index for a slot.
 * The same (seed, day, questType, discipline) always yields the same variant,
 * while different seeds (i.e. different users) yield different variants.
 */
export function questVariantIndex(
  seed: number,
  dayKey: string,
  questType: QuestType,
  discipline: Discipline,
): number {
  const count = variantCountFor(questType, discipline);
  if (count <= 1) return 0;
  const h = hashString(`${dayKey}|${questType}|${discipline ?? ""}|${Math.abs(seed) % 1_000_000_007}`);
  return ((h % count) + count) % count;
}

/**
 * §4.2/§4.6 — Compute today's quest from the weekday rhythm, the user's
 * role/rotation settings, and ladder history (completed counts + missed days).
 * `seed` (a per-user random value from UserQuestProfile.questSeed) rotates the
 * Mon/Wed/Fri workout disciplines and picks the day's task flavor variant, so
 * different users receive different tasks on the same day.
 */
export function computeTodayTask(
  now: Date,
  settings: QuestSettings,
  history: HistorySummary,
  manualPillar?: QuestType | null,
  seed = 0,
): QuestTemplate {
  const dow = now.getDay();
  const rhythm = WEEKDAY_RHYTHM[dow];
  let questType: QuestType = rhythm.questType;
  let discipline: Discipline = rhythm.discipline;

  // Study/Reading block day → role decides the pillar.
  if (questType === "study" || questType === "reading") {
    questType = settings.role === "student" ? "study" : "reading";
    discipline = null;
  }

  // Per-user variety: rotate the 3 regular workout disciplines (Mon/Wed/Fri)
  // by the user's seed. Saturday's Endurance Heavy Day stays fixed.
  if (questType === "workout" && WORKOUT_CYCLE_DAY[dow] !== undefined) {
    const offset = Math.abs(seed) % WORKOUT_CYCLE.length;
    const idx = (WORKOUT_CYCLE_DAY[dow] + offset) % WORKOUT_CYCLE.length;
    discipline = WORKOUT_CYCLE[idx];
  }

  // Manual rotation overrides today's pillar (workout defaults to strength).
  if (manualPillar && manualPillar !== questType) {
    questType = manualPillar;
    discipline = questType === "workout" ? "strength" : null;
  }

  const completed = history.completedByPillar[questType] ?? 0;
  let target = computeLadderTarget(questType, completed, capFor(questType, settings));
  target = applyEaseBack(questType, target, history.missesStreakDays);

  const heavy = rhythm.heavy === true && questType === "workout";
  if (heavy) {
    target = Math.min(capFor("workout", settings), Math.round(target * settings.heavyDayMultiplier));
  }

  const dayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const variant = questVariantIndex(seed, dayKey, questType, discipline);

  return {
    questType,
    discipline,
    label: labelFor(questType, discipline, variant),
    description: descriptionFor(questType, discipline, variant),
    variant,
    targetMinutes: Math.max(1, target),
    heavy,
  };
}

/** §4.4 — Validate a progress-log entry for the day's quest. */
export function validateLog(
  task: { status: string; progressMinutes?: number } | null | undefined,
  minutes: number,
): { ok: true } | { ok: false; reason: string } {
  if (!task) return { ok: false, reason: "No quest issued for today yet. Refresh the board." };
  if (task.status === "completed") return { ok: false, reason: "Quest already completed — great work! 🎉" };
  if (task.status === "failed") return { ok: false, reason: "This quest expired at reset. A new quest is issued today!" };
  if (!Number.isInteger(minutes)) return { ok: false, reason: "Minutes must be a whole number." };
  if (minutes <= 0) return { ok: false, reason: "Minutes must be greater than 0." };
  if (minutes > 1440) return { ok: false, reason: "Max 1440 minutes per session (24 hours)." };
  return { ok: true };
}
/** §4.5 — XP curve: XP needed to advance FROM `level` TO `level + 1`. */
export function xpNeededForLevel(level: number): number {
  return Math.round(100 * Math.pow(Math.max(1, level), 1.4));
}

/** §4.5 — Level derived from cumulative XP. */
export function levelFromXp(xp: number): number {
  let level = 1;
  let remaining = Math.max(0, xp);
  while (remaining >= xpNeededForLevel(level)) {
    remaining -= xpNeededForLevel(level);
    level += 1;
  }
  return level;
}

/** §4.5 — Apply a reward and report level transitions. */
export function applyXP(xpBefore: number, gain: number): {
  xpAfter: number;
  levelBefore: number;
  levelAfter: number;
  xpInLevel: number;
  nextLevelAt: number;
  leveledUp: boolean;
} {
  const levelBefore = levelFromXp(xpBefore);
  const xpAfter = Math.max(0, xpBefore + Math.max(0, gain));
  const levelAfter = levelFromXp(xpAfter);
  return {
    xpAfter,
    levelBefore,
    levelAfter,
    xpInLevel: xpAfter - cumulativeXpForLevels(levelAfter),
    nextLevelAt: xpNeededForLevel(levelAfter),
    leveledUp: levelAfter > levelBefore,
  };
}

function cumulativeXpForLevels(level: number): number {
  let total = 0;
  for (let l = 1; l < level; l += 1) {
    total += xpNeededForLevel(l);
  }
  return total;
}

/** §4.5 — Streak increment on completion (anchored via lastCompleteKey). */
export function applyStreak(
  currentStreak: number,
  bestStreak: number,
  lastCompleteKey: string | null,
  todayKey: string,
): { streak: number; bestStreak: number; incremented: boolean } {
  const incremented = lastCompleteKey !== todayKey;
  const streak = incremented ? currentStreak + 1 : currentStreak;
  return { streak, bestStreak: Math.max(bestStreak, streak), incremented };
}

/** §4.7 — Consistency score: perfect days weight 2× inside the numerator. */
export function getConsistencyScore(completedWeighted: number, daysSinceStart: number): number {
  if (daysSinceStart <= 0) return 0;
  return clamp(Math.round((completedWeighted / daysSinceStart) * 100), 0, 100);
}

export interface AchievementContext {
  completedDays: number;
  streak: number;
  bestStreak: number;
  strength: number;
  agility: number;
  stamina: number;
  intelligence: number;
  sense: number;
  level: number;
  xp: number;
  perfectDays: number;
  earlyCompletions: number;
  studyReading: number;
  maxLadderPercent: number;
}

/** §5 — Evaluate a seeded achievement predicate (every field = minimum threshold). */
export function evaluatePredicate(predicate: string, ctx: AchievementContext): boolean {
  let raw: Record<string, number>;
  try {
    raw = JSON.parse(predicate);
  } catch {
    return false;
  }
  for (const [key, threshold] of Object.entries(raw)) {
    const actual = (ctx as unknown as Record<string, number>)[key];
    if (typeof actual !== "number" || actual < threshold) return false;
  }
  return true;
}

/** Consecutive missed days for ease-back: days after the last completed quest
 *  (or the profile start day, inclusive) up to — but excluding — today. */
export function calcMissedDays(startKey: string | null, lastCompleteKey: string | null, todayKey: string): number {
  const from = lastCompleteKey ?? startKey;
  if (!from) return 0;
  const d = parseDay(from);
  if (lastCompleteKey) d.setDate(d.getDate() + 1); // day AFTER the last completion was the first missed day
  const b = parseDay(todayKey);
  let missed = 0;
  while (d.getTime() < b.getTime()) {
    missed += 1;
    d.setDate(d.getDate() + 1);
  }
  return missed;
}

function parseDay(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}