import { CommonStatus } from '$core/constants';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LOCKED = 'LOCKED'
}

export enum UserRoleCode {
  ROLE_ADMIN = 'ROLE_ADMIN',
  ROLE_DIRECTOR = 'ROLE_DIRECTOR',
  ROLE_ACCOUNTANT = 'ROLE_ACCOUNTANT',
  ROLE_WAREHOUSE = 'ROLE_WAREHOUSE',
  ROLE_QA_QC = 'ROLE_QA_QC',
  ROLE_PRODUCTION = 'ROLE_PRODUCTION'
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
