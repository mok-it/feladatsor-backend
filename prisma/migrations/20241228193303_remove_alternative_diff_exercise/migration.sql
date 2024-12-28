/*
  Warnings:

  - You are about to drop the column `exerciseGroupAlternativeDifficultyId` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the `ExerciseGroupAlternativeDifficulty` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Exercise" DROP CONSTRAINT "Exercise_exerciseGroupAlternativeDifficultyId_fkey";

-- DropForeignKey
ALTER TABLE "ExerciseGroupAlternativeDifficulty" DROP CONSTRAINT "ExerciseGroupAlternativeDifficulty_createdById_fkey";

-- AlterTable
ALTER TABLE "Exercise" DROP COLUMN "exerciseGroupAlternativeDifficultyId";

-- DropTable
DROP TABLE "ExerciseGroupAlternativeDifficulty";
