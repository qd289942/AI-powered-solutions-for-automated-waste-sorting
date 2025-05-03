/*
  Warnings:

  - You are about to alter the column `detectionMinThreshold` on the `OperationSection` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `OperationSection` MODIFY `detectionMinThreshold` DOUBLE NOT NULL DEFAULT 0.50;
