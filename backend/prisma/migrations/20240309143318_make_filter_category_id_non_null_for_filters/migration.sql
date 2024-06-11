/*
  Warnings:

  - Made the column `categoryId` on table `FilterOrFilterGroup` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "FilterOrFilterGroup" DROP CONSTRAINT "FilterOrFilterGroup_categoryId_fkey";

-- AlterTable
ALTER TABLE "FilterOrFilterGroup" ALTER COLUMN "categoryId" SET NOT NULL,
ALTER COLUMN "categoryId" SET DEFAULT 'generic';

-- AddForeignKey
ALTER TABLE "FilterOrFilterGroup" ADD CONSTRAINT "FilterOrFilterGroup_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
