/*
  Warnings:

  - A unique constraint covering the columns `[exerciseId,userId]` on the table `ExerciseCheck` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AggregatedCheckStatus" AS ENUM ('NEEDS_TO_BE_CHECKED', 'GOOD', 'CHANGE_REQUIRED', 'TO_DELETE');

-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "aggregatedCheckStatus" "AggregatedCheckStatus" NOT NULL DEFAULT 'NEEDS_TO_BE_CHECKED';

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseCheck_exerciseId_userId_key" ON "ExerciseCheck"("exerciseId", "userId");
