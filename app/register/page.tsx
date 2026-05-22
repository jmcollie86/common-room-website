'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

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
    if (!gender) return 'Please select a gender option.';
    const year = parseInt(yearOfBirth, 10);
    if (!yearOfBirth || isNaN(year) || year < 1920 || year > new Date().getFullYear() - 16) {
      return 'Please enter a valid year of birth.';
    }
    if (!postcode.trim()) return 'Please enter your home postcode.';
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

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });

    if (signUpError) {
      setLoading(false);
      setError("Let's try that again — we couldn't create your account.");
      return;
    }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName.trim(),
        gender,
        year_of_birth: parseInt(yearOfBirth, 10),
        home_postcode: postcode.trim().toUpperCase(),
      });
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
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 max-w-lg mx-auto w-full px-6 pb-12 pt-16">

        <Link href="/" className="inline-flex items-center text-primary text-base min-h-[44px] mb-7 hover:opacity-70 transition-opacity">
          ← Back
        </Link>

        <h1 className="font-georgia text-primary text-[30px] leading-[38px] mb-2">Create your account</h1>
        <p className="text-subtext text-base mb-8">Just a few details to get you started</p>

        <form onSubmit={handleRegister} className="flex flex-col gap-5">

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

          <Field label="Gender">
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

          <Field label="Year of birth">
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

          <Field label="Home postcode">
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
            className="flex items-center justify-center min-h-[52px] rounded-2xl bg-primary text-white text-base font-semibold hover:opacity-90 transition-opacity disabled:opacity-70"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div className="flex justify-center mt-4">
          <Link href="/sign-in" className="text-subtext text-sm hover:text-primary transition-colors">
            Already have an account? <span className="text-primary">Sign in</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-2">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full min-h-[52px] bg-white border-[1.5px] border-secondary rounded-xl px-4 text-base text-ink placeholder:text-subtext focus:outline-none focus:border-primary transition-colors';
