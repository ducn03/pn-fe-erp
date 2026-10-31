import { apiClient, type ApiEnvelope } from '$core/api';
import type { Company, Department, Role } from './company.types';

export async function getCompany(): Promise<Company> {
  const res = await apiClient.get<ApiEnvelope<Company> | Company>('/api/v1/company');
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
