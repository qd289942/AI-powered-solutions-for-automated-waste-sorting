-- CreateTable
CREATE TABLE `User` (
    `userId` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `salt` VARCHAR(191) NOT NULL,
    `algorithm` ENUM('ARGON2', 'BCRYPT', 'SCRYPT') NOT NULL,
    `role` ENUM('ADMIN', 'USER') NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
