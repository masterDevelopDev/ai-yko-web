/*
  Warnings:

  - The values [NUMBER] on the enum `FilterType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `ChoiceFilterValues` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FilterType_new" AS ENUM ('DATE', 'TEXT', 'SINGLE_CHOICE', 'MULTI_CHOICE', 'YEAR', 'INTEGER');
ALTER TABLE "FilterOrFilterGroup" ALTER COLUMN "type" TYPE "FilterType_new" USING ("type"::text::"FilterType_new");
ALTER TYPE "FilterType" RENAME TO "FilterType_old";
ALTER TYPE "FilterType_new" RENAME TO "FilterType";
DROP TYPE "FilterType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "ChoiceFilterValues" DROP CONSTRAINT "ChoiceFilterValues_choiceFilterOptionId_fkey";

-- DropForeignKey
ALTER TABLE "ChoiceFilterValues" DROP CONSTRAINT "ChoiceFilterValues_filterValueId_fkey";

-- AlterTable
ALTER TABLE "FilterValue" ADD COLUMN     "choiceIds" TEXT[],
ADD COLUMN     "integerValue" INTEGER;

-- DropTable
DROP TABLE "ChoiceFilterValues";
