export type GoogleHealthCredentials = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  healthUserId: string;
  scopes: string[];
  accessToken?: string;
  expiresAt?: number;
};

export type GoogleHealthEnv = { GOOGLE_HEALTH_CREDENTIALS_JSON?: string };

export class GoogleHealthError extends Error {
  constructor(public readonly kind: string, message: string) { super(message); }
}
