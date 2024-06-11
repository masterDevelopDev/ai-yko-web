/*
  Warnings:

  - You are about to drop the `ChoiceFilterOption` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChoiceFilterOption" DROP CONSTRAINT "ChoiceFilterOption_filterId_fkey";

-- AlterTable
ALTER TABLE "FilterOrFilterGroup" ADD COLUMN     "options" TEXT[];

-- DropTable
DROP TABLE "ChoiceFilterOption";
