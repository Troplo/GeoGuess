export interface AuthStartSessionV1Response {
  token: string;
  playerId: string;
}

export interface AuthRenewSessionV1Response {
  success: boolean;
}
