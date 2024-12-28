/*
  Warnings:

  - You are about to drop the column `exerciseSheetListId` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the `ExerciseSheetList` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Exercise" DROP CONSTRAINT "Exercise_exerciseSheetListId_fkey";

-- DropForeignKey
ALTER TABLE "ExerciseSheetList" DROP CONSTRAINT "ExerciseSheetList_exerciseSheetId_fkey";

-- AlterTable
ALTER TABLE "Exercise" DROP COLUMN "exerciseSheetListId",
ADD COLUMN     "exerciseSheetItemId" TEXT;

-- DropTable
DROP TABLE "ExerciseSheetList";

-- CreateTable
CREATE TABLE "ExerciseSheetItem" (
    "id" TEXT NOT NULL,
    "ageGroup" "AgeGroup" NOT NULL,
    "level" INTEGER NOT NULL,
    "exerciseSheetId" TEXT,

    CONSTRAINT "ExerciseSheetItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_exerciseSheetItemId_fkey" FOREIGN KEY ("exerciseSheetItemId") REFERENCES "ExerciseSheetItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseSheetItem" ADD CONSTRAINT "ExerciseSheetItem_exerciseSheetId_fkey" FOREIGN KEY ("exerciseSheetId") REFERENCES "ExerciseSheet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
