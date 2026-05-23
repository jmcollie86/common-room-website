'use client';

import { useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { Colors } from '@/constants/theme';

type Stats = {
  totalUsers: number;
  uniqueActiveUsers: number;
  totalReflections: number;
  totalNotes: number;
  newUsersThisMonth: number;
  reflectionsThisMonth: number;
  registrationsByDay: { date: string; count: number }[];
};

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl px-6 py-5 b-card">
      <p className="text-xs font-semibold text-subtext uppercase tracking-wider mb-1">{label}</p>
      <p className="font-georgia text-3xl text-primary">{value}</p>
      {sub && <p className="text-xs text-subtext mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load stats');
        return r.json();
      })
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="rounded-xl p-5 bg-error/10 text-error text-sm">{error}</div>
      </div>
    );
  }

  const s = stats!;

  // Format chart date labels
  const chartData = s.registrationsByDay.map(({ date, count }) => ({
    date: new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    count,
  }));

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <h1 className="font-georgia text-primary text-4xl leading-tight mb-2">Overview</h1>
      <p className="text-subtext text-sm mb-8">Platform stats at a glance</p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-10">
        <StatCard label="Total users" value={s.totalUsers} />
        <StatCard label="Active users" value={s.uniqueActiveUsers} sub="have selected themes" />
        <StatCard label="Reflections" value={s.totalReflections} />
        <StatCard label="Notes submitted" value={s.totalNotes} />
        <StatCard label="New this month" value={s.newUsersThisMonth} sub="registrations" />
        <StatCard label="Reflections this month" value={s.reflectionsThisMonth} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Registrations over time */}
        <div className="bg-white rounded-2xl p-6 b-card">
          <p className="text-sm font-semibold text-ink mb-1">User registrations</p>
          <p className="text-xs text-subtext mb-5">Last 30 days</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={Colors.primary} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={Colors.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={Colors.secondary + '40'} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: Colors.subtext }}
                interval={4}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: Colors.subtext }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: `1px solid ${Colors.secondary}60`, fontSize: 12 }}
                labelStyle={{ color: Colors.text, fontWeight: 600 }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke={Colors.primary}
                strokeWidth={2}
                fill="url(#regGrad)"
                name="New users"
                dot={false}
                activeDot={{ r: 4, fill: Colors.primary }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Engagement snapshot */}
        <div className="bg-white rounded-2xl p-6 b-card">
          <p className="text-sm font-semibold text-ink mb-1">Engagement snapshot</p>
          <p className="text-xs text-subtext mb-5">Across all users</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={[
                { label: 'Registered', value: s.totalUsers },
                { label: 'Active', value: s.uniqueActiveUsers },
                { label: 'Reflections', value: s.totalReflections },
                { label: 'Notes', value: s.totalNotes },
              ]}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={Colors.secondary + '40'} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: Colors.subtext }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: Colors.subtext }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: `1px solid ${Colors.secondary}60`, fontSize: 12 }}
              />
              <Bar dataKey="value" fill={Colors.accent} radius={[6, 6, 0, 0]} name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
