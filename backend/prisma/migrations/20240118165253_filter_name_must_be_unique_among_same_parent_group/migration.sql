/*
  Warnings:

  - A unique constraint covering the columns `[name,parentId]` on the table `FilterOrFilterGroup` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FilterOrFilterGroup_name_parentId_key" ON "FilterOrFilterGroup"("name", "parentId");
