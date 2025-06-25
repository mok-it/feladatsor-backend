-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'LIST_EXERCISES';
ALTER TYPE "Role" ADD VALUE 'CHECK_EXERCISE';
ALTER TYPE "Role" ADD VALUE 'CLONE_EXERCISE';
ALTER TYPE "Role" ADD VALUE 'FINALIZE_EXERCISE';
ALTER TYPE "Role" ADD VALUE 'EXERCISE_SHEET';
ALTER TYPE "Role" ADD VALUE 'PROOFREAD_EXERCISE_SHEET';
