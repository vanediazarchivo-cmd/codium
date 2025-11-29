/*
  Warnings:

  - Added the required field `challengeId` to the `evaluation_challenges` table without a default value. This is not possible if the table has no rows.

*/
-- AlterTable
ALTER TABLE "submissions" ADD COLUMN "evaluationId" UUID;

-- AlterTable
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_evaluations_fk" FOREIGN KEY ("id") REFERENCES "evaluation_challenges"("challengeId") ON DELETE CASCADE;

-- AlterTable
ALTER TABLE "evaluation_challenges" ADD CONSTRAINT "evaluation_challenges_challenge_fk" FOREIGN KEY ("challengeId") REFERENCES "challenges"("id") ON DELETE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_evaluation_fk" FOREIGN KEY ("evaluationId") REFERENCES "evaluations"("id") ON DELETE SET NULL;

-- CreateIndex
CREATE INDEX "submissions_evaluationId_idx" ON "submissions"("evaluationId");
CREATE INDEX "evaluation_challenges_challengeId_idx" ON "evaluation_challenges"("challengeId");
