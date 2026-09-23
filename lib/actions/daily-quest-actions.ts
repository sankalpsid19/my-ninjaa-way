"use server";

// Daily Quests Gamification Module — server actions.
// One quest per day, rollover at resetHour, ladder difficulty, streaks,
// attributes/XP, perfect-day grace, achievements.

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { QuestLog, PlayerStats, UserQuestProfile } from "@prisma/client";
import {
  dayKey,
  parseDayKey,
  addMonths,
  startOfMonthKey,
  monthKey,
  daysBetween,
  nowIso,
} from "@/lib/daily-quests/dates";
import {
  LADDERS,
  computeLadderTarget,
  computeLadderPercent,
  computeTodayTask,
  levelFromXp,
  applyXP,
  applyStreak,
  getConsistencyScore,
  validateLog,
  calcMissedDays,
  evaluatePredicate,
} from "@/lib/daily-quests/engine";
import { labelFor, descriptionFor, rewardFor, PERFECT_DAY_BONUS } from "@/lib/daily-quests/quest-templates";
import type {
  Pillar,
  QuestType,
  Discipline,
  QuestStatusType,
  QuestSettings,
  QuestTaskView,
  PlayerStatsView,
  LadderRungView,
  ConsistencyView,
  DaySummaryView,
  DailyBoardSnapshot,
  AchievementView,
  ActionResult,
} from "@/lib/daily-quests/types";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function requireUserId(): Promise<string> {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  let userId = user?.id;

  if (!userId && user?.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email.toLowerCase() },
      select: { id: true },
    });
    userId = dbUser?.id;
  }

  if (!userId) throw new Error("Unauthorized. Please sign in.");
  return userId;
}

function settingsFromProfile(p: UserQuestProfile): QuestSettings {
  return {
    role: (p.role as QuestSettings["role"]) ?? "adult",
    rotation: (p.rotation as QuestSettings["rotation"]) ?? "auto",
    workoutCapMinutes: p.workoutCapMinutes,
    studyCapMinutes: p.studyCapMinutes,
    readingCapMinutes: p.readingCapMinutes,
    heavyDayMultiplier: p.heavyDayMultiplier,
    resetHour: p.resetHour,
  };
}

function capForPillar(pillar: Pillar, settings: QuestSettings): number {
  switch (pillar) {
    case "workout":
      return settings.workoutCapMinutes;
    case "study":
      return settings.studyCapMinutes;
    case "reading":
      return settings.readingCapMinutes;
  }
}

/**
 * Quest-day rollover: a quest-day begins at resetHour (default 19:00).
 * Before/equal the reset hour the current quest-day is the calendar day;
 * from resetHour onward it is the NEXT calendar day.
 */
function currentQuestDayKey(resetHour: number, now: Date = new Date()): string {
  const d = new Date(now);
  if (d.getHours() >= resetHour) d.setDate(d.getDate() + 1);
  return dayKey(d);
}

async function getOrCreate(userId: string): Promise<{ profile: UserQuestProfile; stats: PlayerStats }> {
  const profile = await prisma.userQuestProfile.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      // Random per-user variety seed — rotates workout disciplines & picks
      // task flavor variants so different users get different tasks.
      questSeed: Math.floor(Math.random() * 2_147_483_647),
    },
  });

  const stats = await prisma.playerStats.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  return { profile, stats };
}

/** Mark any stale (past quest-days) active quests as failed + reset the streak. */
async function dailyCheckpoint(userId: string, todayKey: string): Promise<void> {
  await prisma.questLog.updateMany({
    where: { userId, status: "active", date: { lt: todayKey } },
    data: { status: "failed" },
  });
  const profile = await prisma.userQuestProfile.findUnique({ where: { userId } });
  if (
    profile &&
    profile.lastCompleteKey &&
    profile.lastCompleteKey < todayKey &&
    new Date(profile.startedAt).getTime() < parseDayKey(todayKey).getTime()
  ) {
    await prisma.playerStats.update({
      where: { userId },
      data: { streak: 0 },
    });
  }
}

interface HistorySummary {
  completedByPillar: Record<Pillar, number>;
  missesStreakDays: number;
}

