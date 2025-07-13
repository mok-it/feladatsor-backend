-- CreateEnum
CREATE TYPE "ExerciseSheetStatus" AS ENUM ('DRAFT', 'CREATED', 'APPROVED', 'DELETED');

-- AlterTable
ALTER TABLE "ExerciseSheet" ADD COLUMN     "status" "ExerciseSheetStatus" NOT NULL DEFAULT 'CREATED';
