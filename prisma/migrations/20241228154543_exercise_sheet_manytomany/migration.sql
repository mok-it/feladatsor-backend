/*
  Warnings:

  - You are about to drop the `_ExerciseToExerciseSheetItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ExerciseToExerciseSheetItem" DROP CONSTRAINT "_ExerciseToExerciseSheetItem_A_fkey";

-- DropForeignKey
ALTER TABLE "_ExerciseToExerciseSheetItem" DROP CONSTRAINT "_ExerciseToExerciseSheetItem_B_fkey";

-- DropTable
DROP TABLE "_ExerciseToExerciseSheetItem";

-- CreateTable
CREATE TABLE "ExerciseOnExerciseSheetItem" (
    "exerciseId" TEXT NOT NULL,
    "exerciseSheetItemId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "ExerciseOnExerciseSheetItem_pkey" PRIMARY KEY ("exerciseId","exerciseSheetItemId")
);

-- CreateTable
CREATE TABLE "_ExerciseToExerciseSheet" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ExerciseToExerciseSheet_AB_unique" ON "_ExerciseToExerciseSheet"("A", "B");

-- CreateIndex
CREATE INDEX "_ExerciseToExerciseSheet_B_index" ON "_ExerciseToExerciseSheet"("B");

-- AddForeignKey
ALTER TABLE "ExerciseOnExerciseSheetItem" ADD CONSTRAINT "ExerciseOnExerciseSheetItem_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseOnExerciseSheetItem" ADD CONSTRAINT "ExerciseOnExerciseSheetItem_exerciseSheetItemId_fkey" FOREIGN KEY ("exerciseSheetItemId") REFERENCES "ExerciseSheetItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExerciseToExerciseSheet" ADD CONSTRAINT "_ExerciseToExerciseSheet_A_fkey" FOREIGN KEY ("A") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExerciseToExerciseSheet" ADD CONSTRAINT "_ExerciseToExerciseSheet_B_fkey" FOREIGN KEY ("B") REFERENCES "ExerciseSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
