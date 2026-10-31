/**
 * Premier Nuts ERP - Common Enums & Constants
 * Bộ định nghĩa Enum và hằng số dùng chung trên toàn bộ hệ thống Frontend
 */

export enum CommonStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LOCKED = 'LOCKED'
}

export enum HealthStatus {
  UP = 'UP',
  DOWN = 'DOWN'
}



export enum ToastType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error'
}

export enum SystemRoleCode {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ROLE_ADMIN = 'ROLE_ADMIN',
  ROLE_DIRECTOR = 'ROLE_DIRECTOR',
  ROLE_ACCOUNTANT = 'ROLE_ACCOUNTANT',
  ROLE_WAREHOUSE = 'ROLE_WAREHOUSE',
  ROLE_QA_QC = 'ROLE_QA_QC',
  ROLE_PRODUCTION = 'ROLE_PRODUCTION'
}

export enum InventoryStockStatus {
  IN_STOCK = 'IN_STOCK',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK'
}

export const UI_CONSTANTS = {
  EMPTY_PLACEHOLDER: '—',
  DEFAULT_PAGE_SIZE: 20
} as const;
