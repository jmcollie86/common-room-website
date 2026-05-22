'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    setLoading(false);
    if (error) {
      setError("Let's try that again — please check your email and password.");
    } else {
      router.replace('/dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 max-w-lg mx-auto w-full px-6 pb-10 pt-16">

        <Link href="/" className="inline-flex items-center text-primary text-base min-h-[44px] mb-8 hover:opacity-70 transition-opacity">
          ← Back
        </Link>

        <h1 className="font-georgia text-primary text-[30px] leading-[38px] mb-2">Welcome back</h1>
        <p className="text-subtext text-base mb-9">Sign in to continue your reflection</p>

        <form onSubmit={handleSignIn} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoComplete="email"
              className="w-full min-h-[52px] bg-white border-[1.5px] border-secondary rounded-xl px-4 text-base text-ink placeholder:text-subtext focus:outline-none focus:border-primary transition-colors"
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
              className="w-full min-h-[52px] bg-white border-[1.5px] border-secondary rounded-xl px-4 text-base text-ink placeholder:text-subtext focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {error && <p className="text-error text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center min-h-[52px] mt-4 rounded-2xl bg-primary text-white text-base font-semibold hover:opacity-90 transition-opacity disabled:opacity-70"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="flex justify-center mt-5">
          <Link href="/register" className="text-subtext text-sm hover:text-primary transition-colors">
            Don&apos;t have an account? <span className="text-primary">Get started</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
