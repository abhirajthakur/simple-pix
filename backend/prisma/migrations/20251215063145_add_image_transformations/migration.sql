-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "isOriginal" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "transformations" JSONB;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
