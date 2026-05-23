'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/theme';
import { AppShell } from '@/components/AppShell';

type Profile = {
  full_name: string | null;
  gender: string | null;
  year_of_birth: number | null;
  home_postcode: string | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/'); return; }
      setEmail(user.email ?? '');
      const { data } = await supabase
        .from('profiles')
        .select('full_name, gender, year_of_birth, home_postcode')
        .eq('id', user.id)
        .maybeSingle();
      setProfile(data);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.replace('/');
  }

  return (
    <AppShell active="dashboard">
      <div className="max-w-2xl mx-auto px-8 py-10">

        <h1 className="font-georgia text-primary text-4xl leading-tight mb-2">My Profile</h1>
        <p className="text-subtext text-sm mb-10">Your account details</p>

        {loading ? (
          <div className="flex justify-center pt-10">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="rounded-2xl bg-white overflow-hidden mb-8 b-card-md">
              <Row label="Name" value={profile?.full_name ?? '—'} />
              <Row label="Email" value={email} />
              <Row label="Gender" value={profile?.gender ?? '—'} />
              <Row label="Year of birth" value={profile?.year_of_birth?.toString() ?? '—'} />
              <Row label="Home postcode" value={profile?.home_postcode ?? '—'} last />
            </div>

            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex items-center justify-center h-11 px-8 rounded-xl border-[1.5px] text-sm font-semibold transition-opacity disabled:opacity-60 hover:opacity-80"
              style={{ borderColor: Colors.error, color: Colors.error }}
            >
              {signingOut ? (
                <span className="w-4 h-4 border-2 border-error border-t-transparent rounded-full animate-spin" />
              ) : 'Sign Out'}
            </button>
          </>
        )}
      </div>
    </AppShell>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      className="flex items-center px-6 py-4"
      style={last ? {} : undefined} className="b-b"
    >
      <p className="text-xs font-medium text-subtext uppercase tracking-wider w-36 shrink-0">{label}</p>
      <p className="text-base text-ink">{value}</p>
    </div>
  );
}
