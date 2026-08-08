import { Link } from 'react-router-dom';
import { ThetaMark } from './ThetaMark';
import { cn } from '@/utils/cn';

interface Props {
  compact?: boolean;
  /** Sobre fundo escuro, a marca inverte para branco. */
  invert?: boolean;
  className?: string;
}

export function Wordmark({ compact, invert, className }: Props) {
  return (
    <Link
      to="/"
      aria-label="Mykonos Parfum — página inicial"
      className={cn(
        'group inline-flex items-center gap-3 transition-opacity duration-300 hover:opacity-70',
        invert ? 'text-chalk' : 'text-ink',
        className,
      )}
    >
      <ThetaMark
        className={cn('w-auto transition-all duration-500', compact ? 'h-6' : 'h-8')}
      />

      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'font-display uppercase transition-all duration-500',
            compact ? 'text-base tracking-[0.16em]' : 'text-lg tracking-[0.19em]',
          )}
        >
          Mykonos
        </span>
        <span
          className={cn(
            'font-mono uppercase transition-all duration-500',
            invert ? 'text-mist' : 'text-ash',
            compact ? 'mt-1 text-[0.46rem] tracking-[0.42em]' : 'mt-1.5 text-[0.5rem] tracking-[0.52em]',
          )}
        >
          Parfum
        </span>
      </span>
    </Link>
  );
}
