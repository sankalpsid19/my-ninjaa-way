// Quest scheduling templates & reward tables — Daily Quests Gamification Module.
// Weekday rhythm (§4.2), quest labels/descriptions (§4.4), status-based rewards (§4.3).

import type { Discipline, QuestType } from "./types";

export interface WeekdaySlot {
  questType: QuestType;
  discipline: Discipline;
  label: string;
  heavy?: boolean;
}

// §4.2 Weekday rhythm:
// Sun + Tue + Thu → Study (student) / Reading (adult); Mon/Wed/Fri → Workout; Sat → Heavy Workout.
// Workout disciplines rotate: Mon=strength, Wed=cardio&speed, Fri=mobility, Sat=endurance.
// The Mon/Wed/Fri order is *rotated per user* by their `questSeed` (see WORKOUT_CYCLE below),
// so different people get different workout disciplines on the same day.
export const WEEKDAY_RHYTHM: Record<number, WeekdaySlot> = {
  0: { questType: "reading", discipline: null, label: "Deep Reading" },
  1: { questType: "workout", discipline: "strength", label: "Strength Training" },
  2: { questType: "study", discipline: null, label: "Deep Study" },
  3: { questType: "workout", discipline: "cardio", label: "Cardio & Speed" },
  4: { questType: "study", discipline: null, label: "Deep Study" },
  5: { questType: "workout", discipline: "mobility", label: "Mobility & Stretch" },
  6: { questType: "workout", discipline: "endurance", label: "Endurance (Heavy Day)", heavy: true },
};

// §per-user variety — the 3 regular workout disciplines cycle over Mon/Wed/Fri.
// A user's seed offsets the starting discipline, so two users with the same role
// still get *different* workout tasks on the same day (Sat = Endurance Heavy Day is fixed).
export const WORKOUT_CYCLE = ["strength", "cardio", "mobility"] as const;
export const WORKOUT_CYCLE_DAY: Record<number, number> = { 1: 0, 3: 1, 5: 2 }; // dow → cycle index

export interface QuestVariant {
  label: string;
  description: string;
}

// §per-user variety — flavor variant pools. index 0 mirrors the base
// label/description; extra variants give each user distinct task wording.
export const QUEST_VARIANTS: Record<QuestType, Record<string, readonly QuestVariant[]>> = {
  workout: {
    strength: [
      { label: "Strength Training", description: "Push strength today — one focused session at your ladder level." },
      { label: "Power Session", description: "Build raw force — heavy compound lifts or bodyweight strength work." },
      { label: "Strength Foundation", description: "Solidify the base — controlled reps, good form, full-body strength." },
    ],
    cardio: [
      { label: "Cardio & Speed", description: "Get your heart rate up — speed, intervals & conditioning." },
      { label: "Cardio & Intervals", description: "Raise your ceiling — interval bursts chased by short recoveries." },
      { label: "Cardio Endurance Run", description: "Build your engine — steady-state work with a few surge sets." },
    ],
    mobility: [
      { label: "Mobility & Stretch", description: "Move well — stretching, mobility flow & recovery work." },
      { label: "Mobility Flow", description: "Grease the joints — dynamic flow and deep full-range movement." },
      { label: "Stretch & Release", description: "Unwind — targeted stretching and tension release for tight areas." },
    ],
    endurance: [
      { label: "Endurance (Heavy Day)", description: "Heavy day! Saturday endurance block — go the distance." },
      { label: "Endurance Builder (Heavy Day)", description: "Heavy day! Saturday endurance block — build the tank for the week ahead." },
      { label: "Long Haul (Heavy Day)", description: "Heavy day! Saturday endurance block — sustained output at a steady pace." },
    ],
  },
  study: {
    default: [
      { label: "Deep Study", description: "Focused, distraction-free study block. Deep work, one topic." },
      { label: "Deep Study Sprint", description: "Wired focus — one topic, no switching, track what you learn." },
      { label: "Study Block", description: "Calm, deliberate study session — notes, review, one new idea." },
    ],
  },
  reading: {
    default: [
      { label: "Deep Reading", description: "Unplug and read — absorb pages, ideas, and calm." },
      { label: "Reading Session", description: "Open the book — read for depth and jot one takeaway." },
      { label: "Page-Turner Hour", description: "Settle in with a book — steady pages, zero screens." },
    ],
  },
};

/** Pool key for a slot: workout uses the discipline, others use "default". */
function variantKey(questType: QuestType, discipline: Discipline): string {
  return questType === "workout" ? (discipline ?? "strength") : "default";
}

export function variantCountFor(questType: QuestType, discipline: Discipline): number {
  return QUEST_VARIANTS[questType][variantKey(questType, discipline)].length;
}

export function variantFor(questType: QuestType, discipline: Discipline, variant: number): QuestVariant {
  const pool = QUEST_VARIANTS[questType][variantKey(questType, discipline)];
  return pool[Math.abs(variant) % pool.length];
}

export function labelFor(questType: QuestType, discipline: Discipline, variant = 0): string {
  return variantFor(questType, discipline, variant).label;
}

export function descriptionFor(questType: QuestType, discipline: Discipline, variant = 0): string {
  return variantFor(questType, discipline, variant).description;
}

export interface QuestReward {
  xp: number;
  stats: Partial<Record<"strength" | "agility" | "stamina" | "intelligence" | "sense", number>>;
}

// §4.3 Reward table — per quest-type + discipline.
export const REWARDS: Record<QuestType, Record<string, QuestReward>> = {
  workout: {
    strength: { xp: 120, stats: { strength: 3, agility: 1, stamina: 2 } },
    cardio: { xp: 120, stats: { agility: 3, strength: 1, stamina: 2 } },
    mobility: { xp: 90, stats: { agility: 2, strength: 1, stamina: 1, sense: 2 } },
    endurance: { xp: 120, stats: { stamina: 3, strength: 1, agility: 1, sense: 1 } },
  },
  study: { default: { xp: 110, stats: { intelligence: 4, sense: 1 } } },
  reading: { default: { xp: 110, stats: { intelligence: 3, sense: 1 } } },
};

// §4.3 Perfect Day bonus (frozen/@start-of-day completed bonus is applied live instead).
export const PERFECT_DAY_BONUS: QuestReward = { xp: 40, stats: { sense: 1 } };

export function rewardFor(questType: QuestType, discipline: Discipline): QuestReward {
  if (questType === "workout") return REWARDS.workout[discipline ?? "strength"] ?? REWARDS.workout.strength;
  return REWARDS[questType].default;
}