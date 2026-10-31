import { HealthStatus } from '$core/constants';

export { HealthStatus };

export interface HealthIndicator {
  status: HealthStatus | 'UNKNOWN';
  details?: Record<string, any>;
}

export interface ServiceHealthData {
  serviceId: string;
  name: string;
  port: number;
  status: HealthStatus;
  uptime?: string;
  database?: {
    type: string;
    status: HealthStatus | string;
  };
  diskSpace?: {
    totalGb: number;
    freeGb: number;
    usagePercent: number;
  };
  components?: Record<string, any>;
}
