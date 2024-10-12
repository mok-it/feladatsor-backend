/*
  Warnings:

  - Added the required column `field` to the `ExerciseHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `newValue` to the `ExerciseHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `oldValue` to the `ExerciseHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `ExerciseHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ExerciseHistory" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "field" TEXT NOT NULL,
ADD COLUMN     "newValue" TEXT NOT NULL,
ADD COLUMN     "oldValue" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ExerciseHistory" ADD CONSTRAINT "ExerciseHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
