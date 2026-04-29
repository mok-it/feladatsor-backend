-- AlterTable
ALTER TABLE "ExerciseSheet" ADD COLUMN     "maxExercisesPerLevel" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "numberOfLevels" INTEGER NOT NULL DEFAULT 4;
