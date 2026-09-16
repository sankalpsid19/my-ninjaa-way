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

export const STAT_LABELS: Record<StatKey, { label: string; color: string; blurb: string }> = {
  strength: { label: "Strength", color: "#f43f5e", blurb: "Raw power" },
  agility: { label: "Agility", color: "#22d3ee", blurb: "Speed & reflexes" },
  stamina: { label: "Stamina", color: "#22c55e", blurb: "Resilience & health" },
  intelligence: { label: "Intelligence", color: "#a78bfa", blurb: "Knowledge & memory" },
  sense: { label: "Sense", color: "#f59e0b", blurb: "Perception & focus" },
};

/** Icon shown at each vertex of the StatHexagon, in the radar's render order. */
export const STAT_ICONS: Record<StatKey, string> = {
  agility: "⚡",
  strength: "💪",
  stamina: "❤️",
  intelligence: "🧠",
  sense: "👁️",
};

/** Neutral display color for a quest-type icon chip (used across cards). */
export function pillarColor(p: Pillar): string {
  return PILLAR_META[p].color;
}