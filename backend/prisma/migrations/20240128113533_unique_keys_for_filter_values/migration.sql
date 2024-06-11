/*
  Warnings:

  - A unique constraint covering the columns `[filterId,documentId]` on the table `FilterValue` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[filterId,searchQueryId]` on the table `FilterValue` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "FilterValue_filterId_documentId_searchQueryId_key";

-- CreateIndex
CREATE UNIQUE INDEX "FilterValue_filterId_documentId_key" ON "FilterValue"("filterId", "documentId");

-- CreateIndex
CREATE UNIQUE INDEX "FilterValue_filterId_searchQueryId_key" ON "FilterValue"("filterId", "searchQueryId");
