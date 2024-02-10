/*
  Warnings:

  - The primary key for the `ExerciseCheck` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ExerciseHistory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `ageGroup` on the `ExerciseAgeGroup` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Exercise" DROP CONSTRAINT "Exercise_createdById_fkey";

-- DropForeignKey
ALTER TABLE "ExerciseCheck" DROP CONSTRAINT "ExerciseCheck_userId_fkey";

-- AlterTable
ALTER TABLE "Exercise" ALTER COLUMN "createdById" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "ExerciseAgeGroup" DROP COLUMN "ageGroup",
ADD COLUMN     "ageGroup" "AgeGroup" NOT NULL;

-- AlterTable
ALTER TABLE "ExerciseCheck" DROP CONSTRAINT "ExerciseCheck_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "ExerciseCheck_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ExerciseCheck_id_seq";

-- AlterTable
ALTER TABLE "ExerciseHistory" DROP CONSTRAINT "ExerciseHistory_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ExerciseHistory_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ExerciseHistory_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseCheck" ADD CONSTRAINT "ExerciseCheck_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
