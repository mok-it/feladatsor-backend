/*
  Warnings:

  - You are about to drop the column `name` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `similarExerciseId` on the `Exercise` table. All the data in the column will be lost.
  - Added the required column `status` to the `Exercise` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ExerciseStatus" AS ENUM ('DRAFT', 'CREATED', 'APPROVED', 'DELETED');

-- DropForeignKey
ALTER TABLE "Exercise" DROP CONSTRAINT "Exercise_similarExerciseId_fkey";

-- AlterTable
ALTER TABLE "Exercise" DROP COLUMN "name",
DROP COLUMN "similarExerciseId",
ADD COLUMN     "alternativeDifficultyExerciseId" TEXT,
ADD COLUMN     "isCompetitionFinal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sameLogicExerciseId" TEXT,
ADD COLUMN     "solutionOptions" TEXT[],
ADD COLUMN     "solveIdea" TEXT,
ADD COLUMN     "status" "ExerciseStatus" NOT NULL;

-- CreateTable
CREATE TABLE "ExerciseTag" (
    "id" TEXT NOT NULL,
    "parentExerciseTagId" TEXT,
    "name" TEXT NOT NULL,

    CONSTRAINT "ExerciseTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseComment" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExerciseComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ExerciseToExerciseTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ExerciseToExerciseTag_AB_unique" ON "_ExerciseToExerciseTag"("A", "B");

-- CreateIndex
CREATE INDEX "_ExerciseToExerciseTag_B_index" ON "_ExerciseToExerciseTag"("B");

-- AddForeignKey
ALTER TABLE "ExerciseTag" ADD CONSTRAINT "ExerciseTag_parentExerciseTagId_fkey" FOREIGN KEY ("parentExerciseTagId") REFERENCES "ExerciseTag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_alternativeDifficultyExerciseId_fkey" FOREIGN KEY ("alternativeDifficultyExerciseId") REFERENCES "Exercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_sameLogicExerciseId_fkey" FOREIGN KEY ("sameLogicExerciseId") REFERENCES "Exercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseComment" ADD CONSTRAINT "ExerciseComment_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseComment" ADD CONSTRAINT "ExerciseComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExerciseToExerciseTag" ADD CONSTRAINT "_ExerciseToExerciseTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExerciseToExerciseTag" ADD CONSTRAINT "_ExerciseToExerciseTag_B_fkey" FOREIGN KEY ("B") REFERENCES "ExerciseTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
