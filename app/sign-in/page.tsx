'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ensureProfile } from '@/lib/profile';
import { Colors } from '@/constants/theme';
import { PrivacyNotice } from '@/components/PrivacyNotice';
import { FormAlert } from '@/components/FormAlert';
import { describeAuthError } from '@/lib/auth-errors';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent'>('idle');

  async function handleResendConfirmation() {
    setResendState('sending');
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
    });
    if (error) {
      setResendState('idle');
      setError(describeAuthError(error).message);
    } else {
      setResendState('sent');
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError(!email.trim() ? 'Please enter your email address.' : 'Please enter your password.');
      return;
    }
    setLoading(true);
    setError('');
    setNeedsConfirmation(false);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) {
      setLoading(false);
      const info = describeAuthError(error);
      setError(info.message);
      setNeedsConfirmation(!!info.canResendConfirmation);
    } else {
      // Backfill the profile row for anyone who registered before it was
      // created reliably (no-op once the row exists).
      await ensureProfile();
      setLoading(false);
      router.replace('/dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-background flex">

      {/* Left brand panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[45%] xl:w-[40%] min-h-screen p-12 xl:p-16"
        style={{ backgroundColor: Colors.primary }}
      >
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/tcr-logo.png" alt="The Common Room" width={100} height={100}
            style={{ borderRadius: '50%' }}
          />
        </Link>
        <p className="text-white/70 text-xl font-georgia leading-relaxed">
          A space for reflection,<br />clarity, and purpose.
        </p>
        <p className="text-white/30 text-xs">contact@lifework-lab.com</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 xl:px-24 py-12">

        <div className="lg:hidden mb-10">
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/tcr-logo.png" alt="The Common Room" width={80} height={80}
              style={{ borderRadius: '50%' }}
            />
          </Link>
        </div>

        <Link href="/" className="text-primary text-sm mb-8 inline-flex items-center gap-1 hover:opacity-70 transition-opacity">
          ← Back
        </Link>

        <h1 className="font-georgia text-primary text-3xl xl:text-4xl leading-tight mb-2">Welcome back</h1>
        <p className="text-subtext text-base mb-8">Sign in to continue your reflection</p>

        <form onSubmit={handleSignIn} className="flex flex-col gap-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoComplete="email"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
              className={inputClass}
            />
            <Link href="/forgot-password" className="text-xs text-primary hover:opacity-70 transition-opacity mt-2 inline-block">
              Forgot password?
            </Link>
          </div>

          {error && (
            <FormAlert
              action={
                needsConfirmation && resendState !== 'sent' ? (
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={resendState === 'sending'}
                    className="font-semibold underline underline-offset-2 hover:opacity-70 transition-opacity disabled:opacity-50"
                  >
                    {resendState === 'sending' ? 'Sending…' : 'Send the link again'}
                  </button>
                ) : undefined
              }
            >
              {error}
            </FormAlert>
          )}

          {resendState === 'sent' && (
            <FormAlert tone="success">
              Confirmation link sent — check your inbox at{' '}
              <span className="font-semibold">{email.trim().toLowerCase()}</span>.
            </FormAlert>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center h-12 mt-2 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-70"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-subtext text-sm mt-6 max-w-md">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary hover:opacity-70 transition-opacity">Get started</Link>
        </p>

        <div className="mt-10 max-w-md">
          <PrivacyNotice />
        </div>
      </div>
    </div>
  );
}

const inputClass =
  'w-full h-12 bg-white border-[1.5px] border-secondary rounded-xl px-4 text-sm text-ink placeholder:text-subtext focus:outline-none focus:border-primary transition-colors';
