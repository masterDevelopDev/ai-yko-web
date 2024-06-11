/*
  Warnings:

  - You are about to drop the column `date` on the `FilterValue` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `FilterValue` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FilterValue" DROP COLUMN "date",
DROP COLUMN "text",
ADD COLUMN     "stringValue" TEXT;
