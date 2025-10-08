-- CreateTable
CREATE TABLE `Vehicle` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `idPlate` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `brand` VARCHAR(191) NOT NULL,
    `manufactureYear` INTEGER NOT NULL,
    `modelYear` INTEGER NOT NULL,
    `color` VARCHAR(191) NOT NULL,
    `ownerId` INTEGER NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `Vehicle_ownerId_idx`(`ownerId`),
    INDEX `Vehicle_deletedAt_idx`(`deletedAt`),
    UNIQUE INDEX `Vehicle_idPlate_key`(`idPlate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Vehicle` ADD CONSTRAINT `Vehicle_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
