export interface CoreStateV1Response {
  requireAuth: boolean;
  environment: 'development' | 'test' | 'production';
  googleApiKey: string;
  tpuAppId: string;
}
