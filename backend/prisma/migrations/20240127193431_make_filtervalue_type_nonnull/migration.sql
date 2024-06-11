/*
  Warnings:

  - Made the column `type` on table `FilterValue` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "FilterValue" ALTER COLUMN "type" SET NOT NULL;
