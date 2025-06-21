/*
  Warnings:

  - A unique constraint covering the columns `[ownerEmail]` on the table `App` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "App_ownerEmail_key" ON "App"("ownerEmail");
