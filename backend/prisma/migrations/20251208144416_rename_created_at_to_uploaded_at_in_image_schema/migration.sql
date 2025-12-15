/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Image` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Image" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
