/**
 * Global Authentication & Authorization Store powered by Svelte 5 Runes
 */
import { STORAGE_KEYS } from '../constants/storage.constants';

export interface AuthUser {
  id: number | string;
  username: string;
  fullName: string;
  email: string;
  roles: string[];
  permissions?: string[];
  companyId?: number;
}

// Role to default permissions mapping
const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ['*'],
  ROLE_ADMIN: ['*'],
  ROLE_KHO: ['INVENTORY_VIEW', 'INVENTORY_IMPORT', 'INVENTORY_EXPORT', 'COMPANY_VIEW'],
  ROLE_KE_TOAN: ['FINANCE_VIEW', 'COMPANY_VIEW', 'USER_VIEW'],
  ROLE_SAN_XUAT: ['MANUFACTURING_VIEW', 'MANUFACTURING_EXECUTE', 'INVENTORY_VIEW', 'COMPANY_VIEW'],
  ROLE_QC: ['QC_VIEW', 'QC_INSPECT', 'INVENTORY_VIEW', 'COMPANY_VIEW']
};

class AuthStore {
  user = $state<AuthUser | null>(null);
  token = $state<string | null>(null);
  isAuthenticated = $derived(!!this.token);

  // Quyền Quản trị viên tối cao
  isAdmin = $derived(
    !!this.user?.roles?.some(
      (r) => r === 'ROLE_ADMIN' || r === 'SUPER_ADMIN'
    )
  );

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

  /**
   * Kiểm tra quyền hạn chi tiết (Permission)
   */
  hasPermission(permission: string): boolean {
    if (!this.user) return false;
    if (this.isAdmin) return true;

    // 1. Kiểm tra trực tiếp từ danh sách permissions của User
    if (this.user.permissions && this.user.permissions.length > 0) {
      if (this.user.permissions.includes('*') || this.user.permissions.includes(permission)) {
        return true;
      }
    }

    // 2. Tương thích ngược: kiểm tra từ template role
    if (this.user.roles && this.user.roles.length > 0) {
      for (const r of this.user.roles) {
        const perms = ROLE_PERMISSIONS[r] || [];
        if (perms.includes('*') || perms.includes(permission)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Kiểm tra quyền gán vai trò: CHỈ ADMIN MỚI ĐƯỢC GÁN VAI TRÒ ADMIN
   */
  canAssignRole(targetRoleCode: string): boolean {
    if (targetRoleCode === 'ROLE_ADMIN' || targetRoleCode === 'SUPER_ADMIN') {
      return this.isAdmin;
    }
    return this.hasPermission('ROLE_ASSIGN') || this.isAdmin;
  }
}

export const authStore = new AuthStore();
export default authStore;
