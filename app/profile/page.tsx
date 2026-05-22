'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/theme';

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
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-lg mx-auto w-full px-6 pb-10">

        <div className="flex items-center pt-4 mb-9">
          <Link href="/dashboard" className="inline-flex items-center min-h-[44px] text-primary text-base hover:opacity-70 transition-opacity">
            ← Back
          </Link>
        </div>

        <h1 className="font-georgia text-primary text-[28px] leading-[36px] mb-2">My Profile</h1>
        <p className="text-subtext text-sm mb-9">Your account details</p>

        {loading ? (
          <div className="flex justify-center pt-10">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <Row label="Name" value={profile?.full_name ?? '—'} />
            <Row label="Email" value={email} />
            <Row label="Gender" value={profile?.gender ?? '—'} />
            <Row label="Year of birth" value={profile?.year_of_birth?.toString() ?? '—'} />
            <Row label="Home postcode" value={profile?.home_postcode ?? '—'} />

            <div className="my-8 h-px" style={{ backgroundColor: Colors.secondary + '60' }} />

            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full flex items-center justify-center min-h-[52px] rounded-xl border-[1.5px] text-base font-semibold transition-opacity disabled:opacity-60 hover:opacity-80"
              style={{ borderColor: Colors.error, color: Colors.error }}
            >
              {signingOut ? (
                <span className="w-5 h-5 border-2 border-error border-t-transparent rounded-full animate-spin" />
              ) : 'Sign Out'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-4 border-b" style={{ borderColor: Colors.secondary + '50' }}>
      <p className="text-xs font-medium text-subtext uppercase tracking-wider mb-1">{label}</p>
      <p className="text-base text-ink">{value}</p>
    </div>
  );
}
