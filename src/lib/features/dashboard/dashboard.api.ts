import type { StatMetric, ServiceHealth } from './dashboard.types';

export async function getDashboardStats(): Promise<StatMetric[]> {
  return [
    {
      id: 'stat-inventory',
      title: 'Tổng tồn kho hạt',
      value: '3,200 kg',
      change: '+14% so với tháng trước',
      trend: 'up'
    },
    {
      id: 'stat-revenue',
      title: 'Doanh thu hôm nay',
      value: '48.5 tr',
      change: '+8.2% tuần này',
      trend: 'up'
    },
    {
      id: 'stat-orders',
      title: 'Đơn đang xử lý',
      value: '24 đơn',
      change: '3 đơn cần duyệt gấp',
      trend: 'down'
    },
    {
      id: 'stat-qc',
      title: 'Tỷ lệ kiểm định đạt',
      value: '99.4%',
      change: 'Đạt chuẩn xuất khẩu ISO',
      trend: 'up'
    }
  ];
}

export async function getServicesHealth(): Promise<ServiceHealth[]> {
  return [
    {
      name: 'Spring Cloud API Gateway',
      serviceId: 'pn-api-gateway',
      port: 9000,
      status: 'UP',
      uptime: '99.98%'
    },
    {
      name: 'Identity & Authentication Service',
      serviceId: 'pn-identity',
      port: 9001,
      status: 'UP',
      uptime: '99.95%'
    },
    {
      name: 'Premier Nuts Svelte ERP Frontend',
      serviceId: 'pn-fe-erp',
      port: 5173,
      status: 'UP',
      uptime: '100%'
    }
  ];
}
