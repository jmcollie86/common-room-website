import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

type RateLimiter = Ratelimit | null;

function makeLimiter(requests: number, window: string): RateLimiter {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    // No Redis configured — skip rate limiting (dev / test environments)
    return null;
  }
  return new Ratelimit({
    redis: Redis.fromEnv(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    limiter: Ratelimit.slidingWindow(requests, window as any),
    prefix: '@tcr',
  });
}

// 5 exports per minute per user — export hits Supabase heavily
export const exportLimiter = makeLimiter(5, '60 s');

// 30 stats calls per minute per user — lightweight reads
export const statsLimiter = makeLimiter(30, '60 s');

export async function checkRateLimit(
  limiter: RateLimiter,
  userId: string,
): Promise<Response | null> {
  if (!limiter) return null;

  const { success, reset } = await limiter.limit(userId);
  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
      },
    });
  }
  return null;
}
