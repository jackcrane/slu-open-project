-- AlterTable
ALTER TABLE `JobItem` ADD COLUMN `resourceType` ENUM('OTHER', 'INSTRUMENT', 'TOOL', 'PRINTER', 'PRINTER_3D', 'LASER_CUTTER', 'CNC') NULL;
