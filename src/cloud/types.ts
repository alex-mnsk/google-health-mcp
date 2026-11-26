import type { OAuthHelpers } from '@cloudflare/workers-oauth-provider';
import type { GoogleHealthEnv } from '../googleHealth/types.js';

export type CloudEnv = GoogleHealthEnv & {
  OAUTH_KV: KVNamespace;
  OAUTH_PROVIDER: OAuthHelpers;
  PUBLIC_ORIGIN: string;
  ENABLE_WRITES?: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  OWNER_GOOGLE_EMAIL: string;
  OWNER_GOOGLE_SUB?: string;
};

export type OwnerProps = {
  googleSub: string;
  email: string;
  refreshToken: string;
  accessToken: string;
  expiresAt: number;
  healthUserId: string;
  scopes: string[];
};

export const isOwner = (props: Partial<OwnerProps> | undefined, env: CloudEnv): props is OwnerProps =>
  Boolean(env.OWNER_GOOGLE_EMAIL && props?.email?.toLowerCase() === env.OWNER_GOOGLE_EMAIL.toLowerCase() &&
    props?.googleSub && (!env.OWNER_GOOGLE_SUB || props.googleSub === env.OWNER_GOOGLE_SUB) &&
    props.refreshToken && props.healthUserId && Array.isArray(props.scopes));
