// Shared types for the Daily Quests Gamification Module.
// These are plain, framework-agnostic types shared by the pure engine
// (lib/daily-quests/engine.ts) and the server actions / client components.

export type Pillar = "workout" | "study" | "reading";
export type QuestType = "workout" | "study" | "reading";
export type Discipline = "strength" | "cardio" | "mobility" | "endurance" | null;
export type QuestStatusType = "active" | "completed" | "failed";
export type Role = "student" | "adult";
export type Rotation = "auto" | "manual";

export interface QuestSettings {
  role: Role;
  rotation: Rotation;
  workoutCapMinutes: number;
  studyCapMinutes: number;
  readingCapMinutes: number;
  heavyDayMultiplier: number;
  resetHour: number; // local hour when the day rolls over (default 19 = 7 PM)
}

export interface QuestTaskView {
  id: string;
  date: string; // YYYY-MM-DD local day key
  questType: QuestType;
  discipline: Discipline;
  label: string;
  description: string;
  targetMinutes: number;
  progressMinutes: number;
  status: QuestStatusType;
  reflectionNote: string | null;
  awardedXp: number;
  completedAt: string | null;
  perfectDay: boolean;
  createdAt: string;
}

export interface PlayerStatsView {
  xp: number;
  level: number;
  strength: number;
  agility: number;
  stamina: number;
  intelligence: number;
  sense: number;
  streak: number;
  bestStreak: number;
  perfectDays: number;
}

export interface LadderRungView {
  base: number;
  step: number;
  cap: number;
  current: number; // current target minutes for the pillar
  percent: number; // 0..1 progress between base and cap
}

export type CellStatus = "none" | "active" | "completed" | "failed" | "perfect";

export interface ConsistencyCellView {
  date: string; // YYYY-MM-DD
  status: CellStatus;
  questType: QuestType | null;
  targetMinutes: number;
  progressMinutes: number;
  xp: number;
  perfectDay: boolean;
}

export interface ConsistencyView {
  score: number; // weighted consistency % (perfect days count double)
  completedWeighted: number;
  completedDays: number;
  daysSinceStart: number;
  from: string;
  to: string;
  cells: ConsistencyCellView[];
  monthLabels: string[];
}

export interface DaySummaryView {
  date: string;
  questType: QuestType;
  discipline: Discipline;
  label: string;
  status: QuestStatusType;
  targetMinutes: number;
  progressMinutes: number;
  xp: number;
  perfectDay: boolean;
  reflectionNote: string | null;
  completedAt: string | null;
}
export interface AchievementView {
  code: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface DailyBoardSnapshot {
  todayKey: string; // current quest-day key (rollover-aware)
  nowIso: string;
  deadlineAtIso: string; // when today's quest-day expires (resetHour)
  dayNumber: number; // 1-based day of the journey
  isHeavyDay: boolean;
  profile: {
    onboardedAt: string | null;
    startedAt: string;
    role: Role;
    rotation: Rotation;
    workoutCapMinutes: number;
    studyCapMinutes: number;
    readingCapMinutes: number;
    heavyDayMultiplier: number;
    resetHour: number;
  };
  task: QuestTaskView | null;
  stats: PlayerStatsView;
  ladder: Record<Pillar, LadderRungView>;
  consistency: ConsistencyView;
}

export interface ActionResult {
  ok: boolean;
  reason?: string;
  snapshot?: DailyBoardSnapshot;
  leveledUp?: boolean;
  levelBefore?: number;
  levelAfter?: number;
  newAchievements?: AchievementView[];
  xpGained?: number;
}