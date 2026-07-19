import { AlertCircle, CheckCircle, Info } from 'lucide-react';

type Tone = 'error' | 'success' | 'info';

const TONES: Record<Tone, { icon: typeof AlertCircle; className: string; role: 'alert' | 'status' }> = {
  error: {
    icon: AlertCircle,
    className: 'bg-error/8 border-error/25 text-error',
    role: 'alert',
  },
  success: {
    icon: CheckCircle,
    className: 'bg-primary/6 border-primary/20 text-primary',
    role: 'status',
  },
  info: {
    icon: Info,
    className: 'bg-secondary/15 border-secondary/40 text-primary',
    role: 'status',
  },
};

/**
 * One presentation for every "here is what just happened" message in the auth
 * flows. Errors announce themselves to screen readers; success and info are
 * polite so they don't interrupt.
 */
export function FormAlert({
  tone = 'error',
  children,
  action,
}: {
  tone?: Tone;
  children: React.ReactNode;
  /** Optional follow-up — a link or button that resolves the message. */
  action?: React.ReactNode;
}) {
  const { icon: Icon, className, role } = TONES[tone];

  return (
    <div
      role={role}
      className={`flex gap-2.5 rounded-xl border-[1.5px] px-3.5 py-3 text-sm leading-relaxed ${className}`}
    >
      <Icon size={17} strokeWidth={2} className="shrink-0 mt-[1px]" aria-hidden="true" />
      <div className="min-w-0">
        {children}
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
}
