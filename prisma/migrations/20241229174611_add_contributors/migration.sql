-- CreateTable
CREATE TABLE "_ExerciseContribution" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CommentContribution" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ExerciseCheckContribution" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ExerciseContribution_AB_unique" ON "_ExerciseContribution"("A", "B");

-- CreateIndex
CREATE INDEX "_ExerciseContribution_B_index" ON "_ExerciseContribution"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CommentContribution_AB_unique" ON "_CommentContribution"("A", "B");

-- CreateIndex
CREATE INDEX "_CommentContribution_B_index" ON "_CommentContribution"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ExerciseCheckContribution_AB_unique" ON "_ExerciseCheckContribution"("A", "B");

-- CreateIndex
CREATE INDEX "_ExerciseCheckContribution_B_index" ON "_ExerciseCheckContribution"("B");

-- AddForeignKey
ALTER TABLE "_ExerciseContribution" ADD CONSTRAINT "_ExerciseContribution_A_fkey" FOREIGN KEY ("A") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExerciseContribution" ADD CONSTRAINT "_ExerciseContribution_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CommentContribution" ADD CONSTRAINT "_CommentContribution_A_fkey" FOREIGN KEY ("A") REFERENCES "ExerciseComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CommentContribution" ADD CONSTRAINT "_CommentContribution_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExerciseCheckContribution" ADD CONSTRAINT "_ExerciseCheckContribution_A_fkey" FOREIGN KEY ("A") REFERENCES "ExerciseCheck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExerciseCheckContribution" ADD CONSTRAINT "_ExerciseCheckContribution_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
