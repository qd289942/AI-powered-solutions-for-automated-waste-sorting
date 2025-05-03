/*
  Warnings:

  - You are about to drop the column `displayName` on the `ArtificialIntelligence` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `ArtificialIntelligence` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `ArtificialIntelligence` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ArtificialIntelligence` DROP COLUMN `displayName`,
    ADD COLUMN `name` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `ArtificialIntelligence_name_key` ON `ArtificialIntelligence`(`name`);
