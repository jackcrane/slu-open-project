-- AlterTable
ALTER TABLE `JobItem` ADD COLUMN `approved` BOOLEAN NULL,
    ADD COLUMN `userId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `JobItem` ADD CONSTRAINT `JobItem_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;