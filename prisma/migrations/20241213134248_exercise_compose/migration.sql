-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "exerciseSheetListId" TEXT;

-- CreateTable
CREATE TABLE "ExerciseSheet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExerciseSheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseSheetList" (
    "id" TEXT NOT NULL,
    "ageGroup" "AgeGroup" NOT NULL,
    "exerciseSheetId" TEXT,

    CONSTRAINT "ExerciseSheetList_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_exerciseSheetListId_fkey" FOREIGN KEY ("exerciseSheetListId") REFERENCES "ExerciseSheetList"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseSheet" ADD CONSTRAINT "ExerciseSheet_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseSheetList" ADD CONSTRAINT "ExerciseSheetList_exerciseSheetId_fkey" FOREIGN KEY ("exerciseSheetId") REFERENCES "ExerciseSheet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
