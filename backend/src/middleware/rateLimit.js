const buckets = new Map();

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

function pruneBuckets(now) {
  if (buckets.size < 5000) return;
  for (const [key, value] of buckets.entries()) {
    if (value.resetAt <= now) buckets.delete(key);
  }
}

function createRateLimit({ scope, windowMs, max }) {
  return function rateLimit(req, res, next) {
    const now = Date.now();
    pruneBuckets(now);

    const key = [scope, req.method, req.baseUrl || req.path || '/', getClientIp(req)].join(':');
    const entry = buckets.get(key);

    if (!entry || entry.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    entry.count += 1;
    if (entry.count > max) {
      const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    next();
  };
}

export const authRateLimit = createRateLimit({ scope: 'auth', windowMs: 15 * 60 * 1000, max: 10 });
export const standardRateLimit = createRateLimit({ scope: 'api', windowMs: 60 * 1000, max: 120 });
