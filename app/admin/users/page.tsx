'use client';

import { useEffect, useState, useMemo } from 'react';
import { Colors } from '@/constants/theme';
import { Search, Trash2 } from 'lucide-react';

type User = {
  id: string;
  email: string;
  full_name: string | null;
  gender: string | null;
  year_of_birth: number | null;
  home_postcode: string | null;
  created_at: string;
  is_admin: boolean;
  themeCount: number;
  reflectionCount: number;
  hasNote: boolean;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<keyof User>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string, name: string | null) {
    if (!confirm(`Delete ${name ?? 'this user'}? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete user');
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    fetch('/api/admin/users')
      .then((r) => { if (!r.ok) throw new Error('Failed to load users'); return r.json(); })
      .then((d) => setUsers(d.users))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function toggleSort(key: keyof User) {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users
      .filter((u) =>
        !q ||
        u.email.toLowerCase().includes(q) ||
        (u.full_name ?? '').toLowerCase().includes(q) ||
        (u.home_postcode ?? '').toLowerCase().includes(q)
      )
      .sort((a, b) => {
        const av = a[sortKey] ?? '';
        const bv = b[sortKey] ?? '';
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return sortDir === 'asc' ? cmp : -cmp;
      });
  }, [users, search, sortKey, sortDir]);

  function SortHeader({ label, k }: { label: string; k: keyof User }) {
    const active = sortKey === k;
    return (
      <th
        onClick={() => toggleSort(k)}
        className="px-4 py-3 text-left text-xs font-semibold text-subtext uppercase tracking-wider cursor-pointer select-none hover:text-ink transition-colors whitespace-nowrap"
      >
        {label} {active ? (sortDir === 'asc' ? '↑' : '↓') : ''}
      </th>
    );
  }

  return (
    <div className="max-w-full px-8 py-10">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="font-georgia text-primary text-4xl leading-tight">Users</h1>
          <p className="text-subtext text-sm mt-2">{users.length} registered</p>
        </div>

        <div className="flex items-center bg-white border-[1.5px] border-secondary rounded-xl px-4 min-h-[44px] gap-2 focus-within:border-primary transition-colors w-72">
          <Search size={16} color={Colors.subtext} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, postcode…"
            className="flex-1 text-sm text-ink placeholder:text-subtext bg-transparent focus:outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl p-4 bg-error/10 text-error text-sm mb-6">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center pt-20">
          <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden b-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: Colors.background }}>
                <tr className="b-b">
                  <SortHeader label="Name" k="full_name" />
                  <SortHeader label="Email" k="email" />
                  <SortHeader label="Gender" k="gender" />
                  <SortHeader label="Year" k="year_of_birth" />
                  <SortHeader label="Postcode" k="home_postcode" />
                  <SortHeader label="Registered" k="created_at" />
                  <SortHeader label="Themes" k="themeCount" />
                  <SortHeader label="AI Reflections" k="reflectionCount" />
                  <th className="px-4 py-3 text-left text-xs font-semibold text-subtext uppercase tracking-wider">Note</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-subtext uppercase tracking-wider">Admin</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr
                    key={u.id}
                    className={`hover:bg-background/60 transition-colors ${i < filtered.length - 1 ? 'b-b' : ''}`}
                  >
                    <td className="px-4 py-3 text-sm text-ink font-medium whitespace-nowrap">{u.full_name ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-subtext whitespace-nowrap">{u.email}</td>
                    <td className="px-4 py-3 text-sm text-subtext whitespace-nowrap">{u.gender ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-subtext">{u.year_of_birth ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-subtext">{u.home_postcode ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-subtext whitespace-nowrap">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: u.themeCount > 0 ? Colors.primary + '15' : Colors.secondary + '30',
                          color: u.themeCount > 0 ? Colors.primary : Colors.subtext,
                        }}
                      >
                        {u.themeCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: u.reflectionCount > 0 ? Colors.accent + '30' : Colors.secondary + '30',
                          color: u.reflectionCount > 0 ? Colors.text : Colors.subtext,
                        }}
                      >
                        {u.reflectionCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm">{u.hasNote ? '✓' : '—'}</td>
                    <td className="px-4 py-3 text-center text-sm">{u.is_admin ? '✓' : '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDelete(u.id, u.full_name)}
                        disabled={deletingId === u.id || u.is_admin}
                        title={u.is_admin ? 'Cannot delete admin' : 'Delete user'}
                        className="p-1.5 rounded-lg text-subtext hover:text-error hover:bg-error/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        {deletingId === u.id
                          ? <div className="w-4 h-4 border-2 border-error border-t-transparent rounded-full animate-spin" />
                          : <Trash2 size={15} />}
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={11} className="px-4 py-12 text-center text-sm text-subtext">
                      No users match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
