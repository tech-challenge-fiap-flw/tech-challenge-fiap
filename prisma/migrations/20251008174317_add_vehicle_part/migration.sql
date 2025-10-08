-- CreateTable
CREATE TABLE `VehiclePart` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,
    `deletedAt` DATETIME(3) NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `VehiclePart_name_idx`(`name`),
    INDEX `VehiclePart_deletedAt_idx`(`deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
