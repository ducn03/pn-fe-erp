/**
 * Centralized API Endpoints for Premier Nuts ERP
 * Supports pn-api-gateway (port 8080) and direct pn-identity dev mode (port 8081)
 */

export const DEFAULT_GATEWAY_URL = 'http://localhost:9000';
export const DEFAULT_IDENTITY_URL = 'http://localhost:9001';

function resolveGatewayUrl(): string {
  if (typeof window !== 'undefined' && (window as any).__PN_GATEWAY_URL__) {
    return (window as any).__PN_GATEWAY_URL__;
  }
  return DEFAULT_GATEWAY_URL;
}

function resolveIdentityUrl(): string {
  if (typeof window !== 'undefined' && (window as any).__PN_IDENTITY_URL__) {
    return (window as any).__PN_IDENTITY_URL__;
  }
  return DEFAULT_IDENTITY_URL;
}

function resolveApiBaseUrl(): string {
  if (typeof window !== 'undefined' && (window as any).__PN_API_URL__) {
    return (window as any).__PN_API_URL__;
  }
  return resolveGatewayUrl();
}

export const GATEWAY_URL = resolveGatewayUrl();
export const IDENTITY_DIRECT_URL = resolveIdentityUrl();
export const API_BASE_URL = resolveApiBaseUrl();

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
