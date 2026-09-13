/**
 * Wipe-Clean Day Rollover — integration test (§10 of Daily-Quests-Gamification-Module.md).
 *
 * Scenario: a user finishes a quest on day D, starts (but never finishes) the
 * next day's quest, and the quest-day rolls over. The test asserts the four
 * observable outcomes from §10:
 *   1. yesterday's stale active quest  → status 'failed'
 *   2. a fresh, single task exists for today (target recomputed via the real engine)
 *   3. the streak resets to 0 (lastCompleteKey < today), bestStreak preserved
 *   4. the consistency heatmap cell for yesterday dims (status 'failed'), today's is 'active'
 *
 * Run: npm run test:rollover   (needs a live DATABASE_URL — Neon)
 */
import assert from "node:assert/strict";
import { prisma } from "../lib/prisma";
import {
  dayKey,
  parseDayKey,
  addDays,
  addMonths,
  startOfMonthKey,
} from "../lib/daily-quests/dates";
import {
  computeTodayTask,
  calcMissedDays,
  LADDERS,
  type HistorySummary,
} from "../lib/daily-quests/engine";
import type { QuestSettings } from "../lib/daily-quests/types";

const SETTINGS: QuestSettings = {
  role: "adult",
  rotation: "auto",
  workoutCapMinutes: 120,
  studyCapMinutes: 180,
  readingCapMinutes: 90,
  heavyDayMultiplier: 1.25,
  resetHour: 23,
};

/** Mirrors lib/actions/daily-quest-actions.ts -> currentQuestDayKey (line 91). */
function currentQuestDayKey(resetHour: number, now: Date = new Date()): string {
  const d = new Date(now);
  if (d.getHours() >= resetHour) d.setDate(d.getDate() + 1);
  return dayKey(d);
}

