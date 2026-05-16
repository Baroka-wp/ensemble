import rateLimit from 'express-rate-limit';

// §10 — 10 req/min/IP sur /public/scan, mémoire (1 réplique MVP).
export const scanRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'RATE_LIMITED', message: 'Trop de tentatives. Réessayez dans une minute.' },
});
