export interface StatMetric {
  id: string;
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface ServiceHealth {
  name: string;
  serviceId: string;
  port: number;
  status: 'UP' | 'DOWN' | 'CONNECTING';
  uptime: string;
}
