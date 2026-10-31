/**
 * Enterprise Fetch Client for Premier Nuts ERP
 * Communicates with pn-api-gateway or direct microservices
 */

import { API_BASE_URL } from './endpoints';
import { STORAGE_KEYS } from '../constants/storage.constants';

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  token?: string;
  baseUrl?: string;
}

export interface ApiEnvelope<T = any> {
  code: string;
  message?: string;
  data: T;
  meta?: {
    pageIndex?: number;
    pageSize?: number;
    totalPages?: number;
    totalElements?: number;
    [key: string]: any;
  };
}

export class ApiError extends Error {
  status: number;
  code?: string;
  data?: any;

  constructor(message: string, status: number, code?: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  private getAuthToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    }
    return null;
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined | null>, baseUrlOverride?: string): string {
    const base = baseUrlOverride || this.baseUrl;
    const url = new URL(path.startsWith('http') ? path : `${base}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          url.searchParams.append(key, String(val));
        }
      });
    }
    return url.toString();
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { params, token, baseUrl, headers = {}, ...rest } = options;
    const url = this.buildUrl(path, params, baseUrl);

    const authToken = token || this.getAuthToken();
    const finalHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers
    };

    try {
      const response = await fetch(url, {
        ...rest,
        headers: finalHeaders
      });

      if (!response.ok) {
        let errorData: any = null;
        try {
          errorData = await response.json();
        } catch {
          errorData = await response.text();
        }

        const msg = (errorData && (errorData.message || errorData.error)) || `Yêu cầu thất bại (HTTP ${response.status})`;
        const code = errorData && errorData.code;

        throw new ApiError(msg, response.status, code, errorData);
      }

      if (response.status === 204) {
        return null as unknown as T;
      }

      const json = await response.json();
      return json as T;
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError(
        err.message || 'Lỗi mạng hoặc không thể kết nối tới dịch vụ backend',
        0,
        'NETWORK_ERROR',
        err
      );
    }
  }

  get<T>(path: string, params?: Record<string, string | number | boolean | undefined | null>, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET', params });
  }

  post<T>(path: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  put<T>(path: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  patch<T>(path: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
