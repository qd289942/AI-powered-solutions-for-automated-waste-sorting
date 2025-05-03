/*
  Warnings:

  - You are about to drop the `ArtificialIntelligence` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Conveyor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TrashLabel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ActuatorToTrashLabel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ArtificialIntelligenceToTrashLabel` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `activationTrashLabel` to the `Actuator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `operationSectionId` to the `Actuator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Actuator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cameraXTrashhold` to the `Camera` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `_ActuatorToTrashLabel` DROP FOREIGN KEY `_ActuatorToTrashLabel_A_fkey`;

-- DropForeignKey
ALTER TABLE `_ActuatorToTrashLabel` DROP FOREIGN KEY `_ActuatorToTrashLabel_B_fkey`;

-- DropForeignKey
ALTER TABLE `_ArtificialIntelligenceToTrashLabel` DROP FOREIGN KEY `_ArtificialIntelligenceToTrashLabel_A_fkey`;

-- DropForeignKey
ALTER TABLE `_ArtificialIntelligenceToTrashLabel` DROP FOREIGN KEY `_ArtificialIntelligenceToTrashLabel_B_fkey`;

-- AlterTable
ALTER TABLE `Actuator` ADD COLUMN `activationTrashLabel` JSON NOT NULL,
    ADD COLUMN `operationSectionId` INTEGER NOT NULL,
    ADD COLUMN `type` ENUM('COMPRESSED_AIR') NOT NULL;

-- AlterTable
ALTER TABLE `Camera` ADD COLUMN `cameraXTrashhold` BIGINT NOT NULL;

-- DropTable
DROP TABLE `ArtificialIntelligence`;

-- DropTable
DROP TABLE `Conveyor`;

-- DropTable
DROP TABLE `TrashLabel`;

-- DropTable
DROP TABLE `_ActuatorToTrashLabel`;

-- DropTable
DROP TABLE `_ArtificialIntelligenceToTrashLabel`;

-- CreateTable
CREATE TABLE `OperationSection` (
    `operationSectionId` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `conveyerSpeed` DOUBLE NOT NULL,

    UNIQUE INDEX `OperationSection_name_key`(`name`),
    PRIMARY KEY (`operationSectionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Actuator` ADD CONSTRAINT `Actuator_operationSectionId_fkey` FOREIGN KEY (`operationSectionId`) REFERENCES `OperationSection`(`operationSectionId`) ON DELETE RESTRICT ON UPDATE CASCADE;
