/*
  Warnings:

  - You are about to drop the column `mimeType` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `Image` table. All the data in the column will be lost.
  - Added the required column `originalMimeType` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalSize` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transformedSize` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Image" DROP COLUMN "mimeType",
DROP COLUMN "size",
ADD COLUMN     "originalMimeType" TEXT NOT NULL,
ADD COLUMN     "originalSize" BIGINT NOT NULL,
ADD COLUMN     "transformedSize" BIGINT NOT NULL;
