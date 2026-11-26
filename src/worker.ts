import OAuthProvider, { OAuthError } from '@cloudflare/workers-oauth-provider';
import { GoogleHealthError } from './googleHealth/types.js';
import { mcpHandler } from './cloud/mcp.js';
import { signInHandler } from './cloud/sign-in.js';
import { refreshOwner } from './cloud/google-oauth.js';
import { isOwner, type CloudEnv } from './cloud/types.js';

const REFRESH_TOKEN_IDLE_TTL = 90 * 24 * 60 * 60;

export default {
  async fetch(request: Request, env: CloudEnv, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (!env.PUBLIC_ORIGIN || url.origin !== env.PUBLIC_ORIGIN || url.protocol !== 'https:') return new Response('Service setup is incomplete', { status: 503 });
    const provider = new OAuthProvider<CloudEnv>({
      apiRoute: '/mcp', apiHandler: mcpHandler, defaultHandler: signInHandler,
      authorizeEndpoint: '/authorize', tokenEndpoint: '/oauth/token',
      scopesSupported: ['health:read', ...(env.ENABLE_WRITES === 'true' ? ['health:write'] : []), 'offline_access'], requiredScopes: ['health:read'],
      accessTokenTTL: 900,
      // Keep active connections alive; expire abandoned grants after 90 days.
      refreshTokenTTL: REFRESH_TOKEN_IDLE_TTL,
      refreshTokenIdleTTL: REFRESH_TOKEN_IDLE_TTL,
      clientIdMetadataDocumentEnabled: true,
      resourceMetadata: { resource: `${env.PUBLIC_ORIGIN}/mcp`, authorization_servers: [env.PUBLIC_ORIGIN], resource_name: 'Private Google Health' },
      tokenExchangeCallback: async ({ props, env: currentEnv }) => {
        if (!isOwner(props, currentEnv)) throw new OAuthError('invalid_grant', { description: 'Owner access is no longer valid. Reconnect the plugin.' });
        try {
          const updated = await refreshOwner(props, currentEnv);
          // The ChatGPT token must expire before its Google token, so the next
          // exchange persists any refreshed/rotated upstream credentials.
          return { newProps: updated, accessTokenTTL: Math.max(60, Math.min(900, Math.floor((updated.expiresAt - Date.now()) / 1000) - 60)) };
        } catch (error) {
          if (error instanceof GoogleHealthError && error.kind === 'reconnect_required') {
            throw new OAuthError('invalid_grant', { description: 'Google access expired or was revoked. Reconnect the plugin.' });
          }
          // Temporary Google failures must not revoke an otherwise valid grant.
          throw error;
        }
      }
    });
    try {
      const response = await provider.fetch(request, env, ctx);
      response.headers.set('cache-control', 'no-store');
      response.headers.set('x-content-type-options', 'nosniff');
      response.headers.set('referrer-policy', 'same-origin');
      response.headers.set('strict-transport-security', 'max-age=31536000');
      return response;
    } catch {
      return new Response('Service temporarily unavailable. If Google access was revoked, reconnect the plugin.', { status: 503, headers: { 'cache-control': 'no-store' } });
    }
  }
};
