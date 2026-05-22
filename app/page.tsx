'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/dashboard');
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 max-w-lg mx-auto w-full px-6 pb-10 pt-20">

        {/* Wordmark */}
        <div className="flex flex-col items-center mb-12">
          <Image src="/logo.png" alt="The Common Room" width={260} height={55} priority />
          <p className="text-subtext text-center text-base mt-4 leading-relaxed">
            A space for reflection, clarity, and purpose
          </p>
        </div>

        {/* AI Disclaimer */}
        <div className="rounded-2xl p-5 mb-10" style={{ backgroundColor: '#E8EFF1' }}>
          <p className="text-primary text-sm font-semibold mb-2">A note about this app</p>
          <p className="text-ink text-sm leading-relaxed">
            The Common Room uses AI to generate personalised Points of Reflection based on the
            themes you choose. These are offered as prompts for your own thinking — not advice,
            diagnosis, or instruction.
            <br /><br />
            You are always the expert on your own life.
          </p>
        </div>

        {/* About */}
        <div className="rounded-2xl p-5 mb-10" style={{ backgroundColor: '#FDF6E3' }}>
          <p className="text-primary text-sm font-semibold mb-2">About this app</p>
          <p className="text-ink text-sm leading-relaxed">
            This app is a companion to the in-person Common Room workshops and The Purpose
            Workbook. It is designed to help members reflect on what matters most, record their
            selected purpose themes, and revisit their personal points of reflection between
            sessions.
            <br /><br />
            Please use this app only if you have attended at least one in-person workshop at a
            Common Room hub. It is not intended to replace the hosted workshop experience,
            facilitated conversations, peer support or workbook journey.
            <br /><br />
            If your local authority, organisation or community is interested in creating a Common
            Room, please email:{' '}
            <span className="font-semibold">contact@lifework-lab.com</span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/register"
            className="flex items-center justify-center rounded-2xl bg-primary text-white text-base font-semibold min-h-[52px] hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
          <Link
            href="/sign-in"
            className="flex items-center justify-center rounded-2xl text-primary text-base min-h-[52px] border-[1.5px] border-primary/25 hover:bg-primary/5 transition-colors"
          >
            I already have an account
          </Link>
        </div>

      </div>
    </div>
  );
}
