// Shared visual metadata for the Daily Quests module (client-safe).
import type { Pillar, QuestType } from "@/lib/daily-quests/types";

export type StatKey = "strength" | "agility" | "stamina" | "intelligence" | "sense";

export const PILLAR_META: Record<
  Pillar,
  { icon: string; color: string; label: string; blurb: string }
> = {
  workout: { icon: "⚔️", color: "#ef4444", label: "Workout", blurb: "Strength · Cardio · Mobility · Endurance" },
  study: { icon: "📚", color: "#a78bfa", label: "Deep Study", blurb: "Focused, distraction-free study block" },
  reading: { icon: "📖", color: "#f59e0b", label: "Deep Reading", blurb: "Unplug and read — absorb pages & calm" },
};

export const QUEST_TYPE_META: Record<QuestType, { icon: string; color: string; label: string }> = {
  workout: PILLAR_META.workout,
  study: PILLAR_META.study,
  reading: PILLAR_META.reading,
};

export const STAT_LABELS: Record<StatKey, { label: string; color: string }> = {
  strength: { label: "Strength", color: "#f43f5e" },
  agility: { label: "Agility", color: "#22d3ee" },
  stamina: { label: "Stamina", color: "#22c55e" },
  intelligence: { label: "Intelligence", color: "#a78bfa" },
  sense: { label: "Sense", color: "#f59e0b" },
};

/** Neutral display color for a quest-type icon chip (used across cards). */
export function pillarColor(p: Pillar): string {
  return PILLAR_META[p].color;
}