/**
 * Centralized API Endpoints for Premier Nuts ERP
 * Routes all requests through pn-api-gateway (Default: http://localhost:8080)
 */

export const API_BASE_URL = typeof window !== 'undefined'
  ? (window as any).__PN_API_URL__ || 'http://localhost:8080'
  : 'http://localhost:8080';

export const ENDPOINTS = {
  // Gateway & System Health
  GATEWAY: {
    HEALTH: '/actuator/health',
    INFO: '/actuator/info'
  },
  // pn-identity Service (via Gateway /api/v1/identity/**)
  IDENTITY: {
    LOGIN: '/api/v1/identity/auth/login',
    REFRESH: '/api/v1/identity/auth/refresh',
    ME: '/api/v1/identity/auth/me',
    USERS: '/api/v1/identity/users',
    ROLES: '/api/v1/identity/roles'
  },
  // pn-inventory Service (via Gateway /api/v1/inventory/**)
  INVENTORY: {
    BATCHES: '/api/v1/inventory/batches',
    CATEGORIES: '/api/v1/inventory/categories',
    WAREHOUSES: '/api/v1/inventory/warehouses',
    STOCK_REPORT: '/api/v1/inventory/reports/stock'
  }
} as const;
