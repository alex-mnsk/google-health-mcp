import { randomUUID } from 'node:crypto';
import { credentials, healthRequest } from './client.js';
import { writeMetrics } from './writeCatalog.js';
import { mergeChanges, objectSchema, validateTimes, writableFields } from './writeSchema.js';
import { GoogleHealthError, type GoogleHealthEnv } from './types.js';

export type WritableMetric = (typeof writeMetrics)[number];
const dictionary = new Map<string, WritableMetric>(writeMetrics.map(metric => [metric.name, metric]));

export const requireGoogleScope = (env: GoogleHealthEnv, scope: string) => {
  if (!credentials(env).scopes.includes(scope)) throw new GoogleHealthError('missing_google_scope', 'Reconnect Google Health and grant this data category. The operation was not sent.');
};

export const ownerResource = (name: string, env: GoogleHealthEnv) => {
  const match = /^users\/([a-zA-Z0-9-]{1,63})\/dataTypes\/([a-z-]+)\/dataPoints\/([a-zA-Z0-9_-]{1,128})$/.exec(name);
  if (!match || (match[1] !== 'me' && match[1] !== credentials(env).healthUserId) || !dictionary.has(match[2])) {
    throw new GoogleHealthError('invalid_resource', 'Use the exact supported entry resource name from an owner read/create response.');
  }
  return { name: `users/me/dataTypes/${match[2]}/dataPoints/${match[3]}`, metric: dictionary.get(match[2])! };
};

const payload = (metric: WritableMetric, data: Record<string, unknown>) => {
  try {
    const parsed = objectSchema(metric.schema).parse(data);
    validateTimes(parsed);
    return parsed;
  } catch {
    throw new GoogleHealthError('invalid_input', 'The entry does not match the documented schema, required fields, units or time range. Nothing was written.');
  }
};

const operation = (value: Record<string, unknown>, names: string[]) => ({
  entryNames: names,
  status: value.error ? 'failed' : value.done === true ? 'completed' : 'pending',
  operationName: typeof value.name === 'string' ? value.name : null,
  ...(value.error ? { error: 'Google reported that the operation failed.' } : {}),
  verification: 'Read the entry by name before reporting its final values. If pending or outcome unknown, never repeat the write automatically.',
  samsungSync: 'This changes Google Health. Propagation back to Samsung Health is not guaranteed.'
});

export const createEntry = async (metric: WritableMetric, data: Record<string, unknown>, entryId: string | undefined, env: GoogleHealthEnv) => {
  requireGoogleScope(env, metric.scope);
  const parsed = payload(metric, data);
  const name = `users/me/dataTypes/${metric.name}/dataPoints/${entryId ?? randomUUID()}`;
  try {
    return operation(await healthRequest(env, `users/me/dataTypes/${metric.name}/dataPoints`, undefined,
      { name, [metric.field]: parsed, dataSource: { recordingMethod: 'MANUAL' } }, 'POST', true), [name]);
  } catch (error) {
    if (error instanceof GoogleHealthError && error.kind === 'outcome_unknown') throw new GoogleHealthError(error.kind, `${error.message} Resource: ${name}`);
    throw error;
  }
};

export const getEntry = async (name: string, env: GoogleHealthEnv) => {
  const resource = ownerResource(name, env);
  const granted = credentials(env).scopes;
  if (![resource.metric.scope, resource.metric.scope.replace('.writeonly', '.readonly')].some(scope => granted.includes(scope))) {
    throw new GoogleHealthError('missing_google_scope', 'This entry category was not granted. Reconnect Google Health.');
  }
  return healthRequest(env, resource.name);
};

const requireOurEntry = (value: Record<string, unknown>, env: GoogleHealthEnv) => {
  const source = value.dataSource as { application?: { googleWebClientId?: string } } | undefined;
  if (source?.application?.googleWebClientId !== credentials(env).clientId) throw new GoogleHealthError('foreign_entry', 'Only records created by this OAuth application can be changed or deleted. This record has a different or unverified source.');
};

export const updateEntry = async (metric: WritableMetric, name: string, changes: Record<string, unknown>, env: GoogleHealthEnv) => {
  requireGoogleScope(env, metric.scope);
  const resource = ownerResource(name, env);
  if (resource.metric.name !== metric.name) throw new GoogleHealthError('invalid_resource', 'Entry category does not match this tool.');
  const existing = await getEntry(name, env);
  requireOurEntry(existing, env);
  const original = existing[metric.field];
  if (!original || typeof original !== 'object' || Array.isArray(original)) throw new GoogleHealthError('invalid_response', 'Existing entry has no matching data. Nothing was changed.');
  if (metric.name === 'nutrition-log' && !(original as Record<string, unknown>).food) throw new GoogleHealthError('uneditable_entry', 'Google does not support editing nutrition logs created from anonymous food.');
  const data = payload(metric, mergeChanges(writableFields(metric.schema, original as Record<string, unknown>), changes));
  return operation(await healthRequest(env, resource.name, undefined,
    { name: resource.name, [metric.field]: data, dataSource: { recordingMethod: 'MANUAL' } }, 'PATCH', true), [resource.name]);
};

export const deleteEntries = async (names: string[], env: GoogleHealthEnv) => {
  const resources = names.map(name => ownerResource(name, env));
  if (new Set(resources.map(resource => resource.name)).size !== resources.length) throw new GoogleHealthError('invalid_resource', 'Duplicate entry names are not allowed.');
  const metric = resources[0].metric;
  if (resources.some(resource => resource.metric.name !== metric.name)) throw new GoogleHealthError('invalid_resource', 'Delete one data category per call.');
  requireGoogleScope(env, metric.scope);
  for (const resource of resources) requireOurEntry(await getEntry(resource.name, env), env);
  const normalized = resources.map(resource => resource.name);
  return operation(await healthRequest(env, `users/me/dataTypes/${metric.name}/dataPoints:batchDelete`, undefined,
    { names: normalized }, 'POST', true), normalized);
};

export const readAccount = async (kind: 'profile' | 'settings', env: GoogleHealthEnv) => {
  requireGoogleScope(env, `https://www.googleapis.com/auth/googlehealth.${kind}.readonly`);
  return healthRequest(env, `users/me/${kind}`);
};

export const updateAccount = async (kind: 'profile' | 'settings', changes: Record<string, unknown>, env: GoogleHealthEnv) => {
  requireGoogleScope(env, `https://www.googleapis.com/auth/googlehealth.${kind}.writeonly`);
  const schemaName = kind === 'profile' ? 'Profile' : 'Settings';
  if (!Object.keys(changes).length) throw new GoogleHealthError('invalid_input', 'Specify at least one field to change.');
  const data = objectSchema(schemaName).partial().parse(changes);
  const query = new URLSearchParams({ updateMask: Object.keys(data).join(',') });
  // Explicit mask changes only requested fields; no other account settings are overwritten.
  return healthRequest(env, `users/me/${kind}`, query, { ...data, name: `users/me/${kind}` }, 'PATCH', true);
};
