import { describe, it, expect, vi, beforeEach } from 'vitest';

const { checkRateLimit } = await import('@/lib/rate-limit');

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeSliding(requests: number) {
  let calls = 0;
  return {
    limit: vi.fn(async () => {
      calls++;
      const success = calls <= requests;
      return { success, reset: Date.now() + 60_000 };
    }),
    _calls: () => calls,
  };
}

// ── checkRateLimit ────────────────────────────────────────────────────────────

describe('checkRateLimit', () => {

  beforeEach(() => vi.clearAllMocks());

  it('returns null (pass) when limiter is null', async () => {
    const result = await checkRateLimit(null, 'user-1');
    expect(result).toBeNull();
  });

  it('returns null on first request within limit', async () => {
    const limiter = makeSliding(5);
    const result = await checkRateLimit(limiter as never, 'user-1');
    expect(result).toBeNull();
  });

  it('returns 429 Response when limit exceeded', async () => {
    const limiter = makeSliding(0); // 0 requests allowed → always over limit
    const result = await checkRateLimit(limiter as never, 'user-1');
    expect(result).not.toBeNull();
    expect(result!.status).toBe(429);
  });

  it('429 response includes Retry-After header', async () => {
    const limiter = makeSliding(0);
    const result = await checkRateLimit(limiter as never, 'user-1');
    expect(result!.headers.get('Retry-After')).toBeTruthy();
    expect(Number(result!.headers.get('Retry-After'))).toBeGreaterThan(0);
  });

  it('429 body contains error message', async () => {
    const limiter = makeSliding(0);
    const result = await checkRateLimit(limiter as never, 'user-1');
    const body = await result!.json();
    expect(body.error).toMatch(/too many requests/i);
  });

  it('passes first N requests then blocks the (N+1)th', async () => {
    const limiter = makeSliding(3);
    for (let i = 0; i < 3; i++) {
      expect(await checkRateLimit(limiter as never, 'user-1')).toBeNull();
    }
    const blocked = await checkRateLimit(limiter as never, 'user-1');
    expect(blocked?.status).toBe(429);
  });
});
