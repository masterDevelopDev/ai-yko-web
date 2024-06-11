/*
  Warnings:

  - A unique constraint covering the columns `[searchEngineId]` on the table `Document` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "searchEngineId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Document_searchEngineId_key" ON "Document"("searchEngineId");