async function buildHistory(userId: string, profile: UserQuestProfile, todayKey: string): Promise<HistorySummary> {
  const completed = await prisma.questLog.findMany({
    where: { userId, status: "completed" },
    select: { questType: true },
  });
  const completedByPillar: Record<Pillar, number> = { workout: 0, study: 0, reading: 0 };
  for (const log of completed) {
    const key = log.questType.toLowerCase() as Pillar;
    if (key in completedByPillar) completedByPillar[key] += 1;
  }
  const missesStreakDays = calcMissedDays(dayKey(profile.startedAt), profile.lastCompleteKey, todayKey);
  return { completedByPillar, missesStreakDays };
}

async function ensureTodayTask(userId: string, todayKey: string): Promise<QuestLog> {
  const existing = await prisma.questLog.findUnique({ where: { userId_date: { userId, date: todayKey } } });
  if (existing) return existing;

  const { profile } = await getOrCreate(userId);
  const settings = settingsFromProfile(profile);
  const history = await buildHistory(userId, profile, todayKey);
  const template = computeTodayTask(parseDayKey(todayKey), settings, history, null, profile.questSeed);

  return prisma.questLog.create({
    data: {
      userId,
      date: todayKey,
      questType: template.questType as QuestLog["questType"],
      discipline: template.discipline,
      variant: template.variant,
      targetMinutes: template.targetMinutes,
    },
  });
}

// ---------------------------------------------------------------------------
// View builders
// ---------------------------------------------------------------------------

function toTaskView(log: QuestLog): QuestTaskView {
  const questType = log.questType.toLowerCase() as QuestType;
  const discipline = (log.discipline as Discipline) ?? null;
  return {
    id: log.id,
    date: log.date,
    questType,
    discipline,
    label: labelFor(questType, discipline, log.variant),
    description: descriptionFor(questType, discipline, log.variant),
    targetMinutes: log.targetMinutes,
    progressMinutes: log.progressMinutes,
    status: log.status.toLowerCase() as QuestStatusType,
    reflectionNote: log.reflectionNote,
    awardedXp: log.awardedXp,
    completedAt: log.completedAt ? log.completedAt.toISOString() : null,
    perfectDay: log.perfectDay,
    createdAt: log.createdAt.toISOString(),
  };
}

function toStatsView(s: PlayerStats): PlayerStatsView {
  return {
    xp: s.xp,
    level: levelFromXp(s.xp),
    strength: s.strength,
    agility: s.agility,
    stamina: s.stamina,
    intelligence: s.intelligence,
    sense: s.sense,
    streak: s.streak,
    bestStreak: s.bestStreak,
    perfectDays: s.perfectDays,
  };
}

function toLadderView(completedByPillar: Record<Pillar, number>, settings: QuestSettings): Record<Pillar, LadderRungView> {
  const out = {} as Record<Pillar, LadderRungView>;
  (["workout", "study", "reading"] as Pillar[]).forEach((p) => {
    const cap = capForPillar(p, settings);
    const completed = completedByPillar[p] ?? 0;
    out[p] = {
      base: LADDERS[p].base,
      step: LADDERS[p].step,
      cap,
      current: computeLadderTarget(p, completed, cap),
      percent: computeLadderPercent(p, completed, cap),
    };
  });
  return out;
}

