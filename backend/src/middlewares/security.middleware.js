import rateLimit from 'express-rate-limit';

const buildRateLimitMessage = (message) => ({
  success: false,
  message
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: buildRateLimitMessage('Too many requests, please try again later')
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: buildRateLimitMessage('Too many authentication attempts, please try again later')
});