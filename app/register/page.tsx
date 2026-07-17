'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ensureProfile } from '@/lib/profile';
import { Colors } from '@/constants/theme';
import { PrivacyNotice } from '@/components/PrivacyNotice';

const GENDER_OPTIONS = ['Woman', 'Man', 'Non-binary', 'Prefer not to say'];

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('');
  const [yearOfBirth, setYearOfBirth] = useState('');
  const [postcode, setPostcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  function validate(): string | null {
    if (!fullName.trim()) return 'Please enter your name.';
    if (!email.trim()) return 'Please enter your email.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Please enter a valid email address.';
    if (yearOfBirth) {
      const year = parseInt(yearOfBirth, 10);
      if (isNaN(year) || year < 1920 || year > new Date().getFullYear() - 16) {
        return 'Please enter a valid year of birth.';
      }
    }
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError('');

    const profileData = {
      full_name: fullName.trim(),
      gender: gender || null,
      year_of_birth: yearOfBirth ? parseInt(yearOfBirth, 10) : null,
      home_postcode: postcode.trim() ? postcode.trim().toUpperCase() : null,
    };

    // Stash the profile fields in auth user_metadata. With email confirmation
    // on, signUp returns no session, so a direct `profiles` write here would be
    // rejected by RLS. The row is created from this metadata once the user has
    // a session (see ensureProfile, called after email confirmation / sign-in).
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: profileData },
    });

    if (signUpError) {
      setLoading(false);
      setError("Let's try that again — we couldn't create your account.");
      return;
    }

    // If confirmation is off, we already have a session — create the row now.
    if (data.session) {
      await ensureProfile();
    }

    setLoading(false);

    if (!data.session) {
      setEmailSent(true);
    } else {
      router.replace('/dashboard');
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-lg w-full text-center">
          <h1 className="font-georgia text-primary text-[26px] mb-4">Check your inbox</h1>
          <p className="text-ink text-base leading-relaxed mb-8">
            We&apos;ve sent a confirmation link to <span className="font-semibold">{email}</span>.
            <br /><br />
            Open it to activate your account, then come back and sign in.
          </p>
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center min-h-[52px] px-8 rounded-2xl bg-primary text-white text-base font-semibold hover:opacity-90 transition-opacity"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">

      {/* Left brand panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[45%] xl:w-[40%] min-h-screen p-12 xl:p-16 shrink-0"
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
      <div className="flex-1 overflow-y-auto px-8 sm:px-16 xl:px-24 py-12">

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

        <h1 className="font-georgia text-primary text-3xl xl:text-4xl leading-tight mb-2">Create your account</h1>
        <p className="text-subtext text-base mb-8">Just a few details to get you started</p>

        <form onSubmit={handleRegister} className="flex flex-col gap-5 max-w-md">

          <Field label="Full name">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              autoComplete="name"
              className={inputClass}
            />
          </Field>

          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoComplete="email"
              className={inputClass}
            />
          </Field>

          <Field label="Gender" optional>
            <div className="flex flex-wrap gap-2">
              {GENDER_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setGender(option)}
                  className={`min-h-[44px] px-4 rounded-full border-[1.5px] text-sm transition-colors ${
                    gender === option
                      ? 'bg-primary border-primary text-white font-semibold'
                      : 'bg-white border-secondary text-ink hover:border-primary/50'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Year of birth" optional>
            <input
              type="text"
              inputMode="numeric"
              value={yearOfBirth}
              onChange={(e) => setYearOfBirth(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
              placeholder="e.g. 1978"
              maxLength={4}
              className={inputClass}
            />
          </Field>

          <Field label="Home postcode" optional>
            <input
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value.toUpperCase())}
              placeholder="e.g. SW1A 1AA"
              className={inputClass}
            />
          </Field>

          <Field label="Password">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              className={inputClass}
            />
          </Field>

          <Field label="Confirm password">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              autoComplete="new-password"
              className={inputClass}
            />
          </Field>

          {error && <p className="text-error text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center h-12 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-70"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-subtext text-sm mt-5 max-w-md">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-primary hover:opacity-70 transition-opacity">Sign in</Link>
        </p>

        <div className="mt-10 max-w-md">
          <PrivacyNotice />
        </div>

      </div>
    </div>
  );
}

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-2">
        {label}
        {optional && <span className="ml-1.5 text-xs font-normal text-subtext">(optional)</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full min-h-[52px] bg-white border-[1.5px] border-secondary rounded-xl px-4 text-base text-ink placeholder:text-subtext focus:outline-none focus:border-primary transition-colors';
