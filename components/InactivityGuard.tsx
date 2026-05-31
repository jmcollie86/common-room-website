'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export function InactivityGuard() {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const isAuthenticatedRef = useRef<boolean>(false);

  useEffect(() => {
    const signOut = async () => {
      if (!isAuthenticatedRef.current) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      await supabase.auth.signOut();
      router.replace('/sign-in');
    };

    const resetTimer = () => {
      lastActivityRef.current = Date.now();
      if (timerRef.current) clearTimeout(timerRef.current);
      if (isAuthenticatedRef.current) {
        timerRef.current = setTimeout(signOut, TIMEOUT_MS);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (Date.now() - lastActivityRef.current >= TIMEOUT_MS) {
          signOut();
        } else {
          resetTimer();
        }
      } else {
        // Tab hidden — pause timer, timestamp records when activity last happened
        if (timerRef.current) clearTimeout(timerRef.current);
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'] as const;
    events.forEach((e) => document.addEventListener(e, resetTimer, { passive: true }));
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Track auth state to only run the timer when logged in
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      isAuthenticatedRef.current = !!session;
      if (session) {
        resetTimer();
      } else {
        if (timerRef.current) clearTimeout(timerRef.current);
      }
    });

    // Seed initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      isAuthenticatedRef.current = !!session;
      if (session) resetTimer();
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((e) => document.removeEventListener(e, resetTimer));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      subscription.unsubscribe();
    };
  }, [router]);

  return null;
}
