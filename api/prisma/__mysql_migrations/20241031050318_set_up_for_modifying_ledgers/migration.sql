-- AlterTable
ALTER TABLE `LedgerItem` MODIFY `type` ENUM('INITIAL', 'JOB', 'AUTOMATED_TOPUP', 'AUTOMATED_DEPOSIT', 'MANUAL_TOPUP', 'MANUAL_DEPOSIT', 'MANUAL_REDUCTION', 'FUNDS_PURCHASED', 'REFUND') NOT NULL;

-- AlterTable
ALTER TABLE `logs` MODIFY `type` ENUM('USER_LOGIN', 'USER_CREATED', 'SHOP_CREATED', 'USER_CONNECTED_TO_SHOP', 'USER_DISCONNECTED_FROM_SHOP', 'USER_SHOP_ROLE_CHANGED', 'USER_PROMOTED_TO_ADMIN', 'USER_DEMOTED_FROM_ADMIN', 'USER_SUSPENSION_APPLIED', 'USER_SUSPENSION_REMOVED', 'USER_SUSPENSION_CHANGED', 'JOB_CREATED', 'JOB_MODIFIED', 'JOB_DELETED', 'JOB_STATUS_CHANGED', 'JOB_ITEM_CREATED', 'JOB_ITEM_DELETED', 'JOB_ITEM_MODIFIED', 'JOB_ITEM_STATUS_CHANGED', 'JOB_FINALIZED', 'JOB_INVOICE_GENERATED', 'RESOURCE_CREATED', 'RESOURCE_MODIFIED', 'RESOURCE_DELETED', 'RESOURCE_IMAGE_CREATED', 'RESOURCE_IMAGE_MODIFIED', 'RESOURCE_IMAGE_DELETED', 'RESOURCE_TYPE_CREATED', 'RESOURCE_TYPE_MODIFIED', 'RESOURCE_TYPE_DELETED', 'MATERIAL_CREATED', 'MATERIAL_MODIFIED', 'MATERIAL_DELETED', 'MATERIAL_MSDS_UPLOADED', 'MATERIAL_TDS_UPLOADED', 'MATERIAL_IMAGE_CREATED', 'MATERIAL_IMAGE_MODIFIED', 'MATERIAL_IMAGE_DELETED', 'COMMENT_CREATED', 'LEDGER_ITEM_CREATED', 'LEDGER_ITEM_CREATED_MANUALLY') NOT NULL;