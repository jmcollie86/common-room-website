import Link from 'next/link';
import { Colors } from '@/constants/theme';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-georgia text-primary text-xl mb-4">{title}</h2>
      <div className="text-ink text-sm leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl b-card mt-4">
      <table className="w-full text-sm">
        <thead style={{ backgroundColor: Colors.background }}>
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-subtext uppercase tracking-wider whitespace-nowrap b-b">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i < rows.length - 1 ? 'b-b' : ''}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-ink align-top">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="max-w-2xl mx-auto">

        <Link href="/" className="text-primary text-sm mb-8 inline-flex items-center gap-1 hover:opacity-70 transition-opacity">
          ← Back
        </Link>

        <div
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] tracking-[0.04em] uppercase font-medium mb-5 mt-6"
          style={{ backgroundColor: Colors.background, border: `0.5px solid ${Colors.secondary}`, color: Colors.primary }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Privacy Policy
        </div>

        <h1 className="font-georgia text-primary text-4xl leading-tight mb-2">Privacy Policy</h1>
        <p className="text-subtext text-sm mb-2">The Common Room App · Lifework Lab</p>
        <p className="text-subtext text-sm mb-10">Last updated: June 2026</p>

        <Section title="Who we are">
          <p>The Common Room App is operated by <strong>Lifework Lab Limited</strong>. Dr Jonathan Collie is the data controller responsible for your personal data.</p>
          <p>Contact: <a href="mailto:contact@lifework-lab.com" className="text-primary underline underline-offset-2">contact@lifework-lab.com</a></p>
        </Section>

        <Section title="What data we collect">
          <Table
            headers={['Data', 'Required?', 'Purpose']}
            rows={[
              ['Full name', 'Yes', 'Account identity'],
              ['Email address', 'Yes', 'Authentication and account emails'],
              ['Password', 'Yes', 'Encrypted — never stored in readable form'],
              ['Gender', 'Optional', 'Aggregate service insight only'],
              ['Year of birth', 'Optional', 'Aggregate service insight only'],
              ['Home postcode', 'Optional', 'Aggregate service insight only'],
              ['ADOPT theme selections', 'Activity', 'Core service function — up to 10 themes'],
              ['AI Points of Reflection', 'Activity', 'Generated from theme data only — no personal details sent to the AI'],
              ['Personal notes', 'Activity', 'Private free-text space, stored at your request'],
            ]}
          />
          <p className="mt-4 text-subtext text-xs">Optional fields may be left blank. You can update or remove them at any time by contacting us.</p>
        </Section>

        <Section title="How we use your data and our lawful basis">
          <Table
            headers={['Purpose', 'Lawful basis']}
            rows={[
              ['Account creation and authentication', 'Contract (Art. 6(1)(b)) — necessary to provide the service'],
              ['ADOPT selections, dashboard, and reflections', 'Contract (Art. 6(1)(b)) — core service function'],
              ['Personal notes', 'Contract (Art. 6(1)(b)) — stored at your explicit request'],
              ['Optional demographic data', 'Consent (Art. 6(1)(a)) — entirely voluntary'],
              ['Aggregate service analytics', 'Legitimate interest (Art. 6(1)(f)) — anonymised counts only, no profiling'],
            ]}
          />
          <p className="mt-4">We do not use automated decision-making that produces legal or similarly significant effects. AI reflections are for personal reflection only — they carry no consequences for access to services, employment, healthcare, or support.</p>
        </Section>

        <Section title="Third-party processors">
          <Table
            headers={['Processor', 'Data shared', 'Safeguard']}
            rows={[
              ['Supabase', 'All user data — stored in EU region', 'Row-Level Security on all tables; encrypted passwords; EU hosting; DPA in place'],
              ['Anthropic (Claude API)', 'Theme names and descriptions only — no name, email, postcode, or notes', 'API key held server-side only, never in the browser'],
              ['Vercel', 'HTTP request metadata only — no personal data stored', 'HTTPS enforced; DPA in place'],
            ]}
          />
          <p className="mt-4">No personal data is transferred outside the UK/EU without adequate safeguards. Your data is never sold, shared with advertisers, or used for any third-party purpose.</p>
        </Section>

        <Section title="How long we keep your data">
          <p>All data is retained for the life of your account. If you request deletion of your account, all your data — themes, reflections, notes, and profile — is permanently removed within 14 days.</p>
          <p>Accounts with no activity for 24 months will be flagged for review. We will contact you before taking any action.</p>
        </Section>

        <Section title="Security">
          <ul className="list-disc pl-5 space-y-1">
            <li>Passwords are encrypted with bcrypt — no one can read them</li>
            <li>Your data is isolated at the database level so only you can access it</li>
            <li>All connections are encrypted (HTTPS / TLS 1.2+)</li>
            <li>API keys are held server-side only, never in your browser</li>
            <li>Admin access requires an explicit admin flag checked on every request</li>
          </ul>
        </Section>

        <Section title="Your rights">
          <p>Under UK GDPR, you have the right to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Access</strong> — request a copy of the data we hold about you</li>
            <li><strong>Rectification</strong> — ask us to correct anything inaccurate</li>
            <li><strong>Erasure</strong> — request deletion of your account and all associated data</li>
            <li><strong>Restriction</strong> — ask us to limit how we process your data</li>
            <li><strong>Withdraw consent</strong> — for optional fields, at any time</li>
            <li><strong>Complain</strong> — lodge a complaint with the ICO at <a href="https://ico.org.uk" className="text-primary underline underline-offset-2" target="_blank" rel="noopener noreferrer">ico.org.uk</a></li>
          </ul>
          <p className="mt-3">To exercise any right, email <a href="mailto:contact@lifework-lab.com" className="text-primary underline underline-offset-2">contact@lifework-lab.com</a>. We will acknowledge within 2 working days and respond in full within 14 days.</p>
        </Section>

        <Section title="Changes to this policy">
          <p>We may update this policy when we make material changes to how we process data. We will notify registered users by email before any significant change takes effect.</p>
        </Section>

        <div
          className="flex items-center gap-2 mt-4 px-4 py-3 rounded-xl text-sm"
          style={{ backgroundColor: Colors.background, color: Colors.primary }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
          </svg>
          Questions? <a href="mailto:contact@lifework-lab.com" className="font-medium underline underline-offset-2 ml-1">contact@lifework-lab.com</a>
        </div>

        <p className="text-subtext text-xs mt-8 text-center">
          The Common Room is run by Lifework Lab · Data controller: Jonathan Collie
        </p>

      </div>
    </div>
  );
}
