/*
  Warnings:

  - A unique constraint covering the columns `[filename]` on the table `Document` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Document_filename_key" ON "Document"("filename");
