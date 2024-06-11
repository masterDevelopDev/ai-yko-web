/*
  Warnings:

  - You are about to drop the column `imageIndexName` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `textIndexName` on the `Category` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Category" DROP COLUMN "imageIndexName",
DROP COLUMN "textIndexName";
