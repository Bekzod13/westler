-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Company" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "image" TEXT NOT NULL,
    "openedYear" INTEGER,
    "elements" JSONB
);
INSERT INTO "new_Company" ("elements", "id", "image", "openedYear") SELECT "elements", "id", "image", "openedYear" FROM "Company";
DROP TABLE "Company";
ALTER TABLE "new_Company" RENAME TO "Company";
CREATE TABLE "new_Hero" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "video" TEXT,
    "image" TEXT
);
INSERT INTO "new_Hero" ("id", "image", "video") SELECT "id", "image", "video" FROM "Hero";
DROP TABLE "Hero";
ALTER TABLE "new_Hero" RENAME TO "Hero";
CREATE TABLE "new_Partner" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "image" TEXT NOT NULL,
    "link" TEXT NOT NULL
);
INSERT INTO "new_Partner" ("id", "image", "link") SELECT "id", "image", "link" FROM "Partner";
DROP TABLE "Partner";
ALTER TABLE "new_Partner" RENAME TO "Partner";
CREATE TABLE "new_Service" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "image" TEXT NOT NULL
);
INSERT INTO "new_Service" ("id", "image") SELECT "id", "image" FROM "Service";
DROP TABLE "Service";
ALTER TABLE "new_Service" RENAME TO "Service";
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
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");
