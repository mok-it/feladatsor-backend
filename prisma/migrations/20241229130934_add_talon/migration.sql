/*
  Warnings:

  - You are about to drop the `_ExerciseToExerciseSheet` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ExerciseToExerciseSheet" DROP CONSTRAINT "_ExerciseToExerciseSheet_A_fkey";

-- DropForeignKey
ALTER TABLE "_ExerciseToExerciseSheet" DROP CONSTRAINT "_ExerciseToExerciseSheet_B_fkey";

-- AlterTable
ALTER TABLE "ExerciseSheet" ADD COLUMN     "exerciseId" TEXT;

-- DropTable
DROP TABLE "_ExerciseToExerciseSheet";

-- CreateTable
CREATE TABLE "TalonItem" (
    "exerciseId" TEXT NOT NULL,
    "exerciseSheetId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "TalonItem_pkey" PRIMARY KEY ("exerciseId","exerciseSheetId")
);

-- AddForeignKey
ALTER TABLE "ExerciseSheet" ADD CONSTRAINT "ExerciseSheet_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalonItem" ADD CONSTRAINT "TalonItem_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalonItem" ADD CONSTRAINT "TalonItem_exerciseSheetId_fkey" FOREIGN KEY ("exerciseSheetId") REFERENCES "ExerciseSheet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
