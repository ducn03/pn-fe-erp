import { API_BASE_URL } from '$core/api';
import type { ServiceHealthData } from './health.types';

export async function getGatewayHealth(): Promise<ServiceHealthData> {
  try {
    const res = await fetch(`${API_BASE_URL}/actuator/health`);
    const data = await res.json();
    const disk = data.components?.diskSpace?.details;
    const totalGb = disk ? Math.round(disk.total / (1024 * 1024 * 1024)) : 0;
    const freeGb = disk ? Math.round(disk.free / (1024 * 1024 * 1024)) : 0;
    const usagePercent = totalGb > 0 ? Math.round(((totalGb - freeGb) / totalGb) * 100) : 0;

    return {
      serviceId: 'pn-api-gateway',
      name: 'Spring Cloud API Gateway',
      port: 9000,
      status: data.status === 'UP' ? 'UP' : 'DOWN',
      diskSpace: {
        totalGb,
        freeGb,
        usagePercent
      },
      components: data.components
    };
  } catch (error) {
    return {
      serviceId: 'pn-api-gateway',
      name: 'Spring Cloud API Gateway',
      port: 9000,
      status: 'DOWN'
    };
  }
}

export async function getIdentityHealth(): Promise<ServiceHealthData> {
  try {
    // Call via Gateway /actuator/identity/health or direct fallback
    let res: Response;
    try {
      res = await fetch(`${API_BASE_URL}/actuator/identity/health`);
      if (!res.ok) throw new Error('Gateway route not ok');
    } catch {
      res = await fetch('http://localhost:9001/actuator/health');
    }

    const data = await res.json();
    const db = data.components?.db;
    const disk = data.components?.diskSpace?.details;
    const totalGb = disk ? Math.round(disk.total / (1024 * 1024 * 1024)) : 0;
    const freeGb = disk ? Math.round(disk.free / (1024 * 1024 * 1024)) : 0;
    const usagePercent = totalGb > 0 ? Math.round(((totalGb - freeGb) / totalGb) * 100) : 0;

    return {
      serviceId: 'pn-identity',
      name: 'Identity & Authentication Service',
      port: 9001,
      status: data.status === 'UP' ? 'UP' : 'DOWN',
      database: {
        type: db?.details?.database || 'PostgreSQL',
        status: db?.status || 'UP'
      },
      diskSpace: {
        totalGb,
        freeGb,
        usagePercent
      },
      components: data.components
    };
  } catch (error) {
    return {
      serviceId: 'pn-identity',
      name: 'Identity & Authentication Service',
      port: 9001,
      status: 'DOWN'
    };
  }
}

export async function getAllServicesHealth(): Promise<ServiceHealthData[]> {
  const [gw, id] = await Promise.all([getGatewayHealth(), getIdentityHealth()]);
  return [gw, id];
}
