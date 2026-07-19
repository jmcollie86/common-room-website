'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/theme';
import { FormAlert } from '@/components/FormAlert';
import { describeAuthError } from '@/lib/auth-errors';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      setError(describeAuthError(error).message);
    } else {
      setSent(true);
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

        <Link href="/sign-in" className="text-primary text-sm mb-8 inline-flex items-center gap-1 hover:opacity-70 transition-opacity">
          ← Back to sign in
        </Link>

        {sent ? (
          <>
            <h1 className="font-georgia text-primary text-3xl xl:text-4xl leading-tight mb-2">Check your inbox</h1>
            <p className="text-subtext text-base mb-6 max-w-md">
              If an account exists for <span className="text-ink font-medium">{email}</span>, you&apos;ll receive a reset link shortly.
            </p>
            <p className="text-subtext text-sm max-w-md">
              Didn&apos;t receive it? Check your spam folder, or{' '}
              <button
                onClick={() => setSent(false)}
                className="text-primary hover:opacity-70 transition-opacity"
              >
                try again
              </button>.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-georgia text-primary text-3xl xl:text-4xl leading-tight mb-2">Reset your password</h1>
            <p className="text-subtext text-base mb-8">Enter your email and we&apos;ll send you a reset link</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
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

              {error && <FormAlert>{error}</FormAlert>}

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center h-12 mt-2 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-70"
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

const inputClass =
  'w-full h-12 bg-white border-[1.5px] border-secondary rounded-xl px-4 text-sm text-ink placeholder:text-subtext focus:outline-none focus:border-primary transition-colors';