async function buildConsistency(
  userId: string,
  profile: UserQuestProfile,
  todayKey: string,
  rangeMonths = 12,
): Promise<ConsistencyView> {
  const from = startOfMonthKey(addMonths(todayKey, -(rangeMonths - 1)));
  const logs = await prisma.questLog.findMany({
    where: { userId, date: { gte: from, lte: todayKey } },
  });
  const byDate = new Map(logs.map((l) => [l.date, l]));
  const cells: ConsistencyView["cells"] = [];
  const cursor = parseDayKey(from);
  const last = parseDayKey(todayKey);
  while (cursor.getTime() <= last.getTime()) {
    const key = dayKey(cursor);
    const log = byDate.get(key);
    if (!log) {
      cells.push({ date: key, status: "none", questType: null, targetMinutes: 0, progressMinutes: 0, xp: 0, perfectDay: false });
    } else {
      const status =
        log.status === "completed" ? (log.perfectDay ? "perfect" : "completed") : log.status === "failed" ? "failed" : "active";
      cells.push({
        date: key,
        status,
        questType: (log.questType.toLowerCase() as QuestType) ?? null,
        targetMinutes: log.targetMinutes,
        progressMinutes: log.progressMinutes,
        xp: log.awardedXp,
        perfectDay: log.perfectDay,
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  const completedWeighted = cells.reduce((acc, c) => acc + (c.status === "completed" ? 1 : c.status === "perfect" ? 2 : 0), 0);
  const completedDays = cells.reduce((acc, c) => acc + (c.status === "completed" || c.status === "perfect" ? 1 : 0), 0);
  const daysSinceStart = Math.max(0, daysBetween(dayKey(profile.startedAt), todayKey)) + 1;
  const score = getConsistencyScore(completedWeighted, daysSinceStart);

  const monthLabels: string[] = [];
  let m = from;
  let guard = 0;
  while (m <= todayKey && guard < rangeMonths + 1) {
    monthLabels.push(monthKey(m));
    m = addMonths(m, 1);
    guard += 1;
  }

  return { score, completedWeighted, completedDays, daysSinceStart, from, to: todayKey, cells, monthLabels };
}

async function buildSnapshot(
  userId: string,
  profile: UserQuestProfile,
  stats: PlayerStats,
  todayKey: string,
): Promise<DailyBoardSnapshot> {
  const settings = settingsFromProfile(profile);
  const history = await buildHistory(userId, profile, todayKey);
  const taskLog = await prisma.questLog.findUnique({ where: { userId_date: { userId, date: todayKey } } });
  const consistency = await buildConsistency(userId, profile, todayKey);

  const deadline = parseDayKey(todayKey);
  deadline.setHours(settings.resetHour);

  const task = taskLog ? toTaskView(taskLog) : null;
  return {
    todayKey,
    nowIso: nowIso(),
    deadlineAtIso: deadline.toISOString(),
    dayNumber: Math.max(1, daysBetween(dayKey(profile.startedAt), todayKey) + 1),
    isHeavyDay: task?.questType === "workout" && task?.discipline === "endurance",
    profile: {
      onboardedAt: profile.onboardedAt ? profile.onboardedAt.toISOString() : null,
      startedAt: profile.startedAt.toISOString(),
      role: settings.role,
      rotation: settings.rotation,
      workoutCapMinutes: settings.workoutCapMinutes,
      studyCapMinutes: settings.studyCapMinutes,
      readingCapMinutes: settings.readingCapMinutes,
      heavyDayMultiplier: settings.heavyDayMultiplier,
      resetHour: settings.resetHour,
    },
    task,
    stats: toStatsView(stats),
    ladder: toLadderView(history.completedByPillar, settings),
    consistency,
  };
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/** Load (or initialize) the daily quests board. First run shows the onboarding wizard. */
export async function getDailyBoard(): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    const { profile, stats } = await getOrCreate(userId);
    const settings = settingsFromProfile(profile);
    const todayKey = currentQuestDayKey(settings.resetHour);
    await dailyCheckpoint(userId, todayKey);
    if (profile.onboardedAt) await ensureTodayTask(userId, todayKey);
    const snapshot = await buildSnapshot(userId, profile, stats, todayKey);
    return { ok: true, snapshot };
  } catch (error) {
    console.error("getDailyBoard error:", error);
    return { ok: false, reason: error instanceof Error ? error.message : "Failed to load board." };
  }
}
/** §5.3 — Evaluate the achievement catalogue for newly earned badges (idempotent). */
async function checkAndAwardAchievements(userId: string): Promise<AchievementView[]> {
  const [catalogue, unlockedRows, stats, logs, profile] = await Promise.all([
    prisma.achievement.findMany({ orderBy: { order: "asc" } }),
    prisma.userAchievement.findMany({ where: { userId } }),
    prisma.playerStats.findUnique({ where: { userId } }),
    prisma.questLog.findMany({ where: { userId, status: "completed" } }),
    prisma.userQuestProfile.findUnique({ where: { userId } }),
  ]);
  if (!stats || !profile) return [];

  const unlockedCodes = new Set(unlockedRows.map((r) => catalogue.find((c) => c.id === r.achievementId)?.code));
  const completedByPillar: Record<Pillar, number> = { workout: 0, study: 0, reading: 0 };
  let earlyCompletions = 0;
  let studyReading = 0;
  for (const l of logs) {
    const key = l.questType.toLowerCase() as Pillar;
    if (key === "workout" || key === "study" || key === "reading") completedByPillar[key] += 1;
    if (l.questType === "study" || l.questType === "reading") studyReading += 1;
    if (l.completedAt && l.completedAt.getHours() < 9) earlyCompletions += 1;
  }
  const settings = settingsFromProfile(profile);
  const maxLadderPercent = Math.max(
    computeLadderPercent("workout", completedByPillar.workout, settings.workoutCapMinutes),
    computeLadderPercent("study", completedByPillar.study, settings.studyCapMinutes),
    computeLadderPercent("reading", completedByPillar.reading, settings.readingCapMinutes),
  );

  const ctx = {
    completedDays: logs.length,
    streak: stats.streak,
    bestStreak: stats.bestStreak,
    strength: stats.strength,
    agility: stats.agility,
    stamina: stats.stamina,
    intelligence: stats.intelligence,
    sense: stats.sense,
    level: levelFromXp(stats.xp),
    xp: stats.xp,
    perfectDays: stats.perfectDays,
    earlyCompletions,
    studyReading,
    maxLadderPercent,
  };

  const earned = catalogue.filter((c) => !unlockedCodes.has(c.code) && evaluatePredicate(c.predicate, ctx));
  if (earned.length === 0) return [];

  await prisma.userAchievement.createMany({
    data: earned.map((c) => ({ userId, achievementId: c.id })),
  });
  return earned.map((c) => ({
    code: c.code,
    name: c.name,
    description: c.description,
    icon: c.icon,
    color: c.color,
    unlocked: true,
    unlockedAt: new Date().toISOString(),
  }));
}

/** Shared completion routine: caps progress at 1.5 × target (grace), then awards. */
async function finalizeCompletion(
  userId: string,
  task: QuestLog,
  addedMinutes: number,
  note?: string | null,
): Promise<ActionResult> {
  const { profile, stats } = await getOrCreate(userId);
  const settings = settingsFromProfile(profile);
  const todayKey = currentQuestDayKey(settings.resetHour);
  if (task.date !== todayKey) return { ok: false, reason: "This quest already rolled over into a new day." };

  const cappedTarget = Math.round(task.targetMinutes * 1.5);
  const newProgress = Math.min(cappedTarget, task.progressMinutes + Math.max(0, addedMinutes));
  if (newProgress < task.targetMinutes) {
    return { ok: false, reason: "Target not reached yet — keep going!" };
  }

  const reflection = note?.trim() || null;
  const perfectDay = !!reflection; // §4.3 — Perfect Day = completed WITH a reflection note
  const completedAt = new Date();
  const questType = task.questType.toLowerCase() as QuestType;
  const discipline = (task.discipline as Discipline) ?? null;
  const reward = rewardFor(questType, discipline);
  const bonus = perfectDay ? PERFECT_DAY_BONUS : null;
  const xpGained = reward.xp + (bonus?.xp ?? 0);
  const xp = applyXP(stats.xp, xpGained);
  const streak = applyStreak(stats.streak, stats.bestStreak, profile.lastCompleteKey, todayKey);

  await prisma.$transaction([
    prisma.questLog.update({
      where: { id: task.id },
      data: {
        progressMinutes: newProgress,
        status: "completed",
        completedAt,
        reflectionNote: reflection,
        awardedXp: xpGained,
        perfectDay,
      },
    }),
    prisma.playerStats.update({
      where: { userId },
      data: {
        xp: xp.xpAfter,
        strength: stats.strength + (reward.stats.strength ?? 0) + (bonus?.stats.strength ?? 0),
        agility: stats.agility + (reward.stats.agility ?? 0) + (bonus?.stats.agility ?? 0),
        stamina: stats.stamina + (reward.stats.stamina ?? 0) + (bonus?.stats.stamina ?? 0),
        intelligence: stats.intelligence + (reward.stats.intelligence ?? 0) + (bonus?.stats.intelligence ?? 0),
        sense: stats.sense + (reward.stats.sense ?? 0) + (bonus?.stats.sense ?? 0),
        streak: streak.streak,
        bestStreak: streak.bestStreak,
        perfectDays: stats.perfectDays + (perfectDay ? 1 : 0),
      },
    }),
    prisma.userQuestProfile.update({ where: { userId }, data: { lastCompleteKey: todayKey } }),
  ]);

  const newAchievements = await checkAndAwardAchievements(userId);
  const fresh = await getOrCreate(userId);
  const snapshot = await buildSnapshot(userId, fresh.profile, fresh.stats, todayKey);
  revalidatePath("/daily-quests");
  return {
    ok: true,
    snapshot,
    leveledUp: xp.leveledUp,
    levelBefore: xp.levelBefore,
    levelAfter: xp.levelAfter,
    newAchievements,
    xpGained,
  };
}
/** §4.4 — Log focused minutes against today's quest (progress ≤ 1.5 × target, no XP yet). */
export async function logProgress(taskId: string, minutes: number): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    const task = await prisma.questLog.findUnique({ where: { id: taskId } });
    if (!task || task.userId !== userId) return { ok: false, reason: "Quest not found." };
    const { profile } = await getOrCreate(userId);
    const settings = settingsFromProfile(profile);
    const todayKey = currentQuestDayKey(settings.resetHour);
    if (task.date !== todayKey) return { ok: false, reason: "This quest already rolled over into a new day." };

    const v = validateLog(task, minutes);
    if (!v.ok) return { ok: false, reason: v.reason };

    const cappedTarget = Math.round(task.targetMinutes * 1.5);
    const nextProgress = Math.min(cappedTarget, task.progressMinutes + minutes);
    await prisma.questLog.update({
      where: { id: task.id },
      data: { progressMinutes: nextProgress },
    });

    const fresh = await getOrCreate(userId);
    const snapshot = await buildSnapshot(userId, fresh.profile, fresh.stats, todayKey);
    return { ok: true, snapshot };
  } catch (error) {
    console.error("logProgress error:", error);
    return { ok: false, reason: error instanceof Error ? error.message : "Failed to log progress." };
  }
}

/** §4.4 — Complete the quest with an optional reflection note (Perfect Day). */
export async function completeTaskWithReflection(taskId: string, note?: string | null): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    const task = await prisma.questLog.findUnique({ where: { id: taskId } });
    if (!task || task.userId !== userId) return { ok: false, reason: "Quest not found." };
    return await finalizeCompletion(userId, task, 0, note);
  } catch (error) {
    console.error("completeTaskWithReflection error:", error);
    return { ok: false, reason: error instanceof Error ? error.message : "Failed to complete quest." };
  }
}

