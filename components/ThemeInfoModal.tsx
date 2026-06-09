'use client';

import { useEffect } from 'react';
import { Database } from '@/lib/database.types';
import { Colors } from '@/constants/theme';

type AdoptTheme = Database['public']['Tables']['adopt_themes']['Row'];

interface ThemeInfoModalProps {
  theme: AdoptTheme | null;
  onClose: () => void;
}

export function ThemeInfoModal({ theme, onClose }: ThemeInfoModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (theme) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [theme, onClose]);

  if (!theme) return null;

  return (
    <div
      className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-background rounded-3xl max-h-[82vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pt-5" />

        {/* Category header */}
        <div
          className="mx-5 rounded-xl px-3.5 py-2 mb-5"
          style={{ backgroundColor: theme.category_colour ?? Colors.secondary }}
        >
          <p className="text-xs text-ink opacity-70">{theme.category}</p>
          <p className="font-georgia text-[22px] text-ink leading-[30px] mt-0.5">{theme.theme}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-4">
          {theme.description && (
            <div className="mb-5">
              <p className="font-georgia text-base text-ink leading-relaxed italic">
                {theme.description}
              </p>
            </div>
          )}

          {theme.third_person_description && (
            <div className="mb-6">
              <p className="text-sm text-ink leading-relaxed">
                {theme.third_person_description}
              </p>
            </div>
          )}
        </div>

        {/* Close */}
        <div className="px-5 pb-5 pt-2">
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center min-h-[50px] rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
