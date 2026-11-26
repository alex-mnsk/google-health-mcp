import { GoogleHealthError, type GoogleHealthCredentials, type GoogleHealthEnv } from './types.js';

const cachedTokens = new WeakMap<GoogleHealthEnv, { value: string; expiresAt: number }>();
const pendingTokens = new WeakMap<GoogleHealthEnv, Promise<string>>();

export const credentials = (env: GoogleHealthEnv): GoogleHealthCredentials => {
  try {
    const value = JSON.parse(env.GOOGLE_HEALTH_CREDENTIALS_JSON ?? '{}');
    if (![value.clientId, value.clientSecret, value.refreshToken, value.healthUserId].every(item => typeof item === 'string' && item.length > 0) ||
        !Array.isArray(value.scopes) || !value.scopes.every((scope: unknown) => typeof scope === 'string')) throw new Error();
    return value;
  } catch {
    throw new GoogleHealthError('not_connected', 'Google Health is not connected. Complete the owner setup in GOOGLE_HEALTH.md.');
  }
};

// Bound decoded response bodies even when content-length is missing or misleading.
export const readJson = async (response: Response): Promise<Record<string, unknown>> => {
  if (!response.body) throw new GoogleHealthError('invalid_response', 'Google returned an empty response.');
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 2_000_000) {
        await reader.cancel();
        throw new GoogleHealthError('response_too_large', 'Request a smaller page or shorter period.');
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  const value: unknown = JSON.parse(new TextDecoder().decode(bytes));
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new GoogleHealthError('invalid_response', 'Invalid Google response.');
  return value as Record<string, unknown>;
};

const token = async (env: GoogleHealthEnv): Promise<string> => {
  const provided = credentials(env);
  if (provided.accessToken && typeof provided.expiresAt === 'number' && provided.expiresAt > Date.now() + 60000) return provided.accessToken;
  const cached = cachedTokens.get(env);
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.value;
  const pending = pendingTokens.get(env);
  if (pending) return pending;
  const refresh = (async () => {
    const config = credentials(env);
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST', redirect: 'manual', signal: AbortSignal.timeout(15000),
      body: new URLSearchParams({ client_id: config.clientId, client_secret: config.clientSecret,
        refresh_token: config.refreshToken, grant_type: 'refresh_token' })
    });
    const value = await readJson(response);
    if (!response.ok) {
      if (value.error === 'invalid_grant') throw new GoogleHealthError('reconnect_required', 'Google permission expired or was revoked. Reconnect the owner account. Testing-mode tokens expire after 7 days.');
      throw new GoogleHealthError('authorization_unavailable', 'Google could not renew access. Check OAuth client configuration and service availability.');
    }
    if (typeof value.access_token !== 'string' || typeof value.expires_in !== 'number' || value.expires_in <= 0) throw new GoogleHealthError('invalid_response', 'Invalid token response.');
    cachedTokens.set(env, { value: value.access_token, expiresAt: Date.now() + value.expires_in * 1000 });
    return value.access_token;
  })();
  pendingTokens.set(env, refresh);
  try { return await refresh; } finally { pendingTokens.delete(env); }
};

export const healthRequest = async (env: GoogleHealthEnv, path: string, query?: URLSearchParams, body?: unknown, method?: 'GET' | 'POST' | 'PATCH', mutation = false) => {
  // Callers supply only catalog-controlled paths, never model-provided URLs.
  if (!/^users\/me\/(identity|profile|settings|dataTypes\/[a-z-]+\/dataPoints(?::dailyRollUp|:reconcile|:batchDelete|\/[a-zA-Z0-9_-]{1,128})?)$/.test(path)) throw new Error('Invalid health path');
  const url = new URL(`https://health.googleapis.com/v4/${path}`);
  if (query) url.search = query.toString();
  // Complete token refresh before sending a mutation: a token failure cannot mean a write happened.
  const accessToken = await token(env);
  let response: Response;
  try { response = await fetch(url, {
    method: method ?? (body === undefined ? 'GET' : 'POST'), redirect: 'manual', signal: AbortSignal.timeout(20000),
    headers: { authorization: `Bearer ${accessToken}`, accept: 'application/json', ...(body === undefined ? {} : { 'content-type': 'application/json' }) },
    body: body === undefined ? undefined : JSON.stringify(body)
  }); } catch {
    throw new GoogleHealthError(mutation ? 'outcome_unknown' : 'service_unavailable', mutation
      ? 'Write outcome is unknown. Do not repeat. Read back the resource by name first.' : 'Google Health is temporarily unavailable.');
  }
  if (response.status === 401) {
    cachedTokens.delete(env);
    throw new GoogleHealthError('reconnect_required', 'Google rejected the access token. Reconnect if the next request also fails.');
  }
  if (response.status === 403) throw new GoogleHealthError('permission_denied', 'Google denied this data category. Check granted scopes and whether Google Health API is enabled.');
  if (response.status === 429) throw new GoogleHealthError('rate_limited', 'Google request limit reached. Try later.');
  if (!response.ok) throw new GoogleHealthError(mutation && (response.status >= 500 || response.status === 408) ? 'outcome_unknown' : 'upstream_error', mutation
    ? 'Google did not confirm this write. Do not retry automatically; read back the resource first.' : 'Google could not read the data. Check the account link, parameters and API availability.');
  try { return await readJson(response); } catch {
    throw new GoogleHealthError(mutation ? 'outcome_unknown' : 'invalid_response', mutation
      ? 'The write response could not be verified. Do not repeat; read back the resource first.' : 'Invalid Google response; request a smaller page.');
  }
};
