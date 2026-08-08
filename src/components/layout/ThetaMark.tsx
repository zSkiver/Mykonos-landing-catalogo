import { cn } from '@/utils/cn';

/**
 * O Θ da marca: um theta didone — hastes grossas nos lados, finas em cima e
 * embaixo, atravessado pela barra. É a única forma gráfica da loja e reaparece
 * como divisor entre as seções.
 */
export function ThetaMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 120"
      aria-hidden
      focusable="false"
      className={cn('block', className)}
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M4 60a46 58 0 1 0 92 0a46 58 0 1 0 -92 0Z M18 60a32 51 0 1 0 64 0a32 51 0 1 0 -64 0Z"
      />
      <rect x="4" y="55.5" width="92" height="9" />
    </svg>
  );
}

/** Divisor de seção: régua fina interrompida pelo theta. */
export function ThetaDivider({ className, invert }: { className?: string; invert?: boolean }) {
  return (
    <div className={cn('flex items-center gap-5', className)} aria-hidden>
      <span className={cn('h-px flex-1', invert ? 'bg-chalk/20' : 'bg-salt')} />
      <ThetaMark className={cn('h-4 w-auto', invert ? 'text-chalk/45' : 'text-aegean/45')} />
      <span className={cn('h-px flex-1', invert ? 'bg-chalk/20' : 'bg-salt')} />
    </div>
  );
}
