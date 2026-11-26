import { epochDay } from '../dates.js';
import { credentials, healthRequest } from './client.js';
import { healthMetrics, type HealthMetric } from './catalog.js';
import { GoogleHealthError, type GoogleHealthEnv } from './types.js';

export type HealthQuery = {
  metric: HealthMetric;
  from: string;
  to: string;
  mode: 'daily' | 'reconciled' | 'raw';
  cursor?: string;
  pageToken?: string;
  pageSize: number;
};
const day = (number: number) => new Date(number * 86400000).toISOString().slice(0, 10);
const civil = (date: string) => {
  const [year, month, dateDay] = date.split('-').map(Number);
  return { date: { year, month, day: dateDay }, time: { hours: 0, minutes: 0, seconds: 0 } };
};

export const readHealth = async (input: HealthQuery, env: GoogleHealthEnv) => {
  const first = epochDay(input.from), last = epochDay(input.to);
  const cursor = epochDay(input.cursor ?? input.from);
  if (last < first || cursor < first || cursor > last || last >= epochDay('9999-12-31')) {
    throw new GoogleHealthError('invalid_dates', 'Use an ordered inclusive date range; cursor must be inside it. Latest supported end is 9999-12-30.');
  }
  if (input.pageToken && !input.cursor) throw new GoogleHealthError('invalid_cursor', 'Use the entire nextRequest returned by the previous call, including its cursor.');
  const metric = healthMetrics[input.metric];
  if (!metric) throw new GoogleHealthError('unsupported_metric', 'Choose a documented supported metric.');
  if (!credentials(env).scopes.includes(metric.scope)) throw new GoogleHealthError('missing_google_scope', 'This category was not granted in Google. Reconnect Google Health and allow this category.');
  if (input.mode === 'daily' && !metric.dailyRollup) throw new GoogleHealthError('unsupported_aggregation', 'This metric does not support daily summaries here. Use reconciled mode.');
  if (input.mode === 'raw' && 'raw' in metric && !metric.raw) throw new GoogleHealthError('unsupported_raw', 'This metric has no raw list operation. Use daily or reconciled.');
  if (input.mode === 'reconciled' && 'reconciled' in metric && !metric.reconciled) throw new GoogleHealthError('unsupported_reconciliation', 'This derived metric supports daily summaries only. Use daily mode.');
  const end = Math.min(cursor + 13, last);
  const nextDay = day(end + 1);
  const path = `users/me/dataTypes/${input.metric}/dataPoints`;
  let response: Record<string, unknown>;
  if (input.mode === 'daily') {
    response = await healthRequest(env, `${path}:dailyRollUp`, undefined, {
      range: { start: civil(day(cursor)), end: civil(nextDay) }, windowSizeDays: 1, pageSize: 100,
      ...(input.pageToken ? { pageToken: input.pageToken } : {}),
      dataSourceFamily: 'users/me/dataSourceFamilies/all-sources'
    });
  } else {
    const field = `${input.metric.replace(/-/g, '_')}.${metric.field}`;
    const params = new URLSearchParams({
      filter: `${field} >= "${day(cursor)}" AND ${field} < "${nextDay}"`,
      pageSize: String('session' in metric ? Math.min(25, input.pageSize) : input.pageSize)
    });
    if (input.pageToken) params.set('pageToken', input.pageToken);
    // list(sleep) explicitly forbids dataSourceFamily; omission defaults to all sources.
    if (input.mode !== 'raw' || input.metric !== 'sleep') params.set('dataSourceFamily', 'users/me/dataSourceFamilies/all-sources');
    response = await healthRequest(env, input.mode === 'raw' ? path : `${path}:reconcile`, params);
  }
  const key = input.mode === 'daily' ? 'rollupDataPoints' : 'dataPoints';
  if (response[key] !== undefined && !Array.isArray(response[key])) throw new GoogleHealthError('invalid_response', 'Invalid data page returned by Google.');
  const points = response[key] ?? [];
  if (response.nextPageToken !== undefined && typeof response.nextPageToken !== 'string') throw new GoogleHealthError('invalid_response', 'Invalid pagination returned by Google.');
  const pageToken = response.nextPageToken as string | undefined;
  const nextCursor = pageToken ? day(cursor) : end < last ? nextDay : undefined;
  return {
    source: 'Google Health API (all sources, including synchronized Health Connect data)',
    fetchedAt: new Date().toISOString(),
    requestedFrom: input.from, requestedTo: input.to, pageFrom: day(cursor), pageTo: day(end),
    metric: input.metric, mode: input.mode, records: points,
    complete: !nextCursor,
    nextRequest: nextCursor ? { ...input, cursor: nextCursor, pageToken: pageToken || undefined } : null,
    notes: [
      'Dates use the recorded local civil time. Sleep is selected by wake/end date; other sessions by start date.',
      'FetchedAt is API retrieval time, not watch or phone synchronization time. Missing readings are unknown, never zero.',
      input.mode === 'raw' ? 'Raw records include source metadata and may overlap. Do not sum overlapping phone/watch records.' : 'Google reconciles available sources; these values are not guaranteed to equal Samsung Health screen totals.',
      'Follow nextRequest until complete=true before reporting the entire requested period. Keep all request fields unchanged when following a page token.'
    ]
  };
};

export const healthConnectionStatus = async (env: GoogleHealthEnv) => {
  const config = credentials(env);
  const identity = await healthRequest(env, 'users/me/identity');
  if (identity.healthUserId !== config.healthUserId) throw new GoogleHealthError('account_mismatch', 'The Google Health account differs from the linked owner account. Reconnect.');
  return {
    connected: true,
    metricsAllowedByGoogleConsent: Object.entries(healthMetrics).filter(([, metric]) => config.scopes.includes(metric.scope)).map(([name]) => name),
    note: 'Consent permits these categories, but does not prove that Samsung has synchronized records. Read a recent period to check actual data.'
  };
};
