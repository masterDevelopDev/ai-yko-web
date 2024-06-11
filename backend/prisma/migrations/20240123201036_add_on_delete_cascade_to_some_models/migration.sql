-- DropForeignKey
ALTER TABLE "ChoiceFilterValues" DROP CONSTRAINT "ChoiceFilterValues_filterValueId_fkey";

-- DropForeignKey
ALTER TABLE "FilterValue" DROP CONSTRAINT "FilterValue_documentId_fkey";

-- AddForeignKey
ALTER TABLE "FilterValue" ADD CONSTRAINT "FilterValue_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChoiceFilterValues" ADD CONSTRAINT "ChoiceFilterValues_filterValueId_fkey" FOREIGN KEY ("filterValueId") REFERENCES "FilterValue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
