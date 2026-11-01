/**
 * Global Authentication & Authorization Store powered by Svelte 5 Runes
 *
 * Single Source of Truth: Quyền hạn (Permissions) và Vai trò (Roles) được giải mã
 * trực tiếp từ JWT Access Token & Backend Session, tuyệt đối không hardcode.
 */
import { STORAGE_KEYS } from '../constants/storage.constants';
import { API_BASE_URL, ENDPOINTS } from '../api/endpoints';

export interface AuthUser {
  id: number | string;
  username: string;
  fullName: string;
  email: string;
  roles: string[];
  permissions: string[];
  companyId?: number;
}

interface JwtPayload {
  sub?: string;
  userId?: number | string;
  companyId?: number;
  roles?: string[];
  permissions?: string[];
  type?: string;
  exp?: number;
}

/**
 * Giải mã an toàn claims từ JWT token (hỗ trợ UTF-8)
 */
function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

class AuthStore {
  user = $state<AuthUser | null>(null);
  token = $state<string | null>(null);
  isAuthenticated = $derived(!!this.token);

  // Quyền Quản trị viên tối cao (Super Admin / Admin)
  isAdmin = $derived(
    !!this.user?.roles?.some(
      (r) => r === 'ROLE_ADMIN' || r === 'SUPER_ADMIN'
    )
  );

  // Cấp bậc Ban Giám Đốc (Director)
  isDirector = $derived(
    !!this.user?.roles?.some(
      (r) => r === 'ROLE_DIRECTOR'
    )
  );

  // Cấp bậc Lãnh đạo cấp cao (Admin hoặc Giám Đốc)
  isAdminOrDirector = $derived(this.isAdmin || this.isDirector);

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
        const jwtPayload = parseJwtPayload(savedToken);
        let parsedUser: Partial<AuthUser> = {};
        if (savedUserStr) {
          try {
            parsedUser = JSON.parse(savedUserStr);
          } catch {
            parsedUser = {};
          }
        }

        // Ưu tiên trích xuất roles và permissions trực tiếp từ JWT Token
        const roles = jwtPayload?.roles || parsedUser.roles || [];
        const permissions = jwtPayload?.permissions || parsedUser.permissions || [];
        const username = jwtPayload?.sub || parsedUser.username || '';
        const userId = jwtPayload?.userId || parsedUser.id || 0;
        const companyId = jwtPayload?.companyId || parsedUser.companyId;

        this.user = {
          id: userId,
          username: username,
          fullName: parsedUser.fullName || username,
          email: parsedUser.email || `${username}@premiernuts.vn`,
          roles: roles,
          permissions: permissions,
          companyId: companyId
        };
      }
    } catch {
      // Storage access error or corrupt JSON
    }
  }

  setSession(token: string, user: AuthUser, refreshToken?: string) {
    this.token = token;

    // Đồng bộ roles và permissions trực tiếp từ JWT payload
    const jwtPayload = parseJwtPayload(token);
    if (jwtPayload) {
      if (jwtPayload.roles && jwtPayload.roles.length > 0) {
        user.roles = jwtPayload.roles;
      }
      if (jwtPayload.permissions && jwtPayload.permissions.length > 0) {
        user.permissions = jwtPayload.permissions;
      }
    }

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

  /**
   * Cập nhật phiên làm việc bằng Refresh Token:
   * Xóa Access Token cũ, dùng Refresh Token gửi lên Backend để nhận Access Token mới
   * mang toàn bộ quyền hạn và thông tin mới nhất từ Database.
   */
  async refreshSession(): Promise<boolean> {
    if (typeof localStorage === 'undefined') {
      return false;
    }
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) {
      return false;
    }

    try {
      // 1. Xóa access token cũ
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);

      // 2. Gửi request cấp lại access token mới
      const res = await fetch(`${API_BASE_URL}${ENDPOINTS.IDENTITY.REFRESH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });

      if (!res.ok) {
        this.logout();
        return false;
      }

      const envelope = await res.json();
      const resData = envelope.data;
      if (resData && resData.accessToken) {
        const u = resData.user;
        const sessionUser: AuthUser = {
          id: u.userId,
          username: u.username,
          fullName: this.user?.fullName || u.username,
          email: this.user?.email || `${u.username}@premiernuts.vn`,
          roles: u.roles || [],
          permissions: u.permissions || [],
          companyId: u.companyId
        };
        this.setSession(resData.accessToken, sessionUser, resData.refreshToken || refreshToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  hasRole(role: string): boolean {
    if (!this.user || !this.user.roles) {
      return false;
    }
    return this.user.roles.includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    if (!this.user || !this.user.roles) {
      return false;
    }
    return roles.some((r) => this.user!.roles.includes(r));
  }

  /**
   * Kiểm tra quyền hạn chi tiết (Permission)
   * 1. Admin luôn có toàn quyền hệ thống (return true).
   * 2. Quyền được so khớp trực tiếp từ permissions giải mã từ JWT token / Backend session.
   * Tuyệt đối không fallback vào bất kỳ mảng hardcode nào.
   */
  hasPermission(permission: string): boolean {
    if (!this.user) {
      return false;
    }
    if (this.isAdmin) {
      return true;
    }

    if (this.user.permissions && this.user.permissions.length > 0) {
      if (this.user.permissions.includes('*') || this.user.permissions.includes(permission)) {
        return true;
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
