-- AddQuestVariety: per-user task variety.
-- UserQuestProfile.questSeed (random per user) rotates workout disciplines and
-- picks deterministic task flavor variants; QuestLog.variant persists which
-- flavor was issued on that day.
ALTER TABLE "UserQuestProfile" ADD COLUMN IF NOT EXISTS "questSeed" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "QuestLog" ADD COLUMN IF NOT EXISTS "variant" INTEGER NOT NULL DEFAULT 0;