-- CreateEnum
CREATE TYPE "AgeGroup" AS ENUM ('KOALA', 'MEDVEBOCS', 'KISMEDVE', 'NAGYMEDVE', 'JEGESMEDVE');

-- CreateEnum
CREATE TYPE "ExerciseCheckType" AS ENUM ('GOOD', 'CHANGE_REQUIRED', 'TO_DELETE');

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "exerciseImage" TEXT,
    "solution" TEXT NOT NULL,
    "elaboration" TEXT,
    "elaborationImage" TEXT,
    "helpingQuestions" TEXT[],
    "source" TEXT,
    "similarExerciseId" TEXT,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseDifficulty" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "exerciseAgeGroupId" TEXT NOT NULL,

    CONSTRAINT "ExerciseDifficulty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseAgeGroup" (
    "id" TEXT NOT NULL,
    "ageGroup" TEXT NOT NULL,

    CONSTRAINT "ExerciseAgeGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseCheck" (
    "id" SERIAL NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "ExerciseCheckType" NOT NULL,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL,

    CONSTRAINT "ExerciseCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseHistory" (
    "id" SERIAL NOT NULL,
    "exerciseId" TEXT NOT NULL,

    CONSTRAINT "ExerciseHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_similarExerciseId_fkey" FOREIGN KEY ("similarExerciseId") REFERENCES "Exercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseDifficulty" ADD CONSTRAINT "ExerciseDifficulty_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseDifficulty" ADD CONSTRAINT "ExerciseDifficulty_exerciseAgeGroupId_fkey" FOREIGN KEY ("exerciseAgeGroupId") REFERENCES "ExerciseAgeGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseCheck" ADD CONSTRAINT "ExerciseCheck_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseCheck" ADD CONSTRAINT "ExerciseCheck_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseHistory" ADD CONSTRAINT "ExerciseHistory_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
