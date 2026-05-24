import { describe, it, expect } from 'vitest';

// ── Helpers duplicated from source files (pure functions worth testing) ──────

function countWords(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

function toTexts(content: unknown): string[] {
  if (!Array.isArray(content)) return [];
  return content.filter((x): x is string => typeof x === 'string');
}

function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? '' : String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  return [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(',')),
  ].join('\n');
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// ── countWords ───────────────────────────────────────────────────────────────

describe('countWords', () => {
  it('returns 0 for empty string', () => expect(countWords('')).toBe(0));
  it('returns 0 for whitespace only', () => expect(countWords('   ')).toBe(0));
  it('counts single word', () => expect(countWords('hello')).toBe(1));
  it('counts multiple words', () => expect(countWords('hello world foo')).toBe(3));
  it('handles extra spaces between words', () => expect(countWords('  a   b  c  ')).toBe(3));
  it('counts 1000 words correctly', () => {
    const text = Array(1000).fill('word').join(' ');
    expect(countWords(text)).toBe(1000);
  });
});

// ── toTexts ──────────────────────────────────────────────────────────────────

describe('toTexts', () => {
  it('returns empty array for non-array input', () => {
    expect(toTexts(null)).toEqual([]);
    expect(toTexts(undefined)).toEqual([]);
    expect(toTexts('string')).toEqual([]);
    expect(toTexts(42)).toEqual([]);
    expect(toTexts({})).toEqual([]);
  });

  it('returns only string entries', () => {
    expect(toTexts(['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
  });

  it('filters out non-string array entries', () => {
    expect(toTexts(['a', 1, null, 'b', undefined, {}])).toEqual(['a', 'b']);
  });

  it('handles correctly shaped reflection content', () => {
    const content = ['Reflection 1.', 'Reflection 2.', 'Reflection 3.'];
    expect(toTexts(content)).toHaveLength(3);
    expect(toTexts(content)[0]).toBe('Reflection 1.');
  });
});

// ── toCSV ────────────────────────────────────────────────────────────────────

describe('toCSV', () => {
  it('returns empty string for no rows', () => expect(toCSV([])).toBe(''));

  it('generates header row', () => {
    const result = toCSV([{ name: 'Alice', age: 30 }]);
    expect(result.split('\n')[0]).toBe('name,age');
  });

  it('generates data row', () => {
    const result = toCSV([{ name: 'Alice', age: 30 }]);
    expect(result.split('\n')[1]).toBe('Alice,30');
  });

  it('escapes commas in values', () => {
    const result = toCSV([{ name: 'Smith, Alice' }]);
    expect(result).toContain('"Smith, Alice"');
  });

  it('escapes double quotes in values', () => {
    const result = toCSV([{ name: 'She said "hello"' }]);
    expect(result).toContain('"She said ""hello"""');
  });

  it('handles null/undefined values as empty string', () => {
    const result = toCSV([{ name: null, bio: undefined }]);
    expect(result.split('\n')[1]).toBe(',');
  });

  it('generates multiple rows', () => {
    const result = toCSV([
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ]);
    const lines = result.split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[1]).toBe('Alice,30');
    expect(lines[2]).toBe('Bob,25');
  });
});

// ── ISO date validation ──────────────────────────────────────────────────────

describe('ISO_DATE regex', () => {
  it('accepts valid YYYY-MM-DD dates', () => {
    expect(ISO_DATE.test('2026-05-24')).toBe(true);
    expect(ISO_DATE.test('2020-01-01')).toBe(true);
  });

  it('rejects invalid formats', () => {
    expect(ISO_DATE.test('24-05-2026')).toBe(false);
    expect(ISO_DATE.test('2026/05/24')).toBe(false);
    expect(ISO_DATE.test('not-a-date')).toBe(false);
    expect(ISO_DATE.test('')).toBe(false);
    expect(ISO_DATE.test('2026-5-1')).toBe(false);
  });
});
