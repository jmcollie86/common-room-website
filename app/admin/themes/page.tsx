'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
} from 'recharts';
import { Check, Minus, Copy, Download } from 'lucide-react';
import { Colors } from '@/constants/theme';

type ThemeData = {
  id: number;
  theme: string;
  category: string;
  category_colour: string | null;
  selectionCount: number;
};

type CategorySummary = {
  category: string;
  total: number;
  colour: string | null;
};

type EmailUser = { name: string; email: string };

export default function AdminThemesPage() {
  const [themes, setThemes] = useState<ThemeData[]>([]);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Email list builder state
  const [selectedThemeIds, setSelectedThemeIds] = useState<Set<number>>(new Set());
  const [emailResult, setEmailResult] = useState<EmailUser[] | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/admin/themes')
      .then((r) => { if (!r.ok) throw new Error('Failed to load themes'); return r.json(); })
      .then((d) => { setThemes(d.themes); setCategories(d.categorySummary); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const allCategories = ['All', ...categories.map((c) => c.category).sort()];

  const filtered = themes
    .filter((t) => activeCategory === 'All' || t.category === activeCategory)
    .sort((a, b) => b.selectionCount - a.selectionCount);

  const totalSelections = themes.reduce((sum, t) => sum + t.selectionCount, 0);

  function toggleTheme(id: number) {
    setSelectedThemeIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setEmailResult(null);
  }

  function toggleCategory(category: string) {
    const ids = themes.filter((t) => t.category === category).map((t) => t.id);
    const allSelected = ids.every((id) => selectedThemeIds.has(id));
    setSelectedThemeIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
      return next;
    });
    setEmailResult(null);
  }

  async function fetchEmailList() {
    if (!selectedThemeIds.size) return;
    setEmailLoading(true);
    setEmailError('');
    setEmailResult(null);
    try {
      const ids = [...selectedThemeIds].join(',');
      const res = await fetch(`/api/admin/themes/users?themeIds=${ids}`);
      if (!res.ok) throw new Error('Failed to fetch email list');
      const data = await res.json();
      setEmailResult(data.users);
    } catch (e) {
      setEmailError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setEmailLoading(false);
    }
  }

  function copyEmails() {
    if (!emailResult) return;
    // Include the name in the standard "Name <email>" recipient format so it
    // survives the copy (and still pastes into an email client's To/BCC field).
    // Falls back to a bare email when the user has no stored name.
    const text = emailResult
      .map((u) => (u.name ? `${u.name} <${u.email}>` : u.email))
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadCSV() {
    if (!emailResult) return;
    const csv = ['name,email', ...emailResult.map((u) => `"${u.name}","${u.email}"`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tcr-email-list-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <h1 className="font-georgia text-primary text-4xl leading-tight mb-2">Themes</h1>
      <p className="text-subtext text-sm mb-8">
        {totalSelections} total selections across {themes.length} themes
      </p>

      {error && (
        <div className="rounded-xl p-4 bg-error/10 text-error text-sm mb-6">{error}</div>
      )}

      {/* Category distribution donut */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 b-card">
          <p className="text-sm font-semibold text-ink mb-1">Selections by category</p>
          <p className="text-xs text-subtext mb-4">Total selections per ADOPT category</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={categories}
                dataKey="total"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={50}
                paddingAngle={3}
                label={({ name, percent }) =>
                  `${(name as string).split(' ')[0]} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {categories.map((c) => (
                  <Cell key={c.category} fill={c.colour ?? Colors.secondary} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [value, name]}
                contentStyle={{ borderRadius: 10, border: `1px solid ${Colors.secondary}60`, fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category stats table */}
        <div className="bg-white rounded-2xl p-6 b-card">
          <p className="text-sm font-semibold text-ink mb-4">Category breakdown</p>
          <div className="flex flex-col gap-3">
            {[...categories].sort((a, b) => b.total - a.total).map((cat) => {
              const pct = totalSelections > 0 ? (cat.total / totalSelections) * 100 : 0;
              return (
                <div key={cat.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-ink">{cat.category}</span>
                    <span className="text-subtext font-medium">{cat.total}</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary/20 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: cat.colour ?? Colors.secondary }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-4">
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="px-4 py-2 rounded-xl border-[1.5px] text-sm transition-colors"
            style={{
              backgroundColor: activeCategory === cat ? Colors.primary : 'white',
              borderColor: activeCategory === cat ? Colors.primary : Colors.secondary,
              color: activeCategory === cat ? 'white' : Colors.text,
              fontWeight: activeCategory === cat ? 600 : 400,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Themes bar chart */}
      <div className="bg-white rounded-2xl p-6 b-card mb-8">
        <p className="text-sm font-semibold text-ink mb-1">Theme popularity</p>
        <p className="text-xs text-subtext mb-5">Number of users who selected each theme</p>
        <ResponsiveContainer width="100%" height={Math.max(300, filtered.length * 36)}>
          <BarChart
            data={filtered}
            layout="vertical"
            margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={Colors.secondary + '40'} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: Colors.subtext }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="theme"
              width={200}
              tick={{ fontSize: 11, fill: Colors.text }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{ borderRadius: 10, border: `1px solid ${Colors.secondary}60`, fontSize: 12 }}
              formatter={(value) => [value, 'Selections']}
            />
            <Bar dataKey="selectionCount" radius={[0, 6, 6, 0]} name="Selections">
              {filtered.map((t) => (
                <Cell key={t.id} fill={t.category_colour ?? Colors.secondary} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Email list builder ── */}
      <div className="bg-white rounded-2xl p-6 b-card">
        <p className="text-sm font-semibold text-ink mb-1">Email list builder</p>
        <p className="text-xs text-subtext mb-6">
          Select themes below to get a list of users who chose them. Use to invite, inform, or communicate with specific groups.
        </p>

        {/* Themes grouped by category */}
        <div className="flex flex-col gap-6 mb-6">
          {[...categories].sort((a, b) => b.total - a.total).map((cat) => {
            const catThemes = themes
              .filter((t) => t.category === cat.category)
              .sort((a, b) => b.selectionCount - a.selectionCount);
            const selectedInCat = catThemes.filter((t) => selectedThemeIds.has(t.id)).length;
            const allSelected = selectedInCat === catThemes.length;
            const someSelected = selectedInCat > 0 && !allSelected;

            return (
              <div key={cat.category}>
                {/* Category row — click to select all */}
                <button
                  onClick={() => toggleCategory(cat.category)}
                  className="flex items-center gap-2.5 mb-3 group"
                >
                  <div
                    className="w-4 h-4 rounded flex items-center justify-center border-[1.5px] transition-colors shrink-0"
                    style={{
                      backgroundColor: allSelected ? Colors.primary : someSelected ? Colors.primary + '25' : 'white',
                      borderColor: allSelected || someSelected ? Colors.primary : Colors.secondary,
                    }}
                  >
                    {allSelected && <Check size={10} color="white" strokeWidth={3} />}
                    {someSelected && <Minus size={10} color={Colors.primary} strokeWidth={3} />}
                  </div>
                  <span className="text-sm font-semibold text-ink group-hover:text-primary transition-colors">
                    {cat.category}
                  </span>
                  <span className="text-xs text-subtext">
                    {selectedInCat > 0 ? `${selectedInCat} of ${catThemes.length} selected` : `${catThemes.length} themes`}
                  </span>
                </button>

                {/* Individual themes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 ml-6">
                  {catThemes.map((t) => {
                    const isSelected = selectedThemeIds.has(t.id);
                    return (
                      <button
                        key={t.id}
                        onClick={() => toggleTheme(t.id)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all border-[1.5px]"
                        style={{
                          backgroundColor: isSelected ? (cat.colour ?? Colors.secondary) + '20' : '#FAFAFA',
                          borderColor: isSelected ? (cat.colour ?? Colors.secondary) : 'transparent',
                        }}
                      >
                        <div
                          className="w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 transition-colors"
                          style={{
                            backgroundColor: isSelected ? (cat.colour ?? Colors.secondary) : 'white',
                            borderColor: isSelected ? (cat.colour ?? Colors.secondary) : Colors.secondary,
                          }}
                        >
                          {isSelected && <Check size={8} color="white" strokeWidth={3} />}
                        </div>
                        <span className="text-xs text-ink flex-1">{t.theme}</span>
                        <span className="text-xs text-subtext shrink-0">{t.selectionCount}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2 border-t border-secondary/30">
          <button
            onClick={fetchEmailList}
            disabled={!selectedThemeIds.size || emailLoading}
            className="flex items-center justify-center h-10 px-6 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {emailLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              `Get email list${selectedThemeIds.size ? ` (${selectedThemeIds.size} theme${selectedThemeIds.size !== 1 ? 's' : ''})` : ''}`
            )}
          </button>
          {selectedThemeIds.size > 0 && (
            <button
              onClick={() => { setSelectedThemeIds(new Set()); setEmailResult(null); }}
              className="text-sm text-subtext hover:text-error transition-colors"
            >
              Clear selection
            </button>
          )}
        </div>

        {emailError && <p className="text-error text-sm mt-3">{emailError}</p>}

        {/* Results */}
        {emailResult !== null && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-ink">
                {emailResult.length} user{emailResult.length !== 1 ? 's' : ''} found
              </p>
              {emailResult.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={copyEmails}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-secondary/60 text-xs text-ink hover:bg-secondary/10 transition-colors"
                  >
                    <Copy size={12} />
                    {copied ? 'Copied!' : 'Copy emails'}
                  </button>
                  <button
                    onClick={downloadCSV}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-secondary/60 text-xs text-ink hover:bg-secondary/10 transition-colors"
                  >
                    <Download size={12} />
                    Download CSV
                  </button>
                </div>
              )}
            </div>

            {emailResult.length === 0 ? (
              <p className="text-subtext text-sm">No users have selected these themes yet.</p>
            ) : (
              <div className="rounded-xl overflow-hidden border border-secondary/40">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: Colors.background }}>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-subtext uppercase tracking-wider">Name</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-subtext uppercase tracking-wider">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emailResult.map((u, i) => (
                      <tr key={u.email} className={i % 2 === 0 ? 'bg-white' : ''} style={i % 2 !== 0 ? { backgroundColor: Colors.secondary + '15' } : {}}>
                        <td className="px-4 py-2.5 text-ink">{u.name || '—'}</td>
                        <td className="px-4 py-2.5 text-ink font-mono text-xs">{u.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
