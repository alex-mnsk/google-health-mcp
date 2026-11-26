import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { epochDay } from '../dates.js';
import { healthMetricNames } from '../googleHealth/catalog.js';
import { healthConnectionStatus, readHealth } from '../googleHealth/read.js';
import { GoogleHealthError } from '../googleHealth/types.js';
import type { CloudEnv } from './types.js';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  try { epochDay(value); return true; } catch { return false; }
}, 'Use a valid YYYY-MM-DD date');
const annotations = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true };
const scopes = ['health:read'];
const securitySchemes = [{ type: 'oauth2', scopes }];

export const registerHealthTools = (server: McpServer, env: CloudEnv, grantedScopes: string[]) => {
  const run = async (read: () => Promise<unknown>) => {
    if (!scopes.every(scope => grantedScopes.includes(scope))) return {
      isError: true, content: [{ type: 'text' as const, text: 'Reconnect the plugin and allow reading health and activity data.' }],
      _meta: { 'mcp/www_authenticate': [`Bearer resource_metadata="${env.PUBLIC_ORIGIN}/.well-known/oauth-protected-resource/mcp", error="insufficient_scope", scope="health:read"`] }
    };
    try {
      return { content: [{ type: 'text' as const, text: JSON.stringify(await read()) }] };
    } catch (error) {
      return { isError: true, content: [{ type: 'text' as const, text: JSON.stringify(error instanceof GoogleHealthError
        ? { error: error.kind, message: error.message }
        : { error: 'service_unavailable', message: 'Google Health is temporarily unavailable. Try later; no data was changed.' }) }] };
    }
  };
  server.registerTool('google_health_connection_status', {
    title: 'Check Google Health connection',
    description: 'Check the owner Google Health account link and allowed read categories. Does not prove Samsung or watch data has synchronized.',
    inputSchema: {}, annotations, _meta: { securitySchemes }
  }, () => run(() => healthConnectionStatus(env)));
  server.registerTool('google_health_get_data', {
    title: 'Read health and activity from Google Health',
    description: 'Read Galaxy Watch / Samsung Health data synchronized through Health Connect and Google Health, plus other sources in the owner account. Supports any inclusive date interval, with bounded 14-day pages and record pagination. Follow nextRequest until complete=true. Prefer daily for supported activity/heart-rate/weight summaries, reconciled for sleep, exercise and other measurements; raw to inspect source/device metadata. Raw records can overlap: never sum phone and watch records without deduplication. Absence means unknown, not zero. Fresh API retrieval does not prove a fresh watch sync.',
    inputSchema: z.object({
      metric: z.enum(healthMetricNames),
      from: date.describe('First date, inclusive, in the recorded local time.'),
      to: date.describe('Last date, inclusive. Sleep is selected by wake/end date.'),
      mode: z.enum(['daily', 'reconciled', 'raw']).default('reconciled'),
      cursor: date.optional().describe('Use nextRequest unchanged for subsequent pages.'),
      pageToken: z.string().min(1).max(16000).optional(),
      pageSize: z.number().int().min(1).max(100).default(100)
    }).strict(), annotations, _meta: { securitySchemes }
  }, input => run(() => readHealth(input, env)));
};
