'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ensureProfile } from '@/lib/profile';
import { Colors } from '@/constants/theme';
import { PrivacyNotice } from '@/components/PrivacyNotice';
import { FormAlert } from '@/components/FormAlert';
import { checkPassword, describeAuthError, MIN_PASSWORD_LENGTH, passwordMeetsRules } from '@/lib/auth-errors';

const GENDER_OPTIONS = ['Woman', 'Man', 'Non-binary', 'Prefer not to say'];

type FieldErrors = Partial<Record<'fullName' | 'email' | 'yearOfBirth' | 'password' | 'confirmPassword', string>>;

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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  const passwordRules = checkPassword(password);

  /** Clear a field's error as soon as the user starts fixing it. */
  function clearFieldError(field: keyof FieldErrors) {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  /**
   * Collects every problem at once. Returning on the first failure meant
   * fixing one field only to discover the next, one submit at a time.
   */
  function validate(): FieldErrors {
    const errors: FieldErrors = {};

    if (!fullName.trim()) errors.fullName = 'Please enter your name.';

    if (!email.trim()) {
      errors.email = 'Please enter your email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'That does not look like a valid email address.';
    }

    if (yearOfBirth) {
      const year = parseInt(yearOfBirth, 10);
      const latest = new Date().getFullYear() - 16;
      if (isNaN(year) || year < 1920 || year > latest) {
        errors.yearOfBirth = `Please enter a year between 1920 and ${latest}.`;
      }
    }

    if (!password) {
      errors.password = 'Please choose a password.';
    } else if (!passwordMeetsRules(password)) {
      errors.password = `Your password needs to be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'These passwords do not match.';
    }

    return errors;
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError('');
      return;
    }

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
      options: {
        data: profileData,
        // Belt-and-braces: the confirmation email currently builds its link from
        // {{ .SiteURL }}/auth/confirm (token_hash flow), so this is not used today.
        // It only takes effect if the template is ever reverted to
        // {{ .ConfirmationURL }}, in which case the link returns to this origin.
        emailRedirectTo: window.location.origin,
      },
    });

    if (signUpError) {
      setLoading(false);

      const info = describeAuthError(signUpError);

      // Supabase already told us which email addresses are taken; treat that
      // like the anti-enumeration case below and send them to sign in.
      if (info.suggestSignIn) {
        setAlreadyRegistered(true);
        return;
      }

      if (info.field) {
        setFieldErrors({ [info.field]: info.message });
      } else {
        setError(info.message);
      }
      return;
    }

    // Anti-enumeration: when the email is already registered AND confirmed,
    // Supabase returns a fake-success with an obfuscated user that has an empty
    // `identities` array (and no session). Detect that so we point the user to
    // sign in, instead of telling them to check an inbox that gets no email.
    if (!data.session && data.user && (data.user.identities?.length ?? 0) === 0) {
      setLoading(false);
      setAlreadyRegistered(true);
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

  if (alreadyRegistered) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-lg w-full text-center">
          <h1 className="font-georgia text-primary text-[26px] mb-4">You may already have an account</h1>
          <p className="text-ink text-base leading-relaxed mb-8">
            An account already exists for <span className="font-semibold">{email}</span>.
            <br /><br />
            Try signing in instead — or reset your password if you&apos;ve forgotten it.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center min-h-[52px] px-8 rounded-2xl bg-primary text-white text-base font-semibold hover:opacity-90 transition-opacity"
            >
              Go to Sign In
            </Link>
            <Link
              href="/forgot-password"
              className="inline-flex items-center justify-center min-h-[52px] px-8 rounded-2xl border-[1.5px] border-primary/25 text-primary text-base font-semibold hover:bg-primary/5 transition-colors"
            >
              Reset password
            </Link>
          </div>
        </div>
      </div>
    );
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

          <Field label="Full name" error={fieldErrors.fullName}>
            <input
              type="text"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); clearFieldError('fullName'); }}
              placeholder="Your full name"
              autoComplete="name"
              aria-invalid={!!fieldErrors.fullName}
              className={fieldErrors.fullName ? inputErrorClass : inputClass}
            />
          </Field>

          <Field label="Email" error={fieldErrors.email}>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); }}
              placeholder="your@email.com"
              autoComplete="email"
              aria-invalid={!!fieldErrors.email}
              className={fieldErrors.email ? inputErrorClass : inputClass}
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

          <Field label="Year of birth" optional error={fieldErrors.yearOfBirth}>
            <input
              type="text"
              inputMode="numeric"
              value={yearOfBirth}
              onChange={(e) => {
                setYearOfBirth(e.target.value.replace(/[^0-9]/g, '').slice(0, 4));
                clearFieldError('yearOfBirth');
              }}
              placeholder="e.g. 1978"
              maxLength={4}
              aria-invalid={!!fieldErrors.yearOfBirth}
              className={fieldErrors.yearOfBirth ? inputErrorClass : inputClass}
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

          <Field label="Password" error={fieldErrors.password}>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); }}
                placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
                autoComplete="new-password"
                aria-invalid={!!fieldErrors.password}
                className={`${fieldErrors.password ? inputErrorClass : inputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((shown) => !shown)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-subtext hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
              </button>
            </div>

            {password && (
              <ul className="mt-2.5 flex flex-col gap-1">
                {passwordRules.map((rule) => (
                  <li
                    key={rule.id}
                    className={`flex items-center gap-1.5 text-xs ${rule.met ? 'text-primary' : 'text-subtext'}`}
                  >
                    <span
                      className={`flex items-center justify-center w-3.5 h-3.5 rounded-full shrink-0 ${
                        rule.met ? 'bg-primary text-white' : 'border border-secondary'
                      }`}
                      aria-hidden="true"
                    >
                      {rule.met && <Check size={9} strokeWidth={3} />}
                    </span>
                    {rule.label}
                    {!rule.required && <span className="text-subtext">— recommended</span>}
                  </li>
                ))}
              </ul>
            )}
          </Field>

          <Field label="Confirm password" error={fieldErrors.confirmPassword}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError('confirmPassword'); }}
              placeholder="Repeat your password"
              autoComplete="new-password"
              aria-invalid={!!fieldErrors.confirmPassword}
              className={fieldErrors.confirmPassword ? inputErrorClass : inputClass}
            />
          </Field>

          {error && <FormAlert>{error}</FormAlert>}

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

function Field({
  label,
  optional,
  error,
  hint,
  children,
}: {
  label: string;
  optional?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-2">
        {label}
        {optional && <span className="ml-1.5 text-xs font-normal text-subtext">(optional)</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-subtext">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1.5 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass =
  'w-full min-h-[52px] bg-white border-[1.5px] border-secondary rounded-xl px-4 text-base text-ink placeholder:text-subtext focus:outline-none focus:border-primary transition-colors';

/** Same shape as `inputClass`, but flags the field that needs attention. */
const inputErrorClass =
  'w-full min-h-[52px] bg-white border-[1.5px] border-error rounded-xl px-4 text-base text-ink placeholder:text-subtext focus:outline-none focus:border-error transition-colors';
