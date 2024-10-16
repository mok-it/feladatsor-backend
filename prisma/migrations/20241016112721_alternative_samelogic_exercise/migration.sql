/*
  Warnings:

  - You are about to drop the column `alternativeDifficultyExerciseId` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `sameLogicExerciseId` on the `Exercise` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Exercise" DROP CONSTRAINT "Exercise_alternativeDifficultyExerciseId_fkey";

-- DropForeignKey
ALTER TABLE "Exercise" DROP CONSTRAINT "Exercise_sameLogicExerciseId_fkey";

-- AlterTable
ALTER TABLE "Exercise" DROP COLUMN "alternativeDifficultyExerciseId",
DROP COLUMN "sameLogicExerciseId",
ADD COLUMN     "exerciseGroupAlternativeDifficultyId" TEXT,
ADD COLUMN     "exerciseGroupSameLogicId" TEXT;

-- CreateTable
CREATE TABLE "ExerciseGroupAlternativeDifficulty" (
    "id" TEXT NOT NULL,
    "description" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExerciseGroupAlternativeDifficulty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseGroupSameLogic" (
    "id" TEXT NOT NULL,
    "description" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExerciseGroupSameLogic_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_exerciseGroupAlternativeDifficultyId_fkey" FOREIGN KEY ("exerciseGroupAlternativeDifficultyId") REFERENCES "ExerciseGroupAlternativeDifficulty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_exerciseGroupSameLogicId_fkey" FOREIGN KEY ("exerciseGroupSameLogicId") REFERENCES "ExerciseGroupSameLogic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseGroupAlternativeDifficulty" ADD CONSTRAINT "ExerciseGroupAlternativeDifficulty_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseGroupSameLogic" ADD CONSTRAINT "ExerciseGroupSameLogic_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
