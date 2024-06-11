-- CreateTable
CREATE TABLE "FavoriteDocument" (
    "userId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteDocument_userId_documentId_key" ON "FavoriteDocument"("userId", "documentId");

-- AddForeignKey
ALTER TABLE "FavoriteDocument" ADD CONSTRAINT "FavoriteDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteDocument" ADD CONSTRAINT "FavoriteDocument_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
