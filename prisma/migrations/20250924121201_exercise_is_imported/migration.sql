-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "importedAt" TIMESTAMP(3),
ADD COLUMN     "isImported" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ExerciseOnExerciseSheetItem" ALTER COLUMN "id" DROP DEFAULT;
