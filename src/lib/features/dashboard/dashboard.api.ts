import type { StatMetric } from './dashboard.types';
import { getUsers } from '$features/identity';
import { getDepartments, getRoles, getCompany } from '$features/company';

export async function getDashboardStats(): Promise<StatMetric[]> {
  try {
    const [users, departments, roles, company] = await Promise.all([
      getUsers(),
      getDepartments(),
      getRoles(),
      getCompany()
    ]);

    const activeUsersCount = users.filter((u) => u.status === 'ACTIVE').length;

    return [
      {
        id: 'stat-users',
        title: 'Nhân sự hệ thống',
        value: `${users.length} tài khoản`,
        change: `${activeUsersCount} tài khoản đang hoạt động`,
        trend: 'up'
      },
      {
        id: 'stat-departments',
        title: 'Phòng ban trực thuộc',
        value: `${departments.length} phòng ban`,
        change: 'Cơ cấu phòng ban chuẩn',
        trend: 'neutral'
      },
      {
        id: 'stat-roles',
        title: 'Vai trò phân quyền',
        value: `${roles.length} vai trò`,
        change: 'Phân quyền RBAC chuẩn',
        trend: 'neutral'
      },
      {
        id: 'stat-company',
        title: 'Pháp nhân doanh nghiệp',
        value: company?.code || 'PREMIER_NUTS',
        change: `MST: ${company?.taxCode || '—'}`,
        trend: 'up'
      }
    ];
  } catch (error) {
    console.warn('[DashboardApi] Could not fetch live dashboard stats:', error);
    return [
      {
        id: 'stat-users',
        title: 'Nhân sự hệ thống',
        value: 'Chưa có dữ liệu',
        change: 'Kết nối qua Gateway :9000',
        trend: 'neutral'
      },
      {
        id: 'stat-departments',
        title: 'Phòng ban trực thuộc',
        value: 'Chưa có dữ liệu',
        change: 'Kết nối qua Gateway :9000',
        trend: 'neutral'
      },
      {
        id: 'stat-roles',
        title: 'Vai trò phân quyền',
        value: 'Chưa có dữ liệu',
        change: 'Kết nối qua Gateway :9000',
        trend: 'neutral'
      },
      {
        id: 'stat-company',
        title: 'Pháp nhân doanh nghiệp',
        value: 'PREMIER_NUTS',
        change: 'Kết nối qua Gateway :9000',
        trend: 'neutral'
      }
    ];
  }
}
