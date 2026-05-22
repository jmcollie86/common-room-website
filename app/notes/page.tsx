'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { fetchCurrentDraft, fetchSubmittedNotes, saveDraft, submitNote } from '@/lib/api';
import { Colors } from '@/constants/theme';
import { AppShell } from '@/components/AppShell';
import { Database } from '@/lib/database.types';

type UserNote = Database['public']['Tables']['user_notes']['Row'];

const MAX_WORDS = 1000;
const WARN_WORDS = 900;

function countWords(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function PastNote({ note }: { note: UserNote }) {
  const [expanded, setExpanded] = useState(false);

  function handleShare() {
    if (navigator.share) {
      navigator.share({ text: note.content ?? '', title: 'My Note — The Common Room' }).catch(() => {});
    } else {
      navigator.clipboard.writeText(note.content ?? '');
    }
  }

  return (
    <div className="rounded-xl border bg-white mb-2.5 overflow-hidden" style={{ borderColor: Colors.secondary + '60' }}>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 min-h-[44px] hover:bg-gray-50 transition-colors text-left"
      >
        <span className="text-sm text-ink font-medium">{formatDate(note.submitted_at!)}</span>
        <span className="text-xs text-subtext">{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div className="px-4 pb-4">
          <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{note.content}</p>
          <button
            onClick={handleShare}
            className="mt-3 text-xs text-primary hover:opacity-70 transition-opacity"
          >
            Share this note
          </button>
        </div>
      )}
    </div>
  );
}

export default function NotesPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [savedContent, setSavedContent] = useState('');
  const [submittedNotes, setSubmittedNotes] = useState<UserNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace('/'); return; }
      setUserId(data.user.id);
    });
  }, [router]);

  async function loadNotes(uid: string) {
    setLoading(true);
    try {
      const [draft, past] = await Promise.all([fetchCurrentDraft(uid), fetchSubmittedNotes(uid)]);
      const text = draft?.content ?? '';
      setContent(text);
      setSavedContent(text);
      setSubmittedNotes(past);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (userId) loadNotes(userId);
  }, [userId]);

  const words = countWords(content);
  const atLimit = words >= MAX_WORDS;
  const nearLimit = words >= WARN_WORDS;
  const isDirty = content !== savedContent;

  function handleChange(text: string) {
    if (countWords(text) > MAX_WORDS) return;
    setContent(text);
    setSaveStatus('idle');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => handleSave(text), 2000);
  }

  async function handleSave(textToSave = content) {
    if (!userId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaving(true);
    setSaveStatus('idle');
    try {
      await saveDraft(userId, textToSave);
      setSavedContent(textToSave);
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit() {
    if (!userId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSubmitting(true);
    try {
      await saveDraft(userId, content);
      await submitNote(userId);
      await loadNotes(userId);
    } finally {
      setSubmitting(false);
      setConfirmOpen(false);
    }
  }

  function handleExport() {
    if (!content.trim()) return;
    if (navigator.share) {
      navigator.share({ text: content, title: 'My Note — The Common Room' }).catch(() => {});
    } else {
      navigator.clipboard.writeText(content);
    }
  }

  if (loading) {
    return (
      <AppShell active="notes">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell active="notes">
      <div className="px-5 pt-3 pb-36">

        {/* Header */}
        <div className="flex items-start justify-between mb-1">
          <div>
            <h1 className="font-georgia text-primary text-[28px] leading-[36px]">My Note</h1>
            <p className="text-subtext text-xs mt-1">A private space for your own thoughts</p>
          </div>
        </div>

        {/* Word count */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-xs"
            style={{
              color: atLimit ? Colors.error : nearLimit ? '#B07A30' : Colors.subtext,
              fontWeight: nearLimit ? 500 : 400,
            }}
          >
            {words} / {MAX_WORDS} words
            {atLimit ? ' — limit reached' : nearLimit ? ' — almost full' : ''}
          </span>
          <span className="text-xs text-subtext">
            {saving ? 'Saving…' : saveStatus === 'saved' ? 'Saved' : saveStatus === 'error' ? 'Save failed' : isDirty ? 'Unsaved' : ''}
          </span>
        </div>

        {/* Text area */}
        <textarea
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Write your thoughts here…"
          rows={10}
          className="w-full text-base text-ink placeholder:text-subtext bg-transparent resize-none focus:outline-none leading-relaxed"
        />

        {/* Past notes */}
        {submittedNotes.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-semibold text-subtext uppercase tracking-wider mb-3">
              Previous notes
            </p>
            {submittedNotes.map((note) => <PastNote key={note.id} note={note} />)}
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div
        className="fixed bottom-16 left-0 right-0 max-w-lg mx-auto px-5 pt-3 pb-5 bg-background border-t flex gap-2.5"
        style={{ borderColor: Colors.secondary + '60' }}
      >
        {/* Save */}
        <button
          onClick={() => handleSave()}
          disabled={saving || !isDirty}
          className="flex-1 flex items-center justify-center min-h-[52px] rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
          style={{
            backgroundColor: isDirty ? Colors.primary : Colors.secondary + '60',
            color: isDirty ? 'white' : Colors.subtext,
          }}
        >
          {saving ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            saveStatus === 'saved' && !isDirty ? 'Saved' : 'Save'
          )}
        </button>

        {/* Submit */}
        <button
          onClick={() => { if (content.trim()) setConfirmOpen(true); }}
          disabled={submitting || !content.trim()}
          className="flex-1 flex items-center justify-center min-h-[52px] rounded-xl border-[1.5px] text-sm font-semibold transition-colors disabled:opacity-40"
          style={{
            borderColor: content.trim() ? Colors.accent : Colors.secondary + '40',
            backgroundColor: content.trim() ? Colors.accent + '20' : 'transparent',
            color: Colors.primary,
          }}
        >
          {submitting ? (
            <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : 'Submit'}
        </button>

        {/* Share / copy */}
        <button
          onClick={handleExport}
          disabled={!content.trim()}
          className="flex items-center justify-center min-h-[52px] px-4 rounded-xl border-[1.5px] disabled:opacity-30 transition-opacity"
          style={{ borderColor: Colors.secondary + '60', color: Colors.primary }}
          aria-label="Share or copy note"
        >
          ↑
        </button>
      </div>

      {/* Confirm submit dialog */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
          <div className="bg-background rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-georgia text-primary text-lg mb-2">Submit this note?</h3>
            <p className="text-sm text-ink leading-relaxed mb-6">
              Your note will be saved and archived. You can start a fresh note afterwards.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 min-h-[44px] rounded-xl border-[1.5px] border-secondary text-ink text-sm hover:bg-secondary/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 min-h-[44px] rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