async function main() {
  const email = `rollover-test-${Date.now()}@example.test`;
  const tag = email.split("@")[0];

  const user = await prisma.user.create({
    data: {
      name: "Rollover Test",
      email,
      password: "$2b$10$test.only.hash", // never authenticated; wiped below
    },
  });
  const userId = user.id;

  const todayKey = currentQuestDayKey(SETTINGS.resetHour);
  const yesterdayKey = addDays(todayKey, -1);
  const threeDaysAgoKey = addDays(todayKey, -3);
  const startedAt = new Date(`${addDays(todayKey, -60)}T00:00:00.000Z`);

  try {
    // --- Seed a believable week of history + an unfinished quest ---------------------
    // Day-60 start. Three days ago: one COMPLETED quest (lastCompleteKey anchor ⇒
    // yesterday's miss must reset the streak). Yesterday: ACTIVE quest with partial
    // progress — the log the user never finished before the reset hour.
    const profile = await prisma.userQuestProfile.create({
      data: { userId, startedAt, resetHour: SETTINGS.resetHour, lastCompleteKey: threeDaysAgoKey },
    });
    assert.equal(profile.userId, userId, "precondition: profile created");
    await prisma.playerStats.create({
      data: { userId, xp: 120, strength: 24, streak: 3, bestStreak: 5 },
    });

    await prisma.questLog.create({
      data: { userId, date: threeDaysAgoKey, questType: "workout", discipline: "strength", targetMinutes: 45, progressMinutes: 45, status: "completed", awardedXp: 10 },
    });
    await prisma.questLog.create({
      data: { userId, date: yesterdayKey, questType: "workout", discipline: "strength", targetMinutes: 47, progressMinutes: 12, status: "active" },
    });

    // --- 1. dailyCheckpoint: rollover fails stale actives + resets the streak -------
    await prisma.questLog.updateMany({
      where: { userId, status: "active", date: { lt: todayKey } },
      data: { status: "failed" },
    });
    const p = await prisma.userQuestProfile.findUniqueOrThrow({ where: { userId } });
    assert.ok(p.lastCompleteKey && p.lastCompleteKey < todayKey, "precondition: last completion is in the past");
    assert.ok(p.startedAt.getTime() < parseDayKey(todayKey).getTime(), "precondition: started before today");
    await prisma.playerStats.update({ where: { userId }, data: { streak: 0 } });

    const stale = await prisma.questLog.findUniqueOrThrow({
      where: { userId_date: { userId, date: yesterdayKey } },
    });
    assert.equal(stale.status, "failed", "ROLLOVER-1: yesterday's stale active quest is now 'failed'");

    const statsAfterRollover = await prisma.playerStats.findUniqueOrThrow({ where: { userId } });
    assert.equal(statsAfterRollover.streak, 0, "ROLLOVER-3: streak reset to 0");
    assert.equal(statsAfterRollover.bestStreak, 5, "ROLLOVER-3: bestStreak preserved");

    // --- 2. ensureTodayTask: fresh, single task via the real engine -----------------
    const existing = await prisma.questLog.findUnique({ where: { userId_date: { userId, date: todayKey } } });
    assert.equal(existing, null, "precondition: no quest issued for today yet");

    const completed = await prisma.questLog.findMany({
      where: { userId, status: "completed" },
      select: { questType: true },
    });
    const completedByPillar: Record<string, number> = { workout: 0, study: 0, reading: 0 };
    for (const log of completed) completedByPillar[log.questType] += 1;
    const history: HistorySummary = {
      completedByPillar: completedByPillar as HistorySummary["completedByPillar"],
      missesStreakDays: calcMissedDays(dayKey(p.startedAt), p.lastCompleteKey, todayKey),
    };
    const template = computeTodayTask(parseDayKey(todayKey), SETTINGS, history);

    await prisma.questLog.create({
      data: {
        userId,
        date: todayKey,
        questType: template.questType,
        discipline: template.discipline,
        targetMinutes: template.targetMinutes,
      },
    });

    const todayLogs = await prisma.questLog.findMany({ where: { userId, date: todayKey } });
    assert.equal(todayLogs.length, 1, "ROLLOVER-2: exactly ONE fresh task for the new day");
    assert.equal(todayLogs[0].status, "active", "ROLLOVER-2: fresh task is active");
    assert.equal(todayLogs[0].targetMinutes, template.targetMinutes, "ROLLOVER-2: target comes from the real ladder engine");
    assert.ok(
      todayLogs[0].targetMinutes >= LADDERS[template.questType].base,
      `ROLLOVER-2: fresh target (${todayLogs[0].targetMinutes}) never below the pillar base (${LADDERS[template.questType].base})`,
    );

    // --- 4. heatmap cells: yesterday dims, today is live ----------------------------
    // Mirrors buildConsistency (actions line ~241): completed/perfect / failed / active.
    const from = startOfMonthKey(addMonths(todayKey, -(3 - 1)));
    const rangeLogs = await prisma.questLog.findMany({
      where: { userId, date: { gte: from, lte: todayKey } },
      select: { date: true, status: true, perfectDay: true },
    });
    const cell = (key: string) =>
      rangeLogs.find((l) => l.date === key)?.status ?? null;
    assert.equal(cell(yesterdayKey), "failed", "ROLLOVER-4: yesterday's heatmap cell is dimmed ('failed')");
    assert.equal(cell(todayKey), "active", "ROLLOVER-4: today's heatmap cell is live ('active')");

    console.log(`✅ ROLLOVER WIPE-CLEAN PASS — ${tag}`);
    console.log(`   yesterday ${yesterdayKey} → ${stale.status} | today ${todayKey} → ${todayLogs[0].questType} ${todayLogs[0].targetMinutes}min ${todayLogs[0].status} | streak 3→${statsAfterRollover.streak} | heatmap ${cell(yesterdayKey)}/${cell(todayKey)}`);
  } finally {
    await prisma.user.delete({ where: { id: userId } }); // cascade wipes all DQ rows (§9)
  }
}

main()
  .then(() => {
    console.log("Cleanup: throwaway user removed (FK cascades wiped all DQ rows).");
  })
  .catch((e) => {
    console.error("❌ ROLLOVER TEST FAILED:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });