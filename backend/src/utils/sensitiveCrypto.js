import crypto from 'crypto';

const PREFIX = 'v1';
const PLAIN_PREFIX = 'plain:';

function getKeyBuffer() {
  const raw = process.env.SENSITIVE_DATA_KEY;
  if (!raw || !raw.trim()) return null;
  const trimmed = raw.trim();
  // 32-byte key as hex (64 chars) or base64
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    return Buffer.from(trimmed, 'hex');
  }
  try {
    const buf = Buffer.from(trimmed, 'base64');
    if (buf.length === 32) return buf;
  } catch {
    /* ignore */
  }
  return crypto.createHash('sha256').update(trimmed).digest();
}

/**
 * Encrypt nullable string for DB storage (AES-256-GCM).
 * Without SENSITIVE_DATA_KEY in production, throws. In non-production, stores plain: prefix (dev only).
 */
export function encryptSensitive(plaintext) {
  if (plaintext == null || plaintext === '') return null;
  const key = getKeyBuffer();
  if (!key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SENSITIVE_DATA_KEY is required in production');
    }
    console.warn('[sensitiveCrypto] SENSITIVE_DATA_KEY missing — storing plaintext with plain: prefix (dev only)');
    return `${PLAIN_PREFIX}${String(plaintext)}`;
  }
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  const payload = Buffer.concat([iv, tag, enc]);
  return `${PREFIX}:${payload.toString('base64')}`;
}

export function decryptSensitive(stored) {
  if (stored == null || stored === '') return null;
  if (typeof stored === 'string' && stored.startsWith(PLAIN_PREFIX)) {
    return stored.slice(PLAIN_PREFIX.length);
  }
  if (typeof stored !== 'string' || !stored.startsWith(`${PREFIX}:`)) {
    // Legacy DB plaintext
    return stored;
  }
  const key = getKeyBuffer();
  if (!key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SENSITIVE_DATA_KEY is required to decrypt');
    }
    return stored;
  }
  const b64 = stored.slice(PREFIX.length + 1);
  const buf = Buffer.from(b64, 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const data = buf.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}

export function maskAccountOrId(value) {
  if (value == null || value === '') return null;
  const s = String(value).replace(/\s/g, '');
  if (s.length <= 4) return '****';
  return `${s.slice(0, 2)}****${s.slice(-4)}`;
}
