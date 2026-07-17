import { supabase } from './supabase';

/**
 * Ensures the signed-in user has a row in `profiles`.
 *
 * Registration data is stashed in auth user_metadata at sign-up time (which
 * works before the email is confirmed and no session exists yet). This copies
 * it into `profiles` the first time the user has a real session — e.g. after
 * clicking the email-confirmation link, or on their next sign-in. It only
 * inserts when the row is missing, so it never clobbers later profile edits.
 *
 * Must be called with an authenticated session so the insert passes RLS.
 */
export async function ensureProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();
  if (existing) return;

  const m = user.user_metadata ?? {};
  await supabase.from('profiles').insert({
    id: user.id,
    full_name: typeof m.full_name === 'string' ? m.full_name : null,
    gender: typeof m.gender === 'string' ? m.gender : null,
    year_of_birth: typeof m.year_of_birth === 'number' ? m.year_of_birth : null,
    home_postcode: typeof m.home_postcode === 'string' ? m.home_postcode : null,
  });
}
