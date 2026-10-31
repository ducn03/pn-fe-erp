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
    let base = this.baseUrl;
    if (baseUrlOverride) {
      base = baseUrlOverride;
    }
    let target = `${base}${path}`;
    if (path.startsWith('http')) {
      target = path;
    }
    const url = new URL(target);
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          url.searchParams.append(key, String(val));
        }
      });
    }
    return url.toString();
  }

  private serializeBody(body: any): string | undefined {
    if (body !== undefined && body !== null) {
      return JSON.stringify(body);
    }
    return undefined;
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { params, token, baseUrl, headers = {}, ...rest } = options;
    const url = this.buildUrl(path, params, baseUrl);

    let authToken = this.getAuthToken();
    if (token) {
      authToken = token;
    }

    const finalHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    };
    if (authToken) {
      finalHeaders['Authorization'] = `Bearer ${authToken}`;
    }
    if (headers) {
      Object.assign(finalHeaders, headers);
    }

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

        let msg = `Yêu cầu thất bại (HTTP ${response.status})`;
        if (errorData) {
          if (errorData.message) {
            msg = errorData.message;
          } else if (errorData.error) {
            msg = errorData.error;
          }
        }
        let code: string | undefined = undefined;
        if (errorData && errorData.code) {
          code = errorData.code;
        }

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
      let errMsg = 'Lỗi mạng hoặc không thể kết nối tới dịch vụ backend';
      if (err && err.message) {
        errMsg = err.message;
      }
      throw new ApiError(
        errMsg,
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
      body: this.serializeBody(body)
    });
  }

  put<T>(path: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: this.serializeBody(body)
    });
  }

  patch<T>(path: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PATCH',
      body: this.serializeBody(body)
    });
  }

  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
