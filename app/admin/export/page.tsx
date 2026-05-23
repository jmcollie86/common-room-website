'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { Colors } from '@/constants/theme';

type ExportType = 'users' | 'selections' | 'reflections' | 'notes';

const EXPORT_TYPES: { id: ExportType; label: string; description: string }[] = [
  {
    id: 'users',
    label: 'Users',
    description: 'Name, email, gender, year of birth, postcode, registration date',
  },
  {
    id: 'selections',
    label: 'Theme selections',
    description: 'Which themes each user selected and when',
  },
  {
    id: 'reflections',
    label: 'Reflections',
    description: 'All generated reflections with content and timestamps',
  },
  {
    id: 'notes',
    label: 'Submitted notes',
    description: 'All submitted personal notes (drafts excluded)',
  },
];

export default function AdminExportPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<ExportType[]>(['users']);
  const [downloading, setDownloading] = useState<ExportType | null>(null);

  function toggleType(type: ExportType) {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  async function downloadCSV(type: ExportType) {
    setDownloading(type);
    const params = new URLSearchParams({ type });
    if (from) params.set('from', from);
    if (to) params.set('to', to);

    try {
      const res = await fetch(`/api/admin/export?${params}`);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tcr-${type}-${from || 'all'}-to-${to || 'now'}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Export failed. Please try again.');
    } finally {
      setDownloading(null);
    }
  }

  async function downloadAll() {
    for (const type of selectedTypes) {
      await downloadCSV(type);
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      <h1 className="font-georgia text-primary text-4xl leading-tight mb-2">Export</h1>
      <p className="text-subtext text-sm mb-10">
        Download data as CSV files. All exports respect the date range you set.
      </p>

      {/* Date range */}
      <section className="bg-white rounded-2xl p-6 mb-6" style={{ border: `1px solid ${Colors.secondary}40` }}>
        <p className="text-sm font-semibold text-ink mb-4">Date range</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-subtext mb-2 uppercase tracking-wider">From</label>
            <input
              type="date"
              value={from}
              max={to || today}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full h-11 bg-background border-[1.5px] border-secondary rounded-xl px-4 text-sm text-ink focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-subtext mb-2 uppercase tracking-wider">To</label>
            <input
              type="date"
              value={to}
              min={from}
              max={today}
              onChange={(e) => setTo(e.target.value)}
              className="w-full h-11 bg-background border-[1.5px] border-secondary rounded-xl px-4 text-sm text-ink focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setFrom(''); setTo(''); }}
              className="h-11 px-4 text-sm text-subtext hover:text-ink transition-colors whitespace-nowrap"
            >
              Clear range
            </button>
          </div>
        </div>
        {!from && !to && (
          <p className="text-xs text-subtext mt-3">No date range set — exports will include all records.</p>
        )}
        {(from || to) && (
          <p className="text-xs text-subtext mt-3">
            Exporting records from{' '}
            <span className="font-medium text-ink">{from ? new Date(from).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'the beginning'}</span>
            {' '}to{' '}
            <span className="font-medium text-ink">{to ? new Date(to).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'today'}</span>
          </p>
        )}
      </section>

      {/* Data type selection */}
      <section className="bg-white rounded-2xl p-6 mb-6" style={{ border: `1px solid ${Colors.secondary}40` }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-ink">Data to export</p>
          <button
            onClick={() =>
              selectedTypes.length === EXPORT_TYPES.length
                ? setSelectedTypes([])
                : setSelectedTypes(EXPORT_TYPES.map((t) => t.id))
            }
            className="text-xs text-primary hover:opacity-70 transition-opacity"
          >
            {selectedTypes.length === EXPORT_TYPES.length ? 'Deselect all' : 'Select all'}
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {EXPORT_TYPES.map(({ id, label, description }) => {
            const isSelected = selectedTypes.includes(id);
            return (
              <label
                key={id}
                className="flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-colors"
                style={{
                  backgroundColor: isSelected ? Colors.primary + '08' : Colors.background,
                  border: `1.5px solid ${isSelected ? Colors.primary + '40' : Colors.secondary + '40'}`,
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleType(id)}
                  className="mt-0.5 accent-primary w-4 h-4"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink">{label}</p>
                  <p className="text-xs text-subtext mt-0.5">{description}</p>
                </div>
                <button
                  onClick={(e) => { e.preventDefault(); downloadCSV(id); }}
                  disabled={downloading === id}
                  className="shrink-0 flex items-center gap-1.5 text-xs text-primary hover:opacity-70 transition-opacity disabled:opacity-40"
                >
                  {downloading === id ? (
                    <span className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download size={12} />
                  )}
                  CSV
                </button>
              </label>
            );
          })}
        </div>
      </section>

      {/* Download all */}
      <button
        onClick={downloadAll}
        disabled={selectedTypes.length === 0 || !!downloading}
        className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        <Download size={16} />
        {downloading
          ? `Downloading ${downloading}…`
          : `Download ${selectedTypes.length} file${selectedTypes.length !== 1 ? 's' : ''}`}
      </button>

      <p className="text-xs text-subtext text-center mt-4">
        Files download as UTF-8 CSV, compatible with Excel, Google Sheets, and Numbers.
      </p>
    </div>
  );
}
