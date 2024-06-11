/*
  Warnings:

  - You are about to drop the column `isMultiChoice` on the `FilterOrFilterGroup` table. All the data in the column will be lost.
  - Added the required column `kind` to the `FilterOrFilterGroup` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `FilterOrFilterGroup` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "FilterType" AS ENUM ('DATE', 'TEXT', 'SINGLE_CHOICE', 'MULTI_CHOICE');

-- AlterTable
ALTER TABLE "FilterOrFilterGroup" DROP COLUMN "isMultiChoice",
ADD COLUMN     "kind" "FilterKind" NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "FilterType" NOT NULL;
