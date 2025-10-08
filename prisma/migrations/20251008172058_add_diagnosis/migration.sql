-- CreateTable
CREATE TABLE `Diagnosis` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(191) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `vehicleId` INTEGER NOT NULL,
    `responsibleMechanicId` INTEGER NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `Diagnosis_vehicleId_idx`(`vehicleId`),
    INDEX `Diagnosis_responsibleMechanicId_idx`(`responsibleMechanicId`),
    INDEX `Diagnosis_deletedAt_idx`(`deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Diagnosis` ADD CONSTRAINT `Diagnosis_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `Vehicle`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Diagnosis` ADD CONSTRAINT `Diagnosis_responsibleMechanicId_fkey` FOREIGN KEY (`responsibleMechanicId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
