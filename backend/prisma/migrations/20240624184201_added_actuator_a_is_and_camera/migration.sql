-- CreateTable
CREATE TABLE `Conveyor` (
    `conveyorId` INTEGER NOT NULL AUTO_INCREMENT,
    `bcName` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Conveyor_bcName_key`(`bcName`),
    PRIMARY KEY (`conveyorId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Camera` (
    `cameraId` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`cameraId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TrashLabel` (
    `labelId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `TrashLabel_labelId_key`(`labelId`),
    PRIMARY KEY (`labelId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ArtificialIntelligence` (
    `aiId` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`aiId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Actuator` (
    `actuatorId` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`actuatorId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ArtificialIntelligenceToTrashLabel` (
    `A` INTEGER NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ArtificialIntelligenceToTrashLabel_AB_unique`(`A`, `B`),
    INDEX `_ArtificialIntelligenceToTrashLabel_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ActuatorToTrashLabel` (
    `A` INTEGER NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ActuatorToTrashLabel_AB_unique`(`A`, `B`),
    INDEX `_ActuatorToTrashLabel_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_ArtificialIntelligenceToTrashLabel` ADD CONSTRAINT `_ArtificialIntelligenceToTrashLabel_A_fkey` FOREIGN KEY (`A`) REFERENCES `ArtificialIntelligence`(`aiId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ArtificialIntelligenceToTrashLabel` ADD CONSTRAINT `_ArtificialIntelligenceToTrashLabel_B_fkey` FOREIGN KEY (`B`) REFERENCES `TrashLabel`(`labelId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ActuatorToTrashLabel` ADD CONSTRAINT `_ActuatorToTrashLabel_A_fkey` FOREIGN KEY (`A`) REFERENCES `Actuator`(`actuatorId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ActuatorToTrashLabel` ADD CONSTRAINT `_ActuatorToTrashLabel_B_fkey` FOREIGN KEY (`B`) REFERENCES `TrashLabel`(`labelId`) ON DELETE CASCADE ON UPDATE CASCADE;
