/*
  Warnings:

  - The primary key for the `ChoiceFilterOption` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "ChoiceFilterValues" DROP CONSTRAINT "ChoiceFilterValues_choiceFilterOptionId_fkey";

-- AlterTable
ALTER TABLE "ChoiceFilterOption" DROP CONSTRAINT "ChoiceFilterOption_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ChoiceFilterOption_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ChoiceFilterOption_id_seq";

-- AlterTable
ALTER TABLE "ChoiceFilterValues" ALTER COLUMN "choiceFilterOptionId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "ChoiceFilterValues" ADD CONSTRAINT "ChoiceFilterValues_choiceFilterOptionId_fkey" FOREIGN KEY ("choiceFilterOptionId") REFERENCES "ChoiceFilterOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
