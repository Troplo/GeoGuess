import { LogLevel } from '@nestjs/common';

export class GeoServerConfig {
  requireAuth: boolean;
  environment: 'development' | 'test' | 'production';
  googleApiKey: string;
  tpuAppId: string;
  logLevels: LogLevel[];
  redis: {
    username?: string | undefined;
    password?: string | undefined;
    host: string;
    db: number;
    port: number;
  };
}
