import { z } from 'zod';
import { writeDefinitions } from './writeCatalog.js';

type Definition = {
  type?: string; $ref?: string; format?: string; enum?: readonly string[]; description?: string;
  properties?: Record<string, Definition>; required?: readonly string[]; items?: Definition;
};
const definitions: Record<string, Definition> = writeDefinitions;
const cache = new Map<string, z.ZodObject<Record<string, z.ZodType>>>();

const fieldSchema = (definition: Definition): z.ZodType => {
  let schema: z.ZodType;
  if (definition.$ref) schema = objectSchema(definition.$ref);
  else if (definition.enum) schema = z.enum([...definition.enum] as [string, ...string[]]);
  else if (definition.type === 'string') {
    let text = z.string().max(16000);
    if (definition.format === 'google-datetime') text = text.refine(value =>
      z.iso.datetime({ offset: true }).safeParse(value).success, 'Use a valid RFC3339 timestamp with timezone');
    if (definition.format === 'google-duration') text = text.regex(/^-?\d+(?:\.\d{1,9})?s$/, 'Use a duration in seconds, e.g. 10800s for UTC+03:00');
    if (definition.format === 'int64' || definition.format === 'uint64') text = text.regex(definition.format === 'uint64' ? /^\d+$/ : /^-?\d+$/);
    schema = text;
  } else if (definition.type === 'number' || definition.type === 'integer') {
    let number = z.number().finite();
    if (definition.type === 'integer') number = number.int();
    const range = definition.description?.match(/range `?\[([0-9]+),\s*([0-9]+)\]/);
    if (range) number = number.min(Number(range[1])).max(Number(range[2]));
    schema = number;
  } else if (definition.type === 'boolean') schema = z.boolean();
  else if (definition.type === 'array' && definition.items) schema = z.array(fieldSchema(definition.items)).max(5000);
  else throw new Error('Unsupported static Google schema');
  return definition.description ? schema.describe(definition.description) : schema;
};

export const objectSchema = (name: string): z.ZodObject<Record<string, z.ZodType>> => {
  const cached = cache.get(name);
  if (cached) return cached;
  const definition = definitions[name];
  if (!definition?.properties) throw new Error('Unknown static Google schema');
  const shape: Record<string, z.ZodType> = {};
  for (const [key, property] of Object.entries(definition.properties)) {
    const field = fieldSchema(property);
    shape[key] = definition.required?.includes(key) ? field : field.optional();
  }
  const schema = z.object(shape).strict();
  cache.set(name, schema);
  return schema;
};

export const writableFields = (name: string, value: Record<string, unknown>): Record<string, unknown> => {
  const definition = definitions[name];
  const prune = (field: Definition, item: unknown): unknown => {
    if (field.$ref && item && typeof item === 'object' && !Array.isArray(item)) return writableFields(field.$ref, item as Record<string, unknown>);
    if (field.type === 'array' && field.items && Array.isArray(item)) return item.map(element => prune(field.items!, element));
    return item;
  };
  return Object.fromEntries(Object.entries(value).filter(([key]) => Object.hasOwn(definition.properties ?? {}, key))
    .map(([key, item]) => [key, prune(definition.properties![key], item)]));
};

export const mergeChanges = (original: Record<string, unknown>, changes: Record<string, unknown>): Record<string, unknown> => {
  const merged = { ...original };
  for (const [key, value] of Object.entries(changes)) {
    const previous = merged[key];
    merged[key] = value && typeof value === 'object' && !Array.isArray(value) && previous && typeof previous === 'object' && !Array.isArray(previous)
      ? mergeChanges(previous as Record<string, unknown>, value as Record<string, unknown>) : value;
  }
  return merged;
};

// Dates/ranges are checked after merging so partial updates retain other fields.
export const validateTimes = (value: unknown): void => {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) { value.forEach(validateTimes); return; }
  const record = value as Record<string, unknown>;
  if (typeof record.startTime === 'string' && typeof record.endTime === 'string' && Date.parse(record.startTime) > Date.parse(record.endTime)) throw new Error('Start must not be after end');
  for (const [key, item] of Object.entries(record)) {
    if (typeof item === 'string' && /^(startUtcOffset|endUtcOffset|utcOffset)$/.test(key) && Math.abs(Number(item.slice(0, -1))) > 18 * 3600) throw new Error('Invalid UTC offset');
    validateTimes(item);
  }
};
