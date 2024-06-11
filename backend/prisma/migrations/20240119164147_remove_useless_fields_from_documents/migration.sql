/*
  Warnings:

  - You are about to drop the column `metadata` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `patentRepository` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `Document` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Document" DROP COLUMN "metadata",
DROP COLUMN "patentRepository",
DROP COLUMN "year";
