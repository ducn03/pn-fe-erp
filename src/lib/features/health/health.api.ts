import { API_BASE_URL } from '$core/api';
import { HealthStatus } from '$core/constants';
import type { ServiceHealthData } from './health.types';

function parseDiskMetrics(disk: { total: number; free: number } | undefined) {
  if (!disk) {
    return {
      totalGb: 0,
      freeGb: 0,
      usagePercent: 0
    };
  }

  const totalGb = Math.round(disk.total / (1024 * 1024 * 1024));
  const freeGb = Math.round(disk.free / (1024 * 1024 * 1024));
  let usagePercent = 0;
  if (totalGb > 0) {
    usagePercent = Math.round(((totalGb - freeGb) / totalGb) * 100);
  }

  return {
    totalGb,
    freeGb,
    usagePercent
  };
}

function resolveServiceStatus(rawStatus: string | undefined): HealthStatus {
  if (rawStatus === HealthStatus.UP) {
    return HealthStatus.UP;
  }
  return HealthStatus.DOWN;
}

export async function getGatewayHealth(): Promise<ServiceHealthData> {
  try {
    const res = await fetch(`${API_BASE_URL}/actuator/health`);
    const data = await res.json();
    const diskMetrics = parseDiskMetrics(data.components?.diskSpace?.details);

    return {
      serviceId: 'pn-api-gateway',
      name: 'Spring Cloud API Gateway',
      port: 9000,
      status: resolveServiceStatus(data.status),
      diskSpace: diskMetrics,
      components: data.components
    };
  } catch (error) {
    return {
      serviceId: 'pn-api-gateway',
      name: 'Spring Cloud API Gateway',
      port: 9000,
      status: HealthStatus.DOWN
    };
  }
}

export async function getIdentityHealth(): Promise<ServiceHealthData> {
  try {
    let res: Response;
    try {
      res = await fetch(`${API_BASE_URL}/actuator/identity/health`);
      if (!res.ok) {
        throw new Error('Gateway route not ok');
      }
    } catch {
      res = await fetch('http://localhost:9001/actuator/health');
    }

    const data = await res.json();
    const db = data.components?.db;
    const diskMetrics = parseDiskMetrics(data.components?.diskSpace?.details);

    let dbType = 'PostgreSQL';
    if (db?.details?.database) {
      dbType = db.details.database;
    }

    let dbStatus = HealthStatus.UP;
    if (db?.status) {
      dbStatus = resolveServiceStatus(db.status);
    }

    return {
      serviceId: 'pn-identity',
      name: 'Identity & Authentication Service',
      port: 9001,
      status: resolveServiceStatus(data.status),
      database: {
        type: dbType,
        status: dbStatus
      },
      diskSpace: diskMetrics,
      components: data.components
    };
  } catch (error) {
    return {
      serviceId: 'pn-identity',
      name: 'Identity & Authentication Service',
      port: 9001,
      status: HealthStatus.DOWN
    };
  }
}

export async function getAllServicesHealth(): Promise<ServiceHealthData[]> {
  const [gw, id] = await Promise.all([getGatewayHealth(), getIdentityHealth()]);
  return [gw, id];
}
