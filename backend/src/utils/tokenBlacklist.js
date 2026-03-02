/**
 * In-memory JWT blacklist.
 * Tokens are auto-removed after their TTL to prevent memory leaks.
 * In production, replace with Redis for multi-instance support.
 */
const blacklisted = new Set();

const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function blacklistToken(token) {
  blacklisted.add(token);
  setTimeout(() => blacklisted.delete(token), DEFAULT_TTL_MS);
}

export function isTokenBlacklisted(token) {
  return blacklisted.has(token);
}
