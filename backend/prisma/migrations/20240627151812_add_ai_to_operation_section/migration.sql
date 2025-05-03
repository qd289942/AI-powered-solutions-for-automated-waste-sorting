/*
  Warnings:

  - Added the required column `aiId` to the `OperationSection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ArtificialIntelligence` ADD COLUMN `operationSectionId` INTEGER NULL;

-- AlterTable
ALTER TABLE `OperationSection` ADD COLUMN `aiId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `OperationSection` ADD CONSTRAINT `OperationSection_aiId_fkey` FOREIGN KEY (`aiId`) REFERENCES `ArtificialIntelligence`(`aiId`) ON DELETE RESTRICT ON UPDATE CASCADE;
