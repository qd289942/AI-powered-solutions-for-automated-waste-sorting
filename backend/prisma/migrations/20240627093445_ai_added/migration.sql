-- CreateTable
CREATE TABLE `ArtificialIntelligence` (
    `aiId` INTEGER NOT NULL AUTO_INCREMENT,
    `displayName` VARCHAR(191) NOT NULL,
    `detectionLabels` JSON NOT NULL,

    PRIMARY KEY (`aiId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
