/*
  Warnings:

  - You are about to drop the `bill` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rol` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_rolId_fkey`;

-- DropIndex
DROP INDEX `users_rolId_fkey` ON `users`;

-- DropTable
DROP TABLE `bill`;

-- DropTable
DROP TABLE `rol`;

-- CreateTable
CREATE TABLE `bills` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pdf_name` VARCHAR(191) NOT NULL,
    `xml_name` VARCHAR(191) NOT NULL,
    `pdf_url` VARCHAR(191) NOT NULL,
    `xml_url` VARCHAR(191) NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `bills_id_key`(`id`),
    UNIQUE INDEX `bills_pdf_name_key`(`pdf_name`),
    UNIQUE INDEX `bills_xml_name_key`(`xml_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rols` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Rols_id_key`(`id`),
    UNIQUE INDEX `Rols_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_rolId_fkey` FOREIGN KEY (`rolId`) REFERENCES `Rols`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