/** §4.5 — Manual rotation: swap the day's quest type BEFORE starting it (locks once > 0 progress). */
export async function pickTodayTask(choice: QuestType): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    const { profile } = await getOrCreate(userId);
    const settings = settingsFromProfile(profile);
    if (settings.rotation !== "manual") return { ok: false, reason: "Enable manual rotation in settings first." };
    const todayKey = currentQuestDayKey(settings.resetHour);
    const task = await ensureTodayTask(userId, todayKey);
    if (task.status !== "active") return { ok: false, reason: "This quest can't be changed anymore." };
    if (task.progressMinutes > 0) return { ok: false, reason: "Already started — quests lock once progress begins." };
    if (choice !== "workout" && choice !== "study" && choice !== "reading") {
      return { ok: false, reason: "Unknown quest type." };
    }

    const history = await buildHistory(userId, profile, todayKey);
    const template = computeTodayTask(parseDayKey(todayKey), settings, history, choice, profile.questSeed);
    await prisma.questLog.update({
      where: { id: task.id },
      data: {
        questType: template.questType as QuestLog["questType"],
        discipline: template.discipline,
        variant: template.variant,
        targetMinutes: template.targetMinutes,
      },
    });

    const fresh = await getOrCreate(userId);
    const snapshot = await buildSnapshot(userId, fresh.profile, fresh.stats, todayKey);
    return { ok: true, snapshot };
  } catch (error) {
    console.error("pickTodayTask error:", error);
    return { ok: false, reason: error instanceof Error ? error.message : "Failed to pick task." };
  }
}
/** §4.5 — Update quest settings. Caps are floored at the pillar base (§4.6 cap-guard). */
export async function updateQuestSettings(input: Partial<QuestSettings>): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    const { profile } = await getOrCreate(userId);

    // Caps may only raise comfort — never shrink below the Day-1 base (§4.6).
    const workoutCapMinutes = Math.max(
      LADDERS.workout.base,
      Math.round(input.workoutCapMinutes ?? profile.workoutCapMinutes),
    );
    const studyCapMinutes = Math.max(LADDERS.study.base, Math.round(input.studyCapMinutes ?? profile.studyCapMinutes));
    const readingCapMinutes = Math.max(LADDERS.reading.base, Math.round(input.readingCapMinutes ?? profile.readingCapMinutes));
    const resetHour = Math.min(23, Math.max(1, Math.round(input.resetHour ?? profile.resetHour)));
    const heavyDayMultiplier =
      input.heavyDayMultiplier != null
        ? Math.min(2, Math.max(1, input.heavyDayMultiplier))
        : profile.heavyDayMultiplier;
    const role = input.role === "student" || input.role === "adult" ? input.role : profile.role;
    const rotation = input.rotation === "auto" || input.rotation === "manual" ? input.rotation : profile.rotation;

    const updated = await prisma.userQuestProfile.update({
      where: { userId },
      data: {
        role,
        rotation,
        workoutCapMinutes,
        studyCapMinutes,
        readingCapMinutes,
        heavyDayMultiplier,
        resetHour,
        // The onboarding wizard's final step completes here (first run only).
        onboardedAt: profile.onboardedAt ?? new Date(),
      },
    });

    const stats =
      (await prisma.playerStats.findUnique({ where: { userId } })) ??
      (await prisma.playerStats.create({ data: { userId } }));
    const settings = settingsFromProfile(updated);
    const todayKey = currentQuestDayKey(settings.resetHour);
    await dailyCheckpoint(userId, todayKey);
    await ensureTodayTask(userId, todayKey);
    const snapshot = await buildSnapshot(userId, updated, stats, todayKey);
    revalidatePath("/daily-quests");
    return { ok: true, snapshot };
  } catch (error) {
    console.error("updateQuestSettings error:", error);
    return { ok: false, reason: error instanceof Error ? error.message : "Failed to update settings." };
  }
}

