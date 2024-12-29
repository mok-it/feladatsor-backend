-- CreateEnum
CREATE TYPE "ExerciseAlertSeverity" AS ENUM ('SUCCESS', 'INFO', 'WARNING', 'ERROR');

-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "alertDescription" TEXT,
ADD COLUMN     "alertSeverty" "ExerciseAlertSeverity";
