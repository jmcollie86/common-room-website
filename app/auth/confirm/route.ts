import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Device-independent email-link handler.
//
// Confirmation and password-reset emails point here with `token_hash` + `type`
// (see the Supabase email templates). Unlike the older `?code=` / PKCE flow,
// `verifyOtp({ token_hash, type })` needs no browser-stored code verifier, so it
// works even when the user opens the email on a different device or browser than
// the one they registered / requested the reset from.

// Only allow relative, same-app redirect targets (never an external URL).
function safeNext(next: string | null, fallback: string): string {
  if (next && next.startsWith('/') && !next.startsWith('//')) return next;
  return fallback;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  // Recovery links go to the reset-password form; confirmations go to the app.
  const next = safeNext(searchParams.get('next'), type === 'recovery' ? '/reset-password' : '/dashboard');

  // On failure, send the user to the welcome page with a visible error + resend
  // (recovery failures point at the reset flow instead of confirmation resend).
  const failure = () => {
    const flow = type === 'recovery' ? 'recovery' : 'signup';
    return NextResponse.redirect(new URL(`/?authError=link_invalid&flow=${flow}`, origin));
  };

  if (!token_hash || !type) return failure();

  // Redirect response that the session cookies get attached to on success.
  const res = NextResponse.redirect(new URL(next, origin));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    }
  );

  const { error } = await supabase.auth.verifyOtp({ type, token_hash });
  if (error) return failure();

  return res;
}
