-- CreateTable
CREATE TABLE `bill` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pdf_name` VARCHAR(191) NOT NULL,
    `xml_name` VARCHAR(191) NOT NULL,
    `pdf_url` VARCHAR(191) NOT NULL,
    `xml_url` VARCHAR(191) NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `bill_id_key`(`id`),
    UNIQUE INDEX `bill_pdf_name_key`(`pdf_name`),
    UNIQUE INDEX `bill_xml_name_key`(`xml_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
