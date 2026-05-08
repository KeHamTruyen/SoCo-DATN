import crypto from 'crypto';
import { getRedisClient } from './redis.js';

export const CACHE_TTL_SECONDS = {
  productsList: 180,
  productDetail: 120,
  postsList: 60,
  postDetail: 45,
  postComments: 45,
  search: 60,
};

export function stableStringify(value) {
  if (value == null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((v) => stableStringify(v)).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}`;
}

export function hashKeyPart(value) {
  return crypto.createHash('sha1').update(stableStringify(value)).digest('hex');
}

export function buildCacheKey(moduleName, resource, params = {}) {
  return `soco:${moduleName}:${resource}:${hashKeyPart(params)}`;
}

export async function cacheGet(key) {
  const client = await getRedisClient();
  if (!client) return null;
  const raw = await client.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function cacheSet(key, value, ttlSeconds) {
  const client = await getRedisClient();
  if (!client) return;
  await client.set(key, JSON.stringify(value), {
    EX: ttlSeconds,
  });
}

export async function cacheDelByPattern(pattern) {
  const client = await getRedisClient();
  if (!client) return 0;
  const keys = [];
  for await (const key of client.scanIterator({ MATCH: pattern, COUNT: 100 })) {
    keys.push(key);
  }
  if (keys.length === 0) return 0;
  return client.del(keys);
}

export async function getOrSetCache(key, ttlSeconds, loader) {
  const cached = await cacheGet(key);
  if (cached !== null) {
    return { data: cached, hit: true };
  }
  const data = await loader();
  await cacheSet(key, data, ttlSeconds);
  return { data, hit: false };
}
