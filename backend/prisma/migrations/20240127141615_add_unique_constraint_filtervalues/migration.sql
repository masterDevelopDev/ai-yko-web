/*
  Warnings:

  - A unique constraint covering the columns `[filterId,documentId,searchQueryId]` on the table `FilterValue` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FilterValue_filterId_documentId_searchQueryId_key" ON "FilterValue"("filterId", "documentId", "searchQueryId");
