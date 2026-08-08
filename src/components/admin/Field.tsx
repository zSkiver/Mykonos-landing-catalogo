import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

const CONTROL =
  'w-full rounded-lg border border-salt bg-chalk px-4 py-2.5 text-sm text-ink transition-colors placeholder:text-ash hover:border-ink/25 focus:border-aegean focus:outline-none disabled:opacity-50';

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-2 block font-mono text-[0.58rem] uppercase tracking-[0.2em] text-ash">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-ash">{hint}</span>}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(CONTROL, props.className)} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(CONTROL, 'min-h-24 resize-y', props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(CONTROL, 'appearance-none', props.className)} />;
}

export function Toggle({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-lg border border-salt px-4 py-2.5 transition-colors',
        checked ? 'border-aegean bg-aegean/6' : 'hover:border-ink/25',
        disabled && 'pointer-events-none opacity-45',
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 rounded-xs accent-aegean"
      />
      <span className={cn('text-sm', checked ? 'text-aegean' : 'text-stone')}>{label}</span>
    </label>
  );
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-chalk p-6 ring-1 ring-salt md:p-8">
      <header className="mb-6">
        <h2 className="font-display text-xl text-ink">{title}</h2>
        {description && <p className="mt-1.5 text-sm text-stone">{description}</p>}
      </header>
      {children}
    </section>
  );
}
