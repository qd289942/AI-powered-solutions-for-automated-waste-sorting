/*
  Warnings:

  - Added the required column `cameraDistance` to the `Actuator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cameraXThreshold` to the `OperationSection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Actuator` ADD COLUMN `cameraDistance` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `OperationSection` ADD COLUMN `cameraXThreshold` INTEGER NOT NULL;
