'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/theme';

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/dashboard');
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex">

      {/* Left panel — brand */}
      <div
        className="hidden lg:flex flex-col justify-between w-[45%] xl:w-[40%] min-h-screen p-12 xl:p-16"
        style={{ backgroundColor: Colors.primary }}
      >
        <Image src="/logo.png" alt="The Common Room" width={200} height={43} priority
          style={{ filter: 'brightness(0) invert(1)', opacity: '0.9' }}
        />
        <div>
          <p className="text-white/80 text-2xl font-georgia leading-relaxed mb-6">
            A space for reflection,<br />clarity, and purpose.
          </p>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            A companion to the in-person Common Room workshops. For participants who have attended at least one session.
          </p>
        </div>
        <p className="text-white/30 text-xs">contact@lifework-lab.com</p>
      </div>

      {/* Right panel — content */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 xl:px-24 py-12 overflow-y-auto">

        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          <Image src="/logo.png" alt="The Common Room" width={200} height={43} priority />
        </div>

        <h1 className="font-georgia text-primary text-3xl xl:text-4xl leading-tight mb-8">
          Welcome
        </h1>

        <div className="flex flex-col gap-4 max-w-md mb-10">
          <Link
            href="/register"
            className="flex items-center justify-center h-12 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
          <Link
            href="/sign-in"
            className="flex items-center justify-center h-12 rounded-xl text-primary text-sm border-[1.5px] border-primary/25 hover:bg-primary/5 transition-colors"
          >
            I already have an account
          </Link>
        </div>

        <div className="flex flex-col gap-4 max-w-md">
          <div className="rounded-2xl p-5" style={{ backgroundColor: '#E8EFF1' }}>
            <p className="text-primary text-sm font-semibold mb-2">A note about this app</p>
            <p className="text-ink text-sm leading-relaxed">
              The Common Room uses AI to generate personalised Points of Reflection based on the
              themes you choose. These are offered as prompts for your own thinking — not advice,
              diagnosis, or instruction.
              <br /><br />
              You are always the expert on your own life.
            </p>
          </div>

          <div className="rounded-2xl p-5" style={{ backgroundColor: '#FDF6E3' }}>
            <p className="text-primary text-sm font-semibold mb-2">About this app</p>
            <p className="text-ink text-sm leading-relaxed">
              This app is designed to help members reflect on what matters most, record their
              selected purpose themes, and revisit their personal points of reflection between
              sessions.
              <br /><br />
              Please use this app only if you have attended at least one in-person workshop at a
              Common Room hub.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
