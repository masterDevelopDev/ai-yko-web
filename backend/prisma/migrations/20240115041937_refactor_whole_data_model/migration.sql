-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'OPERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('BOTTLES', 'JEWELLERY', 'WATCHES', 'WRITING_INSTRUMENTS');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PROCESSING', 'INDEXED');

-- CreateEnum
CREATE TYPE "TextFilterSearchMode" AS ENUM ('EQUAL', 'CONTAINS', 'STARTSWITH', 'ENDSWITH', 'ISNULL', 'ISIN');

-- CreateEnum
CREATE TYPE "DateFilterSearchMode" AS ENUM ('EQUAL', 'BEFORE', 'AFTER');

-- CreateEnum
CREATE TYPE "MonitoringFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "FilterKind" AS ENUM ('GROUP', 'FILTER');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "isEmailValidated" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "year" TEXT,
    "patentRepository" TEXT,
    "category" "DocumentCategory",
    "metadata" JSONB,
    "creatorId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PROCESSING',
    "batchId" TEXT,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FilterValue" (
    "id" SERIAL NOT NULL,
    "documentId" INTEGER,
    "filterId" TEXT NOT NULL,
    "searchQueryId" INTEGER,
    "text" TEXT,
    "textMode" "TextFilterSearchMode",
    "date" TEXT,
    "dateMode" "DateFilterSearchMode",
    "negate" BOOLEAN,

    CONSTRAINT "FilterValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChoiceFilterValues" (
    "id" SERIAL NOT NULL,
    "choiceFilterOptionId" INTEGER NOT NULL,
    "filterValueId" INTEGER NOT NULL,

    CONSTRAINT "ChoiceFilterValues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchQuery" (
    "id" SERIAL NOT NULL,
    "text" TEXT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "isMonitored" BOOLEAN NOT NULL DEFAULT false,
    "monitoringFrequency" "MonitoringFrequency",

    CONSTRAINT "SearchQuery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FilterOrFilterGroup" (
    "id" TEXT NOT NULL,
    "type" "FilterKind" NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "isMultiChoice" BOOLEAN,

    CONSTRAINT "FilterOrFilterGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChoiceFilterOption" (
    "id" SERIAL NOT NULL,
    "filterId" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "ChoiceFilterOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "documentId" INTEGER,
    "searchId" INTEGER,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Document_url_key" ON "Document"("url");

-- CreateIndex
CREATE UNIQUE INDEX "ChoiceFilterValues_filterValueId_choiceFilterOptionId_key" ON "ChoiceFilterValues"("filterValueId", "choiceFilterOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "ChoiceFilterOption_filterId_value_key" ON "ChoiceFilterOption"("filterId", "value");

-- CreateIndex
CREATE UNIQUE INDEX "Image_url_key" ON "Image"("url");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FilterValue" ADD CONSTRAINT "FilterValue_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FilterValue" ADD CONSTRAINT "FilterValue_filterId_fkey" FOREIGN KEY ("filterId") REFERENCES "FilterOrFilterGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FilterValue" ADD CONSTRAINT "FilterValue_searchQueryId_fkey" FOREIGN KEY ("searchQueryId") REFERENCES "SearchQuery"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChoiceFilterValues" ADD CONSTRAINT "ChoiceFilterValues_choiceFilterOptionId_fkey" FOREIGN KEY ("choiceFilterOptionId") REFERENCES "ChoiceFilterOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChoiceFilterValues" ADD CONSTRAINT "ChoiceFilterValues_filterValueId_fkey" FOREIGN KEY ("filterValueId") REFERENCES "FilterValue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchQuery" ADD CONSTRAINT "SearchQuery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FilterOrFilterGroup" ADD CONSTRAINT "FilterOrFilterGroup_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "FilterOrFilterGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChoiceFilterOption" ADD CONSTRAINT "ChoiceFilterOption_filterId_fkey" FOREIGN KEY ("filterId") REFERENCES "FilterOrFilterGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_searchId_fkey" FOREIGN KEY ("searchId") REFERENCES "SearchQuery"("id") ON DELETE SET NULL ON UPDATE CASCADE;
