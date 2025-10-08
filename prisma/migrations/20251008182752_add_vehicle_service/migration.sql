-- CreateTable
CREATE TABLE `VehicleService` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL DEFAULT 0,
    `description` VARCHAR(191) NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `VehicleService_deletedAt_idx`(`deletedAt`),
    INDEX `VehicleService_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
