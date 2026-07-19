'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ensureProfile } from '@/lib/profile';
import { Colors } from '@/constants/theme';

type AuthErrorFlow = 'signup' | 'recovery';

export default function WelcomePage() {
  const router = useRouter();
  // Set when an email link fails (expired, already used, or opened on a device
  // that never held the code verifier). Drives a visible error + resend path,
  // instead of silently dropping the user on the welcome page.
  const [authError, setAuthError] = useState<AuthErrorFlow | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // A failed /auth/confirm redirect lands here with ?authError=…&flow=…
    const errFlag = params.get('authError');
    if (errFlag) {
      const flow = params.get('flow');
      setAuthError(flow === 'recovery' ? 'recovery' : 'signup');
      window.history.replaceState(null, '', '/');
      return;
    }

    // Legacy same-device confirmation links may still arrive with ?code=
    // (new links use /auth/confirm). Surface any failure instead of hiding it.
    const code = params.get('code');
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(async ({ error }) => {
        window.history.replaceState(null, '', '/');
        if (error) {
          setAuthError('signup');
          return;
        }
        // First session after email confirmation — materialise the profile row
        // from the metadata captured at sign-up.
        await ensureProfile();
        router.replace('/dashboard');
      });
      return;
    }

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        // Invalid/expired token — clear session and stay on welcome page
        supabase.auth.signOut();
        return;
      }
      if (session) router.replace('/dashboard');
    });
  }, [router]);

  if (authError) {
    return <AuthErrorView flow={authError} onDismiss={() => setAuthError(null)} />;
  }

  return (
    <div className="min-h-screen bg-background flex">

      {/* Left panel — brand */}
      <div
        className="hidden lg:flex flex-col justify-between w-[45%] xl:w-[40%] min-h-screen p-12 xl:p-16"
        style={{ backgroundColor: Colors.primary }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/tcr-logo.png" alt="The Common Room" width={100} height={100}
          style={{ borderRadius: '50%' }}
        />
        <div>
          <p className="text-white/80 text-2xl font-georgia leading-relaxed mb-6">
            A space for reflection, clarity and purpose.
          </p>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            A companion to the in-person Common Room workshops, designed for participants who have attended at least one session.
          </p>
        </div>
        <p className="text-white/30 text-xs">contact@lifework-lab.com</p>
      </div>

      {/* Right panel — content */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 xl:px-24 py-12 overflow-y-auto">

        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/tcr-logo.png" alt="The Common Room" width={100} height={100}
            style={{ borderRadius: '50%' }}
          />
        </div>

        <h1 className="font-georgia text-primary text-3xl xl:text-4xl leading-tight mb-8">
          Welcome
        </h1>

        <div className="flex flex-col gap-4 max-w-md mb-10">
          <Link
            href="/register"
            className="flex items-center justify-center h-12 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
          <Link
            href="/sign-in"
            className="flex items-center justify-center h-12 rounded-xl text-primary text-sm border-[1.5px] border-primary/25 hover:bg-primary/5 transition-colors"
          >
            I already have an account
          </Link>
        </div>

        <div className="flex flex-col gap-4 max-w-md">
          <div className="rounded-2xl p-5" style={{ backgroundColor: '#E8EFF1' }}>
            <p className="font-georgia text-primary text-2xl leading-snug mb-4">About this app</p>
            <p className="text-ink text-sm leading-relaxed">
              This app helps you reflect on what matters most, record your selected Purpose Drivers,
              and revisit your personal Points of Reflection between Common Room sessions.
              <br /><br />
              The Common Room uses AI to generate personalised Points of Reflection based on the
              themes you choose. These are offered as prompts for your own thinking — not advice,
              diagnosis or instruction.
              <br /><br />
              You are always the expert on your own life.
              <br /><br />
              Please use this app only if you have attended at least one in-person workshop at a
              Common Room hub.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

// Shown when an email link fails. For sign-up confirmations it offers to resend
// the link; for password resets it points back to the reset request page.
function AuthErrorView({ flow, onDismiss }: { flow: AuthErrorFlow; onDismiss: () => void }) {
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState('');

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setResending(true);
    setError('');
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
    });
    setResending(false);
    if (error) {
      setError("Let's try that again — something went wrong.");
    } else {
      setResent(true);
    }
  }

  return (
    <div className="min-h-screen bg-background flex">

      {/* Left panel — brand */}
      <div
        className="hidden lg:flex flex-col justify-between w-[45%] xl:w-[40%] min-h-screen p-12 xl:p-16"
        style={{ backgroundColor: Colors.primary }}
      >
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/tcr-logo.png" alt="The Common Room" width={100} height={100} style={{ borderRadius: '50%' }} />
        </Link>
        <p className="text-white/70 text-xl font-georgia leading-relaxed">
          A space for reflection,<br />clarity, and purpose.
        </p>
        <p className="text-white/30 text-xs">contact@lifework-lab.com</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 xl:px-24 py-12">

        <div className="lg:hidden mb-10">
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/tcr-logo.png" alt="The Common Room" width={80} height={80} style={{ borderRadius: '50%' }} />
          </Link>
        </div>

        {flow === 'recovery' ? (
          <div className="max-w-md">
            <h1 className="font-georgia text-primary text-3xl xl:text-4xl leading-tight mb-2">Reset link expired</h1>
            <p className="text-subtext text-base mb-8">
              This password-reset link is invalid or has already been used. Request a fresh one and it&apos;ll work on any device.
            </p>
            <Link
              href="/forgot-password"
              className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Request a new reset link
            </Link>
            <button onClick={onDismiss} className="block text-primary text-sm mt-6 hover:opacity-70 transition-opacity">
              ← Back to welcome
            </button>
          </div>
        ) : resent ? (
          <div className="max-w-md">
            <h1 className="font-georgia text-primary text-3xl xl:text-4xl leading-tight mb-2">Check your inbox</h1>
            <p className="text-subtext text-base mb-6">
              If an account exists for <span className="text-ink font-medium">{email}</span> that still needs confirming,
              a new link is on its way. Open it on any device to activate your account.
            </p>
            <Link href="/sign-in" className="text-primary text-sm hover:opacity-70 transition-opacity">
              Go to sign in
            </Link>
          </div>
        ) : (
          <div className="max-w-md">
            <h1 className="font-georgia text-primary text-3xl xl:text-4xl leading-tight mb-2">Confirmation link didn&apos;t work</h1>
            <p className="text-subtext text-base mb-8">
              This link is invalid or has expired. Enter your email and we&apos;ll send a new confirmation link —
              it&apos;ll work whichever device you open it on.
            </p>

            <form onSubmit={handleResend} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  autoComplete="email"
                  className="w-full h-12 bg-white border-[1.5px] border-secondary rounded-xl px-4 text-sm text-ink placeholder:text-subtext focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {error && <p className="text-error text-sm">{error}</p>}

              <button
                type="submit"
                disabled={resending}
                className="flex items-center justify-center h-12 mt-2 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-70"
              >
                {resending ? 'Sending…' : 'Resend confirmation link'}
              </button>
            </form>

            <div className="flex items-center gap-4 mt-6">
              <Link href="/sign-in" className="text-primary text-sm hover:opacity-70 transition-opacity">
                Sign in
              </Link>
              <button onClick={onDismiss} className="text-subtext text-sm hover:opacity-70 transition-opacity">
                Back to welcome
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
