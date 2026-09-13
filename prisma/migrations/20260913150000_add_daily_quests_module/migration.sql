-- AddDailyQuestsModule: Daily Quests Gamification Module (§6 data models)
-- Generated from prisma/schema.prisma via prisma migrate diff.
-- Enums: QuestStatus, QuestType
CREATE TYPE "QuestStatus" AS ENUM ('active', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "QuestType" AS ENUM ('workout', 'study', 'reading');

-- CreateTable (UserQuestProfile, QuestLog, PlayerStats, Achievement, UserAchievement)
CREATE TABLE "UserQuestProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "onboardedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT NOT NULL DEFAULT 'adult',
    "rotation" TEXT NOT NULL DEFAULT 'auto',
    "workoutCapMinutes" INTEGER NOT NULL DEFAULT 120,
    "studyCapMinutes" INTEGER NOT NULL DEFAULT 180,
    "readingCapMinutes" INTEGER NOT NULL DEFAULT 90,
    "heavyDayMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.25,
    "resetHour" INTEGER NOT NULL DEFAULT 23,
    "lastCompleteKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserQuestProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "questType" "QuestType" NOT NULL,
    "discipline" TEXT,
    "targetMinutes" INTEGER NOT NULL,
    "progressMinutes" INTEGER NOT NULL DEFAULT 0,
    "status" "QuestStatus" NOT NULL DEFAULT 'active',
    "reflectionNote" TEXT,
    "awardedXp" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "perfectDay" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerStats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "strength" INTEGER NOT NULL DEFAULT 0,
    "agility" INTEGER NOT NULL DEFAULT 0,
    "stamina" INTEGER NOT NULL DEFAULT 0,
    "intelligence" INTEGER NOT NULL DEFAULT 0,
    "sense" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "bestStreak" INTEGER NOT NULL DEFAULT 0,
    "perfectDays" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#f59e0b',
    "predicate" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "id" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
-- CreateIndex (daily-quests tables)
CREATE UNIQUE INDEX "UserQuestProfile_userId_key" ON "UserQuestProfile"("userId");

-- CreateIndex
CREATE INDEX "QuestLog_userId_status_idx" ON "QuestLog"("userId", "status");

-- CreateIndex
CREATE INDEX "QuestLog_userId_date_idx" ON "QuestLog"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "QuestLog_userId_date_key" ON "QuestLog"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerStats_userId_key" ON "PlayerStats"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_code_key" ON "Achievement"("code");

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "UserAchievement"("userId", "achievementId");
-- AddForeignKey (daily-quests tables)
ALTER TABLE "UserQuestProfile" ADD CONSTRAINT "UserQuestProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestLog" ADD CONSTRAINT "QuestLog_user_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestLog" ADD CONSTRAINT "QuestLog_profile_fkey" FOREIGN KEY ("userId") REFERENCES "UserQuestProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerStats" ADD CONSTRAINT "PlayerStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
