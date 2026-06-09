'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/theme';

const TIMEOUT_MS = 30 * 60 * 1000;   // 30 minutes
const WARNING_MS = 28 * 60 * 1000;   // warn at 28 minutes

export function InactivityGuard() {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const isAuthenticatedRef = useRef<boolean>(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const signOut = async () => {
      if (!isAuthenticatedRef.current) return;
      clearTimers();
      setShowWarning(false);
      await supabase.auth.signOut();
      router.replace('/sign-in');
    };

    const clearTimers = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    };

    const resetTimer = () => {
      lastActivityRef.current = Date.now();
      clearTimers();
      setShowWarning(false);
      if (isAuthenticatedRef.current) {
        warningTimerRef.current = setTimeout(() => setShowWarning(true), WARNING_MS);
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
        // Tab hidden — pause timers, timestamp records when activity last happened
        clearTimers();
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
        clearTimers();
        setShowWarning(false);
      }
    });

    // Seed initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      isAuthenticatedRef.current = !!session;
      if (session) resetTimer();
    });

    return () => {
      clearTimers();
      events.forEach((e) => document.removeEventListener(e, resetTimer));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  if (!showWarning) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full px-8 py-8 text-center">
        <h2
          className="font-georgia text-2xl mb-3"
          style={{ color: Colors.primary }}
        >
          Still there?
        </h2>
        <p className="text-base leading-relaxed mb-6" style={{ color: Colors.text }}>
          You&apos;ll be signed out in 2 minutes due to inactivity. Any unsaved changes will be lost.
        </p>
        <button
          onClick={() => setShowWarning(false)}
          className="w-full h-12 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          style={{ backgroundColor: Colors.primary }}
        >
          Stay signed in
        </button>
      </div>
    </div>
  );
}
