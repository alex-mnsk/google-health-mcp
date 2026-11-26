import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { writeMetrics } from '../googleHealth/writeCatalog.js';
import { objectSchema } from '../googleHealth/writeSchema.js';
import { createEntry, deleteEntries, getEntry, readAccount, updateAccount, updateEntry } from '../googleHealth/write.js';
import { GoogleHealthError } from '../googleHealth/types.js';
import { healthMetrics } from '../googleHealth/catalog.js';
import type { CloudEnv } from './types.js';

const nameSchema = z.string().max(300).regex(/^users\/[a-zA-Z0-9-]{1,63}\/dataTypes\/[a-z-]+\/dataPoints\/[a-zA-Z0-9_-]{1,128}$/);
const shapes = writeMetrics.map(metric => ({ metric, schema: objectSchema(metric.schema) }));

export const registerHealthWriteTools = (server: McpServer, env: CloudEnv, scopes: string[]) => {
  const meta = (write: boolean) => ({ securitySchemes: [{ type: 'oauth2', scopes: write ? ['health:read', 'health:write'] : ['health:read'] }] });
  const run = async (write: boolean, action: () => Promise<unknown> | unknown) => {
    if (!scopes.includes('health:read') || (write && !scopes.includes('health:write'))) return {
      isError: true,
      content: [{ type: 'text' as const, text: 'Reconnect Google Health and grant permission to change health data.' }],
      _meta: { 'mcp/www_authenticate': [`Bearer resource_metadata="${env.PUBLIC_ORIGIN}/.well-known/oauth-protected-resource/mcp", error="insufficient_scope", scope="health:read health:write"`] }
    };
    try { return { content: [{ type: 'text' as const, text: JSON.stringify(await action()) }] }; }
    catch (error) { return { isError: true, content: [{ type: 'text' as const, text: JSON.stringify(error instanceof GoogleHealthError
      ? { error: error.kind, message: error.message, retryAutomatically: false }
      : { error: 'service_unavailable', message: 'Could not verify the result. Read back affected records before retrying any write.', retryAutomatically: false }) }] }; }
  };
  const annotations = (write: boolean) => ({ readOnlyHint: !write, destructiveHint: write, idempotentHint: !write, openWorldHint: true });
  server.registerTool('google_health_capabilities', {
    title: 'List Google Health read and write capabilities',
    description: 'List supported metrics, allowed read modes, and writable entry categories. Google write scopes permit changing/deleting this application own entries only. Many Samsung manual-entry types have no Google API write operation. This is a protocol capability list, not proof of account permission or synchronized records.',
    inputSchema: {}, annotations: annotations(false), _meta: meta(false)
  }, () => run(false, () => ({
    readMetrics: Object.entries(healthMetrics).map(([metric, value]) => ({ metric, modes: [...('reconciled' in value && !value.reconciled ? [] : ['reconciled']), ...('raw' in value && !value.raw ? [] : ['raw']), ...(value.dailyRollup ? ['daily'] : [])] })),
    writeMetrics: writeMetrics.map(metric => ({ metric: metric.name, operations: ['create', 'update', 'delete'], googleScope: metric.scope })),
    accountChanges: { profile: Object.keys(objectSchema('Profile').shape), settings: Object.keys(objectSchema('Settings').shape) },
    limitations: ['Only entries written by this OAuth client may be changed/deleted.', 'Anonymous-food nutrition logs cannot be edited.', 'Pulse, blood pressure, SpO2 and steps are not writable through these API methods.', 'Google Health writes are not guaranteed to propagate back to Samsung Health.']
  })));
  server.registerTool('google_health_get_entry', {
    title: 'Read one identifiable Google Health entry', description: 'Read an exact entry by its resource name. Use to verify a write or recover from an unknown write outcome; never invent existing IDs. Some categories may only permit reading this application own entries.',
    inputSchema: { name: nameSchema }, annotations: annotations(false), _meta: meta(false)
  }, ({ name }) => run(false, () => getEntry(name, env)));
  for (const { metric, schema } of shapes) {
    const stem = metric.name.replace(/-/g, '_');
    server.registerTool(`google_health_create_${stem}`, {
      title: `Create Google Health ${metric.name}`,
      description: `Create a manual ${metric.name} entry, only at the user request. Use documented units and explicit timestamps/UTC offsets. Do not fabricate measurements, inferred sleep stages or workout metrics. Returns an operation: pending is not completed. If outcome is unknown, read back the returned resource name before any retry. Samsung Health back-sync is not guaranteed.`,
      inputSchema: { data: schema, entryId: z.string().regex(/^[a-z0-9-]{4,63}$/).optional().describe('Optional stable new record ID; otherwise the server generates a UUID. Never reuse an existing ID for a new entry.') },
      annotations: annotations(true), _meta: meta(true)
    }, ({ data, entryId }) => run(true, () => createEntry(metric, data, entryId, env)));
    server.registerTool(`google_health_update_${stem}`, {
      title: `Update Google Health ${metric.name}`,
      description: `Update only requested fields in an existing ${metric.name} entry created by this OAuth application. Read the real resource name first. Other apps/Samsung/manual mobile records cannot be edited with this permission. Unspecified top-level fields are preserved; supplied arrays replace their previous values. Anonymous-food nutrition logs cannot be edited. Never retry automatically after an unclear result.`,
      inputSchema: { name: nameSchema, changes: schema.partial().refine(value => Object.keys(value).length > 0, 'Specify fields to change') },
      annotations: annotations(true), _meta: meta(true)
    }, ({ name, changes }) => run(true, () => updateEntry(metric, name, changes, env)));
  }
  server.registerTool('google_health_delete_entries', {
    title: 'Delete Google Health entries', description: 'Delete explicit records requested by the user, all in one category, created by this OAuth application. Look up exact resource names first. Do not select additional records. Returns an operation; pending is not completion. Never retry an uncertain deletion automatically.',
    inputSchema: { names: z.array(nameSchema).min(1).max(20) }, annotations: annotations(true), _meta: meta(true)
  }, ({ names }) => run(true, () => deleteEntries(names, env)));
  for (const kind of ['profile', 'settings'] as const) {
    const schema = objectSchema(kind === 'profile' ? 'Profile' : 'Settings');
    server.registerTool(`google_health_get_${kind}`, {
      title: `Read Google Health ${kind}`, description: `Read owner ${kind} through Google Health API.`, inputSchema: {}, annotations: annotations(false), _meta: meta(false)
    }, () => run(false, () => readAccount(kind, env)));
    server.registerTool(`google_health_update_${kind}`, {
      title: `Update Google Health ${kind}`, description: `Change only fields explicitly requested by the user in Google Health ${kind}. Only fields Google documents as writable are accepted. Other fields are preserved using an explicit update mask.`,
      inputSchema: { changes: schema.partial().refine(value => Object.keys(value).length > 0, 'Specify fields to change') }, annotations: annotations(true), _meta: meta(true)
    }, ({ changes }) => run(true, () => updateAccount(kind, changes, env)));
  }
};
