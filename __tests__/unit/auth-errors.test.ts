import { describe, it, expect } from 'vitest';
import type { AuthError } from '@supabase/supabase-js';
import { checkPassword, describeAuthError, passwordMeetsRules } from '@/lib/auth-errors';

/** Minimal stand-in for a Supabase AuthError — only the fields we read. */
function authError(fields: { code?: string; message?: string; status?: number; reasons?: string[] }): AuthError {
  return {
    name: 'AuthApiError',
    message: fields.message ?? 'error',
    status: fields.status ?? 400,
    code: fields.code,
    reasons: fields.reasons,
  } as unknown as AuthError;
}

describe('describeAuthError', () => {
  it('names the specific reason a password was rejected', () => {
    const info = describeAuthError(authError({ code: 'weak_password', reasons: ['characters'] }));
    expect(info.message).toContain('numbers, and symbols');
    expect(info.field).toBe('password');
  });

  it('treats a breached password as needing a different one, not a longer one', () => {
    const info = describeAuthError(authError({ code: 'weak_password', reasons: ['pwned'] }));
    expect(info.message).toContain('data breach');
    expect(info.message).not.toContain('longer');
  });

  it('lists every failed rule at once', () => {
    const info = describeAuthError(authError({ code: 'weak_password', reasons: ['length', 'characters'] }));
    expect(info.message).toContain('be longer');
    expect(info.message).toContain('and include');
  });

  it('routes an existing account to sign in rather than showing an error', () => {
    const info = describeAuthError(authError({ code: 'user_already_exists' }));
    expect(info.suggestSignIn).toBe(true);
    expect(info.field).toBe('email');
  });

  it('offers to resend when the email was never confirmed', () => {
    const info = describeAuthError(authError({ code: 'email_not_confirmed' }));
    expect(info.canResendConfirmation).toBe(true);
  });

  it('distinguishes rate limiting from a bad password', () => {
    const info = describeAuthError(authError({ code: 'over_email_send_rate_limit' }));
    expect(info.message).toMatch(/wait a minute/i);
    expect(info.field).toBeUndefined();
  });

  it('reports an unreachable server as a connection problem', () => {
    const info = describeAuthError(authError({ status: 0, message: 'Failed to fetch' }));
    expect(info.message).toMatch(/connection/i);
  });

  it('reports a 5xx as our problem, not the user\'s', () => {
    const info = describeAuthError(authError({ status: 503, message: 'upstream' }));
    expect(info.message).toMatch(/having trouble/i);
  });

  it('falls back to the raw message rather than swallowing it', () => {
    const info = describeAuthError(authError({ code: 'something_new', message: 'Signups require an invite' }));
    expect(info.message).toBe('Signups require an invite');
  });

  it('handles a null error without throwing', () => {
    expect(describeAuthError(null).message).toBeTruthy();
  });
});

describe('checkPassword', () => {
  it('marks only length as required, so valid passwords are not blocked', () => {
    const required = checkPassword('anything').filter((rule) => rule.required);
    expect(required).toHaveLength(1);
    expect(required[0].id).toBe('length');
  });

  it('accepts a long all-letters passphrase', () => {
    // The password from the original bug report: 16 chars, no digits or
    // symbols. No character policy is configured server-side, so the form
    // must not reject it.
    expect(passwordMeetsRules('Jesurfsurlavague')).toBe(true);
  });

  it('rejects a password below the minimum length', () => {
    expect(passwordMeetsRules('Short1!')).toBe(false);
  });

  it('flags recommendations without making them blocking', () => {
    const rules = checkPassword('alllowercaseletters');
    expect(rules.find((r) => r.id === 'case')?.met).toBe(false);
    expect(rules.find((r) => r.id === 'digit-or-symbol')?.met).toBe(false);
    expect(passwordMeetsRules('alllowercaseletters')).toBe(true);
  });
});
