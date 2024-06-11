-- DropForeignKey
ALTER TABLE "FilterValue" DROP CONSTRAINT "FilterValue_filterId_fkey";

-- DropForeignKey
ALTER TABLE "FilterValue" DROP CONSTRAINT "FilterValue_searchQueryId_fkey";

-- DropForeignKey
ALTER TABLE "SearchQuery" DROP CONSTRAINT "SearchQuery_userId_fkey";

-- AddForeignKey
ALTER TABLE "FilterValue" ADD CONSTRAINT "FilterValue_filterId_fkey" FOREIGN KEY ("filterId") REFERENCES "FilterOrFilterGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FilterValue" ADD CONSTRAINT "FilterValue_searchQueryId_fkey" FOREIGN KEY ("searchQueryId") REFERENCES "SearchQuery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchQuery" ADD CONSTRAINT "SearchQuery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
