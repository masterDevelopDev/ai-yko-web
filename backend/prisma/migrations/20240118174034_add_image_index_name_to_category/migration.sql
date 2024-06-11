/*
  Warnings:

  - You are about to drop the column `indexName` on the `Category` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Category" DROP COLUMN "indexName",
ADD COLUMN     "imageIndexName" TEXT,
ADD COLUMN     "textIndexName" TEXT;