/** §8.7 — Consistency heatmap data (default: trailing 12 calendar months). */
export async function getConsistency(rangeMonths = 12): Promise<{ ok: boolean; consistency?: ConsistencyView; reason?: string }> {
  try {
    const userId = await requireUserId();
    const { profile } = await getOrCreate(userId);
    const settings = settingsFromProfile(profile);
    const todayKey = currentQuestDayKey(settings.resetHour);
    await dailyCheckpoint(userId, todayKey); // flag unfinished past quests before computing cells
    const consistency = await buildConsistency(userId, profile, todayKey, Math.min(24, Math.max(1, rangeMonths)));
    return { ok: true, consistency };
  } catch (error) {
    console.error("getConsistency error:", error);
    return { ok: false, reason: error instanceof Error ? error.message : "Failed to load consistency." };
  }
}

/** §8.6 — History drill-down for one month ("YYYY-MM"). */
export async function getHistory(month: string): Promise<{ ok: boolean; days?: DaySummaryView[]; reason?: string }> {
  try {
    const userId = await requireUserId();
    if (!/^\d{4}-\d{2}$/.test(month)) return { ok: false, reason: "Invalid month key." };
    const from = `${month}-01`;
    const to = addMonths(from, 1);
    const logs = await prisma.questLog.findMany({
      where: { userId, date: { gte: from, lt: to } },
      orderBy: { date: "asc" },
    });
    const days: DaySummaryView[] = logs.map((l) => {
      const questType = l.questType.toLowerCase() as QuestType;
      const discipline = (l.discipline as Discipline) ?? null;
      return {
        date: l.date,
        questType,
        discipline,
        label: labelFor(questType, discipline, l.variant),
        status: l.status.toLowerCase() as QuestStatusType,
        targetMinutes: l.targetMinutes,
        progressMinutes: l.progressMinutes,
        xp: l.awardedXp,
        perfectDay: l.perfectDay,
        reflectionNote: l.reflectionNote,
        completedAt: l.completedAt ? l.completedAt.toISOString() : null,
      };
    });
    return { ok: true, days };
  } catch (error) {
    console.error("getHistory error:", error);
    return { ok: false, reason: error instanceof Error ? error.message : "Failed to load history." };
  }
}

/** §5.3 — Achievement shelf (catalogue + unlocked state). */
export async function getAchievements(): Promise<{
  ok: boolean;
  achievements?: AchievementView[];
  reason?: string;
}> {
  try {
    const userId = await requireUserId();
    const [catalogue, unlockedRows] = await Promise.all([
      prisma.achievement.findMany({ orderBy: { order: "asc" } }),
      prisma.userAchievement.findMany({ where: { userId }, orderBy: { unlockedAt: "asc" } }),
    ]);
    const unlockedById = new Map(unlockedRows.map((r) => [r.achievementId, r.unlockedAt.toISOString()]));
    const achievements: AchievementView[] = catalogue.map((c) => {
      const unlockedAt = unlockedById.get(c.id);
      return {
        code: c.code,
        name: c.name,
        description: c.description,
        icon: c.icon,
        color: c.color,
        unlocked: !!unlockedAt,
        unlockedAt: unlockedAt ?? null,
      };
    });
    return { ok: true, achievements };
  } catch (error) {
    console.error("getAchievements error:", error);
    return { ok: false, reason: error instanceof Error ? error.message : "Failed to load achievements." };
  }
}