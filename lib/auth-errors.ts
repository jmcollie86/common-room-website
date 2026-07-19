import type { AuthError } from '@supabase/supabase-js';

/**
 * Turns a Supabase AuthError into copy a person can act on.
 *
 * The auth pages used to collapse every failure into one generic sentence,
 * which made a rejected password indistinguishable from a dropped connection.
 * Supabase already says exactly what went wrong — this maps its error codes to
 * our voice, and says which field to fix where we can tell.
 */
export type AuthErrorInfo = {
  /** The sentence to show. Always specific enough to act on. */
  message: string;
  /** Field to attach the message to, when the fault is one input. */
  field?: 'email' | 'password';
  /** Offer to send the confirmation email again. */
  canResendConfirmation?: boolean;
  /** Point the user at sign-in / password reset instead. */
  suggestSignIn?: boolean;
};

/**
 * Supabase reports weak passwords with a `reasons` array rather than prose, so
 * we build the sentence ourselves — listing every rule that failed at once
 * beats making someone discover them one submit at a time.
 */
function describeWeakPassword(reasons: string[] | undefined): string {
  if (!reasons?.length) {
    return 'That password is not strong enough. Try making it longer, and mix in numbers or symbols.';
  }

  const requirements: string[] = [];
  if (reasons.includes('length')) requirements.push('be longer');
  if (reasons.includes('characters')) {
    requirements.push('include a mix of upper and lower case letters, numbers, and symbols');
  }
  if (reasons.includes('pwned')) {
    // This one is not a rule the user can satisfy by editing — it needs a
    // different password entirely, so it gets its own sentence.
    return 'That password has appeared in a known data breach, so it is not safe to use. Please choose a different one.';
  }

  if (!requirements.length) {
    return 'That password is not strong enough. Try making it longer, and mix in numbers or symbols.';
  }

  return `That password needs to ${requirements.join(' and ')}.`;
}

export function describeAuthError(error: AuthError | null | undefined): AuthErrorInfo {
  if (!error) {
    return { message: 'Something went wrong. Please try again.' };
  }

  // `weak_password` carries its detail on a subclass field, not in the message.
  const reasons = (error as AuthError & { reasons?: string[] }).reasons;

  switch (error.code) {
    case 'weak_password':
      return { message: describeWeakPassword(reasons), field: 'password' };

    case 'user_already_exists':
    case 'email_exists':
      return {
        message: 'An account already exists for this email address.',
        field: 'email',
        suggestSignIn: true,
      };

    case 'email_address_invalid':
      return { message: 'That email address does not look valid. Please check it and try again.', field: 'email' };

    case 'email_address_not_authorized':
      return { message: 'We are not able to send email to that address. Please try a different one.', field: 'email' };

    case 'invalid_credentials':
      return { message: 'That email and password do not match an account. Please check both and try again.' };

    case 'email_not_confirmed':
      return {
        message: 'Please confirm your email address first — check your inbox for the link we sent.',
        canResendConfirmation: true,
      };

    case 'user_not_found':
      return { message: 'We could not find an account for that email address.', field: 'email' };

    case 'same_password':
      return { message: 'That is already your current password. Please choose a different one.', field: 'password' };

    case 'over_email_send_rate_limit':
      return { message: 'We have sent a few emails to that address already. Please wait a minute before trying again.' };

    case 'over_request_rate_limit':
      return { message: 'Too many attempts. Please wait a minute and try again.' };

    case 'signup_disabled':
      return { message: 'New sign-ups are closed at the moment. Please get in touch with us.' };

    case 'otp_expired':
      return { message: 'That link has expired. Please request a new one.' };

    case 'session_expired':
    case 'refresh_token_not_found':
      return { message: 'Your session has expired. Please sign in again.' };

    case 'validation_failed':
      return { message: 'Some of those details are not quite right. Please check them and try again.' };
  }

  // No recognised code. A 0 status means the request never reached Supabase,
  // which is a connection problem rather than anything the user got wrong.
  if (error.status === 0 || error.message?.toLowerCase().includes('fetch')) {
    return { message: 'We could not reach the server. Please check your connection and try again.' };
  }

  if (error.status && error.status >= 500) {
    return { message: 'Our sign-in service is having trouble right now. Please try again in a moment.' };
  }

  // Fall back to Supabase's own message: an imperfect sentence the user can act
  // on beats a polished one that tells them nothing.
  return { message: error.message || 'Something went wrong. Please try again.' };
}

/* -------------------------------------------------------------------------- */
/* Password strength, checked in the browser                                  */
/* -------------------------------------------------------------------------- */

export type PasswordRule = {
  id: string;
  label: string;
  met: boolean;
  /** Required to submit, vs. advice that only strengthens the password. */
  required: boolean;
};

/**
 * The only hard rule is length — this project's Supabase instance has no
 * character requirements configured, so anything stricter here would reject
 * passwords the server would happily accept. The rest is shown as advice.
 *
 * If password requirements are ever turned on in the Supabase dashboard
 * (Authentication → Providers → Email), flip the matching rules to
 * `required: true` so the form stops people before a round trip.
 */
export const MIN_PASSWORD_LENGTH = 8;

export function checkPassword(password: string): PasswordRule[] {
  return [
    {
      id: 'length',
      label: `At least ${MIN_PASSWORD_LENGTH} characters`,
      met: password.length >= MIN_PASSWORD_LENGTH,
      required: true,
    },
    {
      id: 'case',
      label: 'Upper and lower case letters',
      met: /[a-z]/.test(password) && /[A-Z]/.test(password),
      required: false,
    },
    {
      id: 'digit-or-symbol',
      label: 'A number or symbol',
      met: /[^a-zA-Z]/.test(password),
      required: false,
    },
  ];
}

/** Whether the form may be submitted — required rules only. */
export function passwordMeetsRules(password: string): boolean {
  return checkPassword(password)
    .filter((rule) => rule.required)
    .every((rule) => rule.met);
}
