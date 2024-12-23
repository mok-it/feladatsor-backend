/*
  Warnings:

  - You are about to drop the column `exerciseSheetItemId` on the `Exercise` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Exercise" DROP CONSTRAINT "Exercise_exerciseSheetItemId_fkey";

-- AlterTable
ALTER TABLE "Exercise" DROP COLUMN "exerciseSheetItemId";

-- CreateTable
CREATE TABLE "_ExerciseToExerciseSheetItem" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ExerciseToExerciseSheetItem_AB_unique" ON "_ExerciseToExerciseSheetItem"("A", "B");

-- CreateIndex
CREATE INDEX "_ExerciseToExerciseSheetItem_B_index" ON "_ExerciseToExerciseSheetItem"("B");

-- AddForeignKey
ALTER TABLE "_ExerciseToExerciseSheetItem" ADD CONSTRAINT "_ExerciseToExerciseSheetItem_A_fkey" FOREIGN KEY ("A") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExerciseToExerciseSheetItem" ADD CONSTRAINT "_ExerciseToExerciseSheetItem_B_fkey" FOREIGN KEY ("B") REFERENCES "ExerciseSheetItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
