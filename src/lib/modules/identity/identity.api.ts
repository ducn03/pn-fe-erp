import type { User, CreateUserInput } from './identity.types';

let mockUsers: User[] = [
  {
    id: 'usr-1',
    username: 'admin',
    fullName: 'Nguyễn Văn Quản Trị',
    email: 'admin@premiernuts.vn',
    role: 'ROLE_ADMIN',
    department: 'Ban Giám Đốc',
    status: 'ACTIVE',
    createdAt: '01/01/2026'
  },
  {
    id: 'usr-2',
    username: 'kho_truong',
    fullName: 'Trần Văn Kho',
    email: 'kho@premiernuts.vn',
    role: 'ROLE_KHO',
    department: 'Kho Vận & Logistics',
    status: 'ACTIVE',
    createdAt: '15/02/2026'
  },
  {
    id: 'usr-3',
    username: 'ketoan_truong',
    fullName: 'Lê Thị Thu',
    email: 'ketoan@premiernuts.vn',
    role: 'ROLE_KE_TOAN',
    department: 'Tài Chính Kế Toán',
    status: 'ACTIVE',
    createdAt: '20/03/2026'
  },
  {
    id: 'usr-4',
    username: 'sanxuat_lead',
    fullName: 'Phạm Minh Sản Xuất',
    email: 'sanxuat@premiernuts.vn',
    role: 'ROLE_SAN_XUAT',
    department: 'Nhà Máy Chế Biến',
    status: 'ACTIVE',
    createdAt: '10/04/2026'
  }
];

export async function getUsers(): Promise<User[]> {
  // In production: return apiClient.get<User[]>(ENDPOINTS.IDENTITY.USERS);
  return [...mockUsers];
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const newUser: User = {
    id: `usr-${mockUsers.length + 1}`,
    username: input.username,
    fullName: input.fullName,
    email: input.email,
    role: input.role,
    department: input.department,
    status: 'ACTIVE',
    createdAt: new Date().toLocaleDateString('vi-VN')
  };

  mockUsers = [newUser, ...mockUsers];
  return newUser;
}
