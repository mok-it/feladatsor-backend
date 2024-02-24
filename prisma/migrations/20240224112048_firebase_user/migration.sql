-- AlterTable
ALTER TABLE "User" ADD COLUMN     "firebaseId" TEXT,
ALTER COLUMN "password" DROP NOT NULL;
