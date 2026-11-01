import { CommonStatus } from '$core/constants';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LOCKED = 'LOCKED'
}

export enum UserRoleCode {
  ROLE_ADMIN = 'ROLE_ADMIN',
  ROLE_DIRECTOR = 'ROLE_DIRECTOR',
  ROLE_BRANCH_MANAGER = 'ROLE_BRANCH_MANAGER',
  ROLE_KHO = 'ROLE_KHO',
  ROLE_KE_TOAN = 'ROLE_KE_TOAN',
  ROLE_SAN_XUAT = 'ROLE_SAN_XUAT',
  ROLE_QC = 'ROLE_QC'
}

export type UserRole = UserRoleCode | string;

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
  status: UserStatus | string;
  roleId?: number;
  roleCode?: string;
  roleName?: string;
  roles?: string[];
  role?: string; // Primary role compatibility
  roleIds?: number[];
  permissionIds?: number[];
  permissions?: string[];
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
  roleId?: number;
  role?: string;
  roleIds?: number[];
  permissionIds?: number[];
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
