import { apiClient, type ApiEnvelope } from '$core/api';
import { ENDPOINTS } from '$core/api';
import type { User, CreateUserInput, UserListParams } from './identity.types';

export async function getUsers(params?: UserListParams): Promise<User[]> {
  const queryParams: Record<string, string | number | boolean | undefined | null> = {
    page: params?.page ?? 0,
    size: params?.size ?? 50
  };

  if (params?.keyword) {
    queryParams.keyword = params.keyword;
  }
  if (params?.status) {
    queryParams.status = params.status;
  }
  if (params?.departmentId) {
    queryParams.departmentId = params.departmentId;
  }
  if (params?.companyId) {
    queryParams.companyId = params.companyId;
  }

  const res = await apiClient.get<ApiEnvelope<any> | any>(ENDPOINTS.IDENTITY.USERS, queryParams);

  let rawList: any[] = [];
  if (res && res.data && Array.isArray(res.data.content)) {
    rawList = res.data.content;
  } else if (res && Array.isArray(res.data)) {
    rawList = res.data;
  } else if (Array.isArray(res)) {
    rawList = res;
  }

  return rawList.map((u: any): User => {
    let primaryRole = 'Nhân Viên';
    if (u.roleName) {
      primaryRole = u.roleName;
    } else if (u.roleCode) {
      primaryRole = u.roleCode;
    } else if (u.roles && Array.isArray(u.roles) && u.roles.length > 0) {
      primaryRole = u.roles[0];
    } else if (u.role) {
      primaryRole = u.role;
    }

    let deptName = '';
    if (u.departmentName) {
      deptName = u.departmentName;
    } else if (u.department) {
      deptName = u.department;
    }

    return {
      id: u.id,
      username: u.username,
      fullName: u.fullName || u.username,
      email: u.email || '',
      phone: u.phone,
      avatarUrl: u.avatarUrl,
      departmentId: u.departmentId,
      departmentName: deptName,
      department: deptName,
      companyId: u.companyId,
      status: u.status,
      roleId: u.roleId,
      roleCode: u.roleCode,
      roleName: u.roleName,
      roles: u.roles || [],
      role: primaryRole,
      roleIds: u.roleIds || [],
      permissionIds: u.permissionIds || [],
      permissions: u.permissions || [],
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt
    };
  });
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const payload: Record<string, any> = {
    username: input.username,
    fullName: input.fullName,
    password: input.password
  };

  if (input.email) {
    payload.email = input.email;
  }
  if (input.phone) {
    payload.phone = input.phone;
  }
  if (input.departmentId) {
    payload.departmentId = input.departmentId;
  }
  if (input.roleId) {
    payload.roleId = input.roleId;
  }
  if (input.roleIds && input.roleIds.length > 0) {
    payload.roleIds = input.roleIds;
  }
  if (input.permissionIds && input.permissionIds.length > 0) {
    payload.permissionIds = input.permissionIds;
  }
  if (input.companyId) {
    payload.companyId = input.companyId;
  }

  const res = await apiClient.post<ApiEnvelope<any> | any>(ENDPOINTS.IDENTITY.USERS, payload);
  let created = res;
  if (res && res.data) {
    created = res.data;
  }

  let primaryRole = 'Nhân Viên';
  if (created.roleName) {
    primaryRole = created.roleName;
  } else if (created.roleCode) {
    primaryRole = created.roleCode;
  } else if (created.roles && Array.isArray(created.roles) && created.roles.length > 0) {
    primaryRole = created.roles[0];
  } else if (input.role) {
    primaryRole = input.role;
  }

  let deptName = '';
  if (created.departmentName) {
    deptName = created.departmentName;
  } else if (input.department) {
    deptName = input.department;
  }

  return {
    id: created.id,
    username: created.username,
    fullName: created.fullName,
    email: created.email || '',
    phone: created.phone,
    avatarUrl: created.avatarUrl,
    departmentId: created.departmentId,
    departmentName: deptName,
    department: deptName,
    companyId: created.companyId,
    status: created.status,
    roleId: created.roleId,
    roleCode: created.roleCode,
    roleName: created.roleName,
    roles: created.roles || [],
    role: primaryRole,
    roleIds: created.roleIds || [],
    permissionIds: created.permissionIds || [],
    permissions: created.permissions || [],
    createdAt: created.createdAt,
    updatedAt: created.updatedAt
  };
}

export async function generateUsername(fullName: string): Promise<string> {
  const res = await apiClient.get<ApiEnvelope<string> | string>('/api/v1/users/generate-username', {
    fullName
  });
  return (res as any)?.data || res || '';
}

export async function updateUser(id: number | string, input: any): Promise<User> {
  const res = await apiClient.put<ApiEnvelope<any> | any>(`/api/v1/users/${id}`, input);
  const updated = (res as any)?.data || res;
  return updated;
}

export async function getLoginLogs(params?: any): Promise<{ items: any[]; total: number }> {
  const queryParams: Record<string, any> = {
    page: params?.page ?? 1,
    size: params?.size ?? 20
  };
  if (params?.username) {
    queryParams.username = params.username;
  }
  if (params?.status) {
    queryParams.status = params.status;
  }
  if (params?.keyword) {
    queryParams.keyword = params.keyword;
  }

  const res = await apiClient.get<ApiEnvelope<any> | any>('/api/v1/logs/login', queryParams);
  let items: any[] = [];
  let total = 0;

  if (res && res.data) {
    if (Array.isArray(res.data.content)) {
      items = res.data.content;
      total = res.data.totalElements || items.length;
    } else if (Array.isArray(res.data)) {
      items = res.data;
      total = res.paging?.totalElements || items.length;
    }
  } else if (Array.isArray(res)) {
    items = res;
    total = items.length;
  }

  return { items, total };
}

