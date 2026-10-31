import { apiClient, type ApiEnvelope } from '$core/api';
import { ENDPOINTS } from '$core/api';
import type { User, CreateUserInput, UserListParams } from './identity.types';

// Fallback mock users for offline development
const mockUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    fullName: 'Nguyễn Văn Quản Trị',
    email: 'admin@premiernuts.vn',
    roles: ['SUPER_ADMIN', 'ROLE_ADMIN'],
    role: 'ROLE_ADMIN',
    department: 'Ban Giám Đốc',
    status: 'ACTIVE',
    createdAt: '2026-01-01T08:00:00Z'
  },
  {
    id: 2,
    username: 'kho_truong',
    fullName: 'Trần Văn Kho',
    email: 'kho@premiernuts.vn',
    roles: ['ROLE_KHO'],
    role: 'ROLE_KHO',
    department: 'Kho Vận & Logistics',
    status: 'ACTIVE',
    createdAt: '2026-02-15T09:30:00Z'
  },
  {
    id: 3,
    username: 'ketoan_truong',
    fullName: 'Lê Thị Thu',
    email: 'ketoan@premiernuts.vn',
    roles: ['ROLE_KE_TOAN'],
    role: 'ROLE_KE_TOAN',
    department: 'Tài Chính Kế Toán',
    status: 'ACTIVE',
    createdAt: '2026-03-20T10:15:00Z'
  },
  {
    id: 4,
    username: 'sanxuat_lead',
    fullName: 'Phạm Minh Sản Xuất',
    email: 'sanxuat@premiernuts.vn',
    roles: ['ROLE_SAN_XUAT'],
    role: 'ROLE_SAN_XUAT',
    department: 'Nhà Máy Chế Biến',
    status: 'ACTIVE',
    createdAt: '2026-04-10T14:00:00Z'
  }
];

export async function getUsers(params?: UserListParams): Promise<User[]> {
  try {
    const res = await apiClient.get<ApiEnvelope<any> | any>(ENDPOINTS.IDENTITY.USERS, {
      keyword: params?.keyword,
      status: params?.status,
      page: params?.page ?? 0,
      size: params?.size ?? 50
    });

    // Check if envelope with page data
    let items: any[] = [];
    if (res && res.data && Array.isArray(res.data.content)) {
      items = res.data.content;
    } else if (res && Array.isArray(res.data)) {
      items = res.data;
    } else if (Array.isArray(res)) {
      items = res;
    }

    if (items.length > 0) {
      return items.map((u: any) => ({
        id: u.id,
        username: u.username,
        fullName: u.fullName || u.username,
        email: u.email || `${u.username}@premiernuts.vn`,
        phone: u.phone,
        status: u.status || 'ACTIVE',
        department: u.departmentName || u.department || 'Ban Nghiệp Vụ',
        roles: u.roles || [],
        role: (u.roles && u.roles[0]) || 'ROLE_ADMIN',
        createdAt: u.createdAt || new Date().toISOString()
      }));
    }

    return [...mockUsers];
  } catch (error) {
    console.warn('[IdentityApi] Backend pn-identity unavailable, using local mock data:', error);
    return [...mockUsers];
  }
}

export async function createUser(input: CreateUserInput): Promise<User> {
  try {
    const payload = {
      username: input.username,
      password: input.password || 'Premier@123',
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      companyId: input.companyId || 1,
      departmentId: input.departmentId || 1,
      roleIds: input.roleIds || [1]
    };

    const res = await apiClient.post<ApiEnvelope<any> | any>(ENDPOINTS.IDENTITY.USERS, payload);
    const created = (res && res.data) || res;

    return {
      id: created.id || Date.now(),
      username: created.username || input.username,
      fullName: created.fullName || input.fullName,
      email: created.email || input.email || `${input.username}@premiernuts.vn`,
      phone: created.phone,
      status: created.status || 'ACTIVE',
      department: input.department || 'Ban Nghiệp Vụ',
      roles: created.roles || [input.role || 'ROLE_KHO'],
      role: input.role || 'ROLE_KHO',
      createdAt: created.createdAt || new Date().toISOString()
    };
  } catch (error) {
    console.warn('[IdentityApi] Backend create user failed, creating local session user:', error);
    const fallbackUser: User = {
      id: Date.now(),
      username: input.username,
      fullName: input.fullName,
      email: input.email || `${input.username}@premiernuts.vn`,
      status: 'ACTIVE',
      department: input.department || 'Ban Nghiệp Vụ',
      roles: [input.role || 'ROLE_KHO'],
      role: input.role || 'ROLE_KHO',
      createdAt: new Date().toISOString()
    };
    mockUsers.unshift(fallbackUser);
    return fallbackUser;
  }
}
