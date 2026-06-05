'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/theme';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      setError('This reset link is invalid or has already been used. Please request a new one.');
      return;
    }
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        setError('This reset link has expired or is invalid. Please request a new one.');
      } else {
        setReady(true);
      }
    });
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password || !confirm) {
      setError('Please fill in both fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError("Let's try that again — something went wrong.");
    } else {
      setDone(true);
      setTimeout(() => router.replace('/sign-in'), 3000);
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

        {done ? (
          <>
            <h1 className="font-georgia text-primary text-3xl xl:text-4xl leading-tight mb-2">Password updated</h1>
            <p className="text-subtext text-base max-w-md">
              Your password has been changed. Redirecting you to sign in…
            </p>
          </>
        ) : error && !ready ? (
          <>
            <h1 className="font-georgia text-primary text-3xl xl:text-4xl leading-tight mb-2">Link expired</h1>
            <p className="text-subtext text-base mb-6 max-w-md">{error}</p>
            <Link
              href="/forgot-password"
              className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity max-w-md"
            >
              Request a new link
            </Link>
          </>
        ) : (
          <>
            <Link href="/sign-in" className="text-primary text-sm mb-8 inline-flex items-center gap-1 hover:opacity-70 transition-opacity">
              ← Back to sign in
            </Link>

            <h1 className="font-georgia text-primary text-3xl xl:text-4xl leading-tight mb-2">Set a new password</h1>
            <p className="text-subtext text-base mb-8">Choose a new password for your account</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-ink mb-2">New password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  className={inputClass}
                  disabled={!ready}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Confirm new password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat your new password"
                  autoComplete="new-password"
                  className={inputClass}
                  disabled={!ready}
                />
              </div>

              {error && ready && <p className="text-error text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading || !ready}
                className="flex items-center justify-center h-12 mt-2 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-70"
              >
                {loading ? 'Updating…' : 'Update password'}
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
