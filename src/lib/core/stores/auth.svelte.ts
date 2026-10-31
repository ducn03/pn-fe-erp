/**
 * Global Authentication Store powered by Svelte 5 Runes
 */
import { STORAGE_KEYS } from '../constants/storage.constants';

export interface AuthUser {
  id: number | string;
  username: string;
  fullName: string;
  email: string;
  roles: string[];
  companyId?: number;
}

class AuthStore {
  user = $state<AuthUser | null>(null);
  token = $state<string | null>(null);
  isAuthenticated = $derived(!!this.token);

  constructor() {
    if (typeof localStorage !== 'undefined') {
      this.initFromStorage();
    }
  }

  private initFromStorage() {
    try {
      const savedToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const savedUserStr = localStorage.getItem(STORAGE_KEYS.USER_INFO);

      if (savedToken) {
        this.token = savedToken;
      }
      if (savedUserStr) {
        this.user = JSON.parse(savedUserStr);
      }
    } catch {
      // Storage access error or corrupt JSON
    }
  }

  setSession(token: string, user: AuthUser, refreshToken?: string) {
    this.token = token;
    this.user = user;

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(user));
      if (refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }
    }
  }

  logout() {
    this.token = null;
    this.user = null;

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    }
  }

  hasRole(role: string): boolean {
    if (!this.user || !this.user.roles) return false;
    return this.user.roles.includes(role);
  }
}

export const authStore = new AuthStore();
export default authStore;
