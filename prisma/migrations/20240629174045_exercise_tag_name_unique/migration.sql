/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `ExerciseTag` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ExerciseTag_name_key" ON "ExerciseTag"("name");
