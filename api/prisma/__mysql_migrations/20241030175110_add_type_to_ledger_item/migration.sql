-- AlterTable
ALTER TABLE `LedgerItem` ADD COLUMN `type` ENUM('INITIAL', 'JOB', 'AUTOMATED_TOPUP', 'AUTOMATED_DEPOSIT', 'MANUAL_TOPUP', 'MANUAL_DEPOSIT', 'FUNDS_PURCHASED', 'REFUND') NOT NULL DEFAULT 'JOB';
