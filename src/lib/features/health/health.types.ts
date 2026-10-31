export interface HealthIndicator {
  status: 'UP' | 'DOWN' | 'UNKNOWN';
  details?: Record<string, any>;
}

export interface ServiceHealthData {
  serviceId: string;
  name: string;
  port: number;
  status: 'UP' | 'DOWN';
  uptime?: string;
  database?: {
    type: string;
    status: string;
  };
  diskSpace?: {
    totalGb: number;
    freeGb: number;
    usagePercent: number;
  };
  components?: Record<string, any>;
}
