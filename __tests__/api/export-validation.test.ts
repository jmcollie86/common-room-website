import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock admin guard to always pass
vi.mock('@/lib/admin-guard', () => ({
  requireAdmin: vi.fn(async () => ({ ok: true, userId: 'admin-1' })),
}));

// Mock admin client to return empty data
vi.mock('@/lib/supabase-admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => ({
            gte: vi.fn(function(this: unknown) { return this; }),
            lte: vi.fn(function(this: unknown) { return this; }),
            then: vi.fn((cb: (v: { data: null }) => void) => Promise.resolve(cb({ data: null }))),
          })),
        })),
      })),
    })),
    auth: { admin: { listUsers: vi.fn(async () => ({ data: { users: [] } })) } },
  })),
}));

const { GET } = await import('@/app/api/admin/export/route');

function makeRequest(params: Record<string, string>) {
  const url = new URL('http://localhost/api/admin/export');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

describe('export route input validation', () => {
  it('rejects unknown type with 400', async () => {
    const res = await GET(makeRequest({ type: 'hacked' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/Invalid type/i);
  });

  it('accepts valid types', async () => {
    for (const type of ['users', 'selections', 'reflections', 'notes']) {
      const res = await GET(makeRequest({ type }));
      expect(res.status).not.toBe(400);
    }
  });

  it('rejects malformed from date with 400', async () => {
    const res = await GET(makeRequest({ type: 'users', from: '24-05-2026' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/Invalid from/i);
  });

  it('rejects malformed to date with 400', async () => {
    const res = await GET(makeRequest({ type: 'users', to: 'yesterday' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/Invalid to/i);
  });

  it('accepts valid YYYY-MM-DD dates', async () => {
    const res = await GET(makeRequest({ type: 'users', from: '2026-01-01', to: '2026-05-24' }));
    expect(res.status).not.toBe(400);
  });
});
