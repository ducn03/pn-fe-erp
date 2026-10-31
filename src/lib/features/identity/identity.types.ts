export type UserRole = 'ROLE_ADMIN' | 'ROLE_KHO' | 'ROLE_KE_TOAN' | 'ROLE_SAN_XUAT' | string;
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'LOCKED' | string;

export interface User {
  id: number | string;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  departmentId?: number;
  departmentName?: string;
  department?: string; // Compatibility alias
  companyId?: number;
  status: UserStatus;
  roles?: string[];
  role?: string; // Primary role compatibility
  roleIds?: number[];
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserInput {
  username: string;
  password?: string;
  fullName: string;
  email?: string;
  phone?: string;
  role?: string;
  roleIds?: number[];
  departmentId?: number;
  department?: string;
  companyId?: number;
}

export interface UserListParams {
  keyword?: string;
  status?: string;
  companyId?: number;
  departmentId?: number;
  page?: number;
  size?: number;
}
