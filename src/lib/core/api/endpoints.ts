/**
 * Centralized API Endpoints for Premier Nuts ERP
 * Supports pn-api-gateway (port 8080) and direct pn-identity dev mode (port 8081)
 */

export const GATEWAY_URL = typeof window !== 'undefined'
  ? (window as any).__PN_GATEWAY_URL__ || 'http://localhost:9000'
  : 'http://localhost:9000';

export const IDENTITY_DIRECT_URL = typeof window !== 'undefined'
  ? (window as any).__PN_IDENTITY_URL__ || 'http://localhost:9001'
  : 'http://localhost:9001';

// Default active API Base (Calling via Gateway :9000)
export const API_BASE_URL = typeof window !== 'undefined'
  ? (window as any).__PN_API_URL__ || GATEWAY_URL
  : GATEWAY_URL;

export const ENDPOINTS = {
  // Gateway & System Health
  GATEWAY: {
    HEALTH: '/actuator/health',
    INFO: '/actuator/info'
  },
  // pn-identity Service (Direct /api/v1/** or Gateway /api/v1/identity/**)
  IDENTITY: {
    LOGIN: '/api/v1/auth/login',
    REFRESH: '/api/v1/auth/refresh',
    ME: '/api/v1/auth/me',
    USERS: '/api/v1/users',
    CHECK_USERNAME: '/api/v1/users/check-username',
    CHECK_EMAIL: '/api/v1/users/check-email',
    COMPANIES: '/api/v1/companies'
  },
  // pn-inventory Service
  INVENTORY: {
    BATCHES: '/api/v1/inventory/batches',
    CATEGORIES: '/api/v1/inventory/categories',
    WAREHOUSES: '/api/v1/inventory/warehouses',
    STOCK_REPORT: '/api/v1/inventory/reports/stock'
  }
} as const;
