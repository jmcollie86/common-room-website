function Section({
  icon,
  label,
  children,
  first = false,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  first?: boolean;
}) {
  return (
    <details className={`border-b border-[#E8E8E4] group${first ? ' border-t' : ''}`}>
      <summary className="flex items-center justify-between py-[13px] cursor-pointer list-none text-sm font-medium text-primary select-none [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-full bg-background flex items-center justify-center shrink-0 text-primary">
            {icon}
          </span>
          {label}
        </span>
        <span className="text-xs text-subtext transition-transform duration-200 group-open:rotate-180 shrink-0" aria-hidden="true">▼</span>
      </summary>
      <div className="pb-3.5 pl-[38px] text-[13.5px] leading-[1.65] text-[#444]">
        {children}
      </div>
    </details>
  );
}

export function PrivacyNotice() {
  return (
    <div className="rounded-xl bg-white p-6 pt-7 max-w-md" role="region" aria-label="Privacy information">

      <div className="inline-flex items-center gap-1.5 bg-background border border-secondary/40 rounded-full px-3 py-1 text-[12px] text-primary tracking-[0.04em] uppercase font-medium mb-5">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        Your privacy
      </div>

      <h2 className="font-georgia text-[22px] text-primary font-normal mb-1.5 leading-snug">
        How we look after your information
      </h2>
      <p className="text-sm text-subtext mb-6 leading-relaxed">
        Simple answers to what we collect, how we use it, and your rights — no legal jargon.
      </p>

      <hr className="border-none border-t border-[#E8E8E4] mb-5" />

      <Section
        first
        icon={
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
        }
        label="What we collect when you sign up"
      >
        <p className="mb-2">We ask for your <strong>name</strong> and <strong>email address</strong> to create your account, and a <strong>password</strong> which is encrypted — we can never see it.</p>
        <p>We also ask for a few optional details: your gender, year of birth, and home postcode. These help us understand who is using The Common Room. They are entirely optional — you can leave them blank.</p>
      </Section>

      <Section
        icon={
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        }
        label="What we create as you use the app"
      >
        <p className="mb-2">As you use The Common Room, we store:</p>
        <ul className="list-disc pl-4 mb-2 space-y-1">
          <li>The ADOPT themes you select</li>
          <li>Your AI-generated Points of Reflection</li>
          <li>Any personal notes you write</li>
        </ul>
        <p>This content is private to you. Other users cannot see it. It is only accessible to The Common Room&apos;s administrators for the purposes of running and supporting the service.</p>
      </Section>

      <Section
        icon={
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3M6.343 6.343l-.707-.707M12 21v-1" />
            <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
          </svg>
        }
        label="What the AI sees"
      >
        <div className="bg-background border-l-[3px] border-accent rounded-r-md px-3 py-2 mb-2 text-[13px] text-primary">
          Your personal details are never sent to the AI.
        </div>
        <p>When your reflections are generated, only your selected theme names and descriptions are used. Your name, email, postcode, and notes stay entirely within our systems.</p>
      </Section>

      <Section
        icon={
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        }
        label="How we keep your data secure"
      >
        <ul className="list-disc pl-4 space-y-1">
          <li>Your password is encrypted — nobody can read it</li>
          <li>Your data is protected so only you can access it, enforced at the database level</li>
          <li>The connection to this app is always encrypted (HTTPS)</li>
          <li>Our API keys are held securely on the server, never in your browser</li>
        </ul>
      </Section>

      <Section
        icon={
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
        }
        label="How long we keep it"
      >
        <p className="mb-2">We keep your data for as long as your account is active. If you delete your account, all your data — themes, reflections, and notes — is permanently removed.</p>
        <p>We do not keep data for any longer than necessary, and we never share or sell it.</p>
      </Section>

      <Section
        icon={
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        label="Your rights"
      >
        <p className="mb-2">Under UK GDPR, you have the right to:</p>
        <ul className="list-disc pl-4 mb-2 space-y-1">
          <li>See what data we hold about you</li>
          <li>Ask us to correct anything inaccurate</li>
          <li>Ask us to delete your account and all your data</li>
          <li>Withdraw your consent at any time</li>
        </ul>
        <p>Contact us to exercise any of these rights. We will respond within 5 working days.</p>
      </Section>

      <div className="flex items-center gap-2 mt-4 px-3.5 py-2.5 bg-background rounded-lg text-[13px] text-primary">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
        </svg>
        Questions? Contact us at{' '}
        <a href="mailto:contact@lifework-lab.com" className="font-medium underline underline-offset-2 text-primary">
          contact@lifework-lab.com
        </a>
      </div>

      <p className="mt-5 text-[12.5px] text-subtext leading-relaxed text-center">
        The Common Room is run by Lifework Lab · Data controller: Jonathan Collie
      </p>
    </div>
  );
}
