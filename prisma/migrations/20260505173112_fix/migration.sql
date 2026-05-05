/*
  Warnings:

  - You are about to drop the column `numberOfLevels` on the `ExerciseSheet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ExerciseSheet" DROP COLUMN "numberOfLevels";

-- CreateTable
CREATE TABLE "ExerciseSheetComment" (
    "id" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "exerciseSheetId" TEXT,
    "exerciseSheetItemId" TEXT,
    "exerciseOnExerciseSheetItemId" TEXT,
    "userId" TEXT NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,
    "resolutionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExerciseSheetComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SheetCommentContribution" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_SheetCommentContribution_AB_unique" ON "_SheetCommentContribution"("A", "B");

-- CreateIndex
CREATE INDEX "_SheetCommentContribution_B_index" ON "_SheetCommentContribution"("B");

-- AddForeignKey
ALTER TABLE "ExerciseSheetComment" ADD CONSTRAINT "ExerciseSheetComment_exerciseSheetId_fkey" FOREIGN KEY ("exerciseSheetId") REFERENCES "ExerciseSheet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseSheetComment" ADD CONSTRAINT "ExerciseSheetComment_exerciseSheetItemId_fkey" FOREIGN KEY ("exerciseSheetItemId") REFERENCES "ExerciseSheetItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseSheetComment" ADD CONSTRAINT "ExerciseSheetComment_exerciseOnExerciseSheetItemId_fkey" FOREIGN KEY ("exerciseOnExerciseSheetItemId") REFERENCES "ExerciseOnExerciseSheetItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseSheetComment" ADD CONSTRAINT "ExerciseSheetComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseSheetComment" ADD CONSTRAINT "ExerciseSheetComment_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SheetCommentContribution" ADD CONSTRAINT "_SheetCommentContribution_A_fkey" FOREIGN KEY ("A") REFERENCES "ExerciseSheetComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SheetCommentContribution" ADD CONSTRAINT "_SheetCommentContribution_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
