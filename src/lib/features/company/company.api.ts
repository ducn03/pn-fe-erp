import { apiClient, type ApiEnvelope } from '$core/api';
import type { Company, UpdateCompanyInput, Department, Role, Permission } from './company.types';

export async function getCompany(): Promise<Company> {
  const res = await apiClient.get<ApiEnvelope<Company> | Company>('/api/v1/company');
  return (res as any)?.data || res;
}

export async function updateCompany(input: UpdateCompanyInput): Promise<Company> {
  const res = await apiClient.put<ApiEnvelope<Company> | Company>('/api/v1/company', input);
  return (res as any)?.data || res;
}

export async function getDepartments(): Promise<Department[]> {
  const res = await apiClient.get<ApiEnvelope<Department[]> | Department[]>('/api/v1/departments');
  return (res as any)?.data || res || [];
}

export async function getRoles(): Promise<Role[]> {
  const res = await apiClient.get<ApiEnvelope<Role[]> | Role[]>('/api/v1/roles');
  return (res as any)?.data || res || [];
}

export async function updateRolePermissions(roleId: number, permissionIds: number[]): Promise<Role> {
  const res = await apiClient.put<ApiEnvelope<Role> | Role>(`/api/v1/roles/${roleId}/permissions`, {
    permissionIds
  });
  return (res as any)?.data || res;
}

export async function getPermissions(): Promise<Permission[]> {
  const res = await apiClient.get<ApiEnvelope<Permission[]> | Permission[]>('/api/v1/permissions');
  return (res as any)?.data || res || [];
}
