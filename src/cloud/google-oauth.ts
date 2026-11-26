import { readJson } from '../googleHealth/client.js';
import { GoogleHealthError } from '../googleHealth/types.js';
import type { CloudEnv, OwnerProps } from './types.js';

export const googleToken = async (parameters: Record<string, string>, env: CloudEnv) => {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', redirect: 'manual', signal: AbortSignal.timeout(15000),
    body: new URLSearchParams({ ...parameters, client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET })
  });
  const value = await readJson(response);
  if (!response.ok || typeof value.access_token !== 'string' || typeof value.expires_in !== 'number' || value.expires_in <= 0) {
    throw new GoogleHealthError(value.error === 'invalid_grant' ? 'reconnect_required' : 'oauth_unavailable', 'Google authorization failed. Reconnect the plugin.');
  }
  return value as { access_token: string; expires_in: number; refresh_token?: string; scope?: string };
};

export const refreshOwner = async (props: OwnerProps, env: CloudEnv): Promise<OwnerProps> => {
  if (props.expiresAt > Date.now() + 120000) return props;
  const token = await googleToken({ grant_type: 'refresh_token', refresh_token: props.refreshToken }, env);
  return { ...props, accessToken: token.access_token, expiresAt: Date.now() + token.expires_in * 1000,
    refreshToken: token.refresh_token ?? props.refreshToken,
    scopes: token.scope ? token.scope.split(' ') : props.scopes };
};
