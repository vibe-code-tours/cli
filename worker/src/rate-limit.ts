// IP-keyed rolling-window rate limiter backed by Workers KV.
// Window granularity: 1 hour, keyed by floor(ts / 1h).

export interface KVLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
}

export type RateCheck =
  | { allowed: true; remaining: number; count: number }
  | { allowed: false; remaining: 0; count: number; retryAfter: number };

const WINDOW_MS = 60 * 60 * 1000;
const KV_TTL_SECONDS = 2 * 60 * 60; // 2h — survives a window roll-over.

export function bucketKey(ip: string, now = Date.now()): string {
  const bucket = Math.floor(now / WINDOW_MS);
  return `rl:${ip}:${bucket}`;
}

export async function checkRateLimit(
  kv: KVLike,
  ip: string,
  limit: number,
  now = Date.now(),
): Promise<RateCheck> {
  const key = bucketKey(ip, now);
  const raw = await kv.get(key);
  const count = raw ? Number.parseInt(raw, 10) || 0 : 0;
  if (count >= limit) {
    const nextWindow = (Math.floor(now / WINDOW_MS) + 1) * WINDOW_MS;
    return {
      allowed: false,
      remaining: 0,
      count,
      retryAfter: Math.max(1, Math.ceil((nextWindow - now) / 1000)),
    };
  }
  const next = count + 1;
  await kv.put(key, String(next), { expirationTtl: KV_TTL_SECONDS });
  return { allowed: true, remaining: Math.max(0, limit - next), count: next };
}

// Extract the client IP. CF sets `CF-Connecting-IP` always; we fall back to
// X-Forwarded-For first hop, then a literal "unknown" sentinel (still
// rate-limited so the unknown bucket can't be abused infinitely).
export function clientIp(request: Request): string {
  const cf = request.headers.get('CF-Connecting-IP');
  if (cf) return cf;
  const xff = request.headers.get('X-Forwarded-For');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  return 'unknown';
}
