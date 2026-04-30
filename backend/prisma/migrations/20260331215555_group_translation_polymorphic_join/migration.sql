/*
  Warnings:

  - You are about to drop the column `groupId` on the `Translation` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "GroupTranslation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "groupId" INTEGER NOT NULL,
    "modelId" INTEGER NOT NULL,
    "modelType" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "languageId" INTEGER NOT NULL,
    CONSTRAINT "GroupTranslation_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GroupTranslation_modelId_modelType_field_languageId_fkey" FOREIGN KEY ("modelId", "modelType", "field", "languageId") REFERENCES "Translation" ("modelId", "modelType", "key", "languageId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Translation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "languageId" INTEGER NOT NULL,
    "modelId" INTEGER NOT NULL,
    "modelType" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "Translation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Translation" ("id", "key", "languageId", "modelId", "modelType", "value") SELECT "id", "key", "languageId", "modelId", "modelType", "value" FROM "Translation";
DROP TABLE "Translation";
ALTER TABLE "new_Translation" RENAME TO "Translation";
CREATE INDEX "Translation_modelId_modelType_idx" ON "Translation"("modelId", "modelType");
CREATE UNIQUE INDEX "Translation_modelId_modelType_key_languageId_key" ON "Translation"("modelId", "modelType", "key", "languageId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "GroupTranslation_groupId_idx" ON "GroupTranslation"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupTranslation_modelId_modelType_field_languageId_key" ON "GroupTranslation"("modelId", "modelType", "field", "languageId");
