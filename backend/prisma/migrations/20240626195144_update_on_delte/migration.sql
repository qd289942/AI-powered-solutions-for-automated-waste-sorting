-- DropForeignKey
ALTER TABLE `Actuator` DROP FOREIGN KEY `Actuator_operationSectionId_fkey`;

-- AddForeignKey
ALTER TABLE `Actuator` ADD CONSTRAINT `Actuator_operationSectionId_fkey` FOREIGN KEY (`operationSectionId`) REFERENCES `OperationSection`(`operationSectionId`) ON DELETE CASCADE ON UPDATE CASCADE;
