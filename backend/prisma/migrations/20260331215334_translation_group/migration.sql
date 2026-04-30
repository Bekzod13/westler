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
    "groupId" INTEGER,
    CONSTRAINT "Translation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Translation_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Translation" ("id", "key", "languageId", "modelId", "modelType", "value") SELECT "id", "key", "languageId", "modelId", "modelType", "value" FROM "Translation";
DROP TABLE "Translation";
ALTER TABLE "new_Translation" RENAME TO "Translation";
CREATE INDEX "Translation_modelId_modelType_idx" ON "Translation"("modelId", "modelType");
CREATE INDEX "Translation_groupId_idx" ON "Translation"("groupId");
CREATE UNIQUE INDEX "Translation_modelId_modelType_key_languageId_key" ON "Translation"("modelId", "modelType", "key", "languageId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
