/*
  Warnings:

  - You are about to drop the column `exerciseAgeGroupId` on the `ExerciseDifficulty` table. All the data in the column will be lost.
  - You are about to drop the `ExerciseAgeGroup` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `ageGroup` to the `ExerciseDifficulty` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ExerciseDifficulty" DROP CONSTRAINT "ExerciseDifficulty_exerciseAgeGroupId_fkey";

-- AlterTable
ALTER TABLE "ExerciseDifficulty" DROP COLUMN "exerciseAgeGroupId",
ADD COLUMN     "ageGroup" "AgeGroup" NOT NULL;

-- DropTable
DROP TABLE "ExerciseAgeGroup";
