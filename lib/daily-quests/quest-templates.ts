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
export const WEEKDAY_RHYTHM: Record<number, WeekdaySlot> = {
  0: { questType: "reading", discipline: null, label: "Deep Reading" },
  1: { questType: "workout", discipline: "strength", label: "Strength Training" },
  2: { questType: "study", discipline: null, label: "Deep Study" },
  3: { questType: "workout", discipline: "cardio", label: "Cardio & Speed" },
  4: { questType: "study", discipline: null, label: "Deep Study" },
  5: { questType: "workout", discipline: "mobility", label: "Mobility & Stretch" },
  6: { questType: "workout", discipline: "endurance", label: "Endurance (Heavy Day)", heavy: true },
};

export const QUEST_LABELS: Record<QuestType, Record<string, string>> = {
  workout: {
    strength: "Strength Training",
    cardio: "Cardio & Speed",
    mobility: "Mobility & Stretch",
    endurance: "Endurance (Heavy Day)",
  },
  study: { default: "Deep Study" },
  reading: { default: "Deep Reading" },
};

export const QUEST_DESCRIPTIONS: Record<QuestType, Record<string, string>> = {
  workout: {
    strength: "Push strength today — one focused session at your ladder level.",
    cardio: "Get your heart rate up — speed, intervals & conditioning.",
    mobility: "Move well — stretching, mobility flow & recovery work.",
    endurance: "Heavy day! Saturday endurance block — go the distance.",
  },
  study: { default: "Focused, distraction-free study block. Deep work, one topic." },
  reading: { default: "Unplug and read — absorb pages, ideas, and calm." },
};

export function labelFor(questType: QuestType, discipline: Discipline): string {
  if (questType === "workout") return QUEST_LABELS.workout[discipline ?? "strength"];
  return QUEST_LABELS[questType].default;
}

export function descriptionFor(questType: QuestType, discipline: Discipline): string {
  if (questType === "workout") return QUEST_DESCRIPTIONS.workout[discipline ?? "strength"];
  return QUEST_DESCRIPTIONS[questType].default;
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