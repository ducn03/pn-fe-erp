export type UserRole = 'ROLE_ADMIN' | 'ROLE_KHO' | 'ROLE_KE_TOAN' | 'ROLE_SAN_XUAT';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  department: string;
  status: UserStatus;
  createdAt: string;
}

export interface CreateUserInput {
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  department: string;
}
