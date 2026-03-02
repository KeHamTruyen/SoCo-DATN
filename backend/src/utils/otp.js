import crypto from 'crypto';

export function generateOtp(length = 6) {
  const max = Math.pow(10, length);
  const min = Math.pow(10, length - 1);
  return crypto.randomInt(min, max).toString();
}

export function generateSecureToken() {
  return crypto.randomBytes(32).toString('hex');
}
