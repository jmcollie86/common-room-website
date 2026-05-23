'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts';
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

export default function AdminThemesPage() {
  const [themes, setThemes] = useState<ThemeData[]>([]);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <h1 className="font-georgia text-primary text-4xl leading-tight mb-2">Themes</h1>
      <p className="text-subtext text-sm mb-8">
        {totalSelections} total selections across {themes.length} themes
      </p>

      {error && (
        <div className="rounded-xl p-4 bg-error/10 text-error text-sm mb-6">{error}</div>
      )}

      {/* Category distribution donut */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6" style={{ border: `1px solid ${Colors.secondary}40` }}>
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
        <div className="bg-white rounded-2xl p-6" style={{ border: `1px solid ${Colors.secondary}40` }}>
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
      <div className="bg-white rounded-2xl p-6" style={{ border: `1px solid ${Colors.secondary}40` }}>
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
    </div>
  );
}
