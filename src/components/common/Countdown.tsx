import { useCountdown } from '@/hooks/useCountdown';
import { padTwo } from '@/utils/format';
import { cn } from '@/utils/cn';

interface Props {
  target: number;
  invert?: boolean;
  className?: string;
}

/** Relógio da oferta. Dígitos em mono tabular para não tremer a cada segundo. */
export function Countdown({ target, invert, className }: Props) {
  const { hours, minutes, seconds, expired } = useCountdown(target);

  if (expired) {
    return (
      <p className={cn('text-sm', invert ? 'text-mist' : 'text-stone', className)}>
        Ofertas encerradas — novas seleções amanhã.
      </p>
    );
  }

  const units = [
    { value: hours, label: 'horas' },
    { value: minutes, label: 'min' },
    { value: seconds, label: 'seg' },
  ];

  return (
    <div
      className={cn('flex items-baseline gap-4', className)}
      role="timer"
      aria-label={`Termina em ${hours} horas, ${minutes} minutos e ${seconds} segundos`}
    >
      {units.map((unit) => (
        <div key={unit.label} className="flex items-baseline gap-1.5">
          <span
            className={cn('numeric text-3xl font-medium', invert ? 'text-chalk' : 'text-ink')}
          >
            {padTwo(unit.value)}
          </span>
          <span
            className={cn(
              'font-mono text-[0.55rem] uppercase tracking-[0.2em]',
              invert ? 'text-mist' : 'text-ash',
            )}
          >
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}
