'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/theme';
import { FormAlert } from '@/components/FormAlert';
import { describeAuthError, MIN_PASSWORD_LENGTH, passwordMeetsRules } from '@/lib/auth-errors';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const code = searchParams.get('code');

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true);
        return;
      }
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
    });
  }, [searchParams, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password || !confirm) {
      setError('Please fill in both fields.');
      return;
    }
    if (!passwordMeetsRules(password)) {
      setError(`Your password needs to be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setError('These passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(describeAuthError(error).message);
    } else {
      setDone(true);
      let count = 3;
      const interval = setInterval(() => {
        count -= 1;
        setCountdown(count);
        if (count === 0) {
          clearInterval(interval);
          router.replace('/sign-in');
        }
      }, 1000);
    }
  }

  return (
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
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle size={32} style={{ color: Colors.primary }} strokeWidth={1.5} />
            <h1 className="font-georgia text-primary text-3xl xl:text-4xl leading-tight">Password updated</h1>
          </div>
          <p className="text-subtext text-base">
            Signing you in{' '}
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-semibold">
              {countdown}
            </span>
          </p>
        </div>
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
                placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
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

            {error && ready && <FormAlert>{error}</FormAlert>}

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
  );
}

export default function ResetPasswordPage() {
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

      <Suspense fallback={<div className="flex-1" />}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}

const inputClass =
  'w-full h-12 bg-white border-[1.5px] border-secondary rounded-xl px-4 text-sm text-ink placeholder:text-subtext focus:outline-none focus:border-primary transition-colors';
