import { cn } from '@/utils/cn';

export function Spinner({ className, label = 'Carregando' }: { className?: string; label?: string }) {
  return (
    <span role="status" aria-label={label} className={cn('inline-flex', className)}>
      <span className="size-5 animate-spin rounded-full border border-salt border-t-aegean" />
    </span>
  );
}

export function PageLoader({ label = 'Carregando' }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner label={label} />
    </div>
  );
}
