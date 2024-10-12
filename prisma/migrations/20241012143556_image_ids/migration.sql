/*
  Warnings:

  - You are about to drop the column `elaboration` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `elaborationImage` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `exerciseImage` on the `Exercise` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Exercise" DROP COLUMN "elaboration",
DROP COLUMN "elaborationImage",
DROP COLUMN "exerciseImage",
ADD COLUMN     "exerciseImageId" TEXT,
ADD COLUMN     "solutionImageId" TEXT,
ADD COLUMN     "solveIdeaImageId" TEXT;
