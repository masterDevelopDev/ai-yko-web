/*
  Warnings:

  - You are about to drop the column `searchEngineId` on the `Document` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Document_searchEngineId_key";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "searchEngineId";
