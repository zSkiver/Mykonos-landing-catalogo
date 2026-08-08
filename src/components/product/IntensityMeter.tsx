import { INTENSITY_LABEL, INTENSITY_SCALE, type Intensity } from '@/types';
import { cn } from '@/utils/cn';

/** Fixação e projeção em quatro degraus — comparável entre produtos. */
export function IntensityMeter({ label, value }: { label: string; value: Intensity }) {
  const level = INTENSITY_SCALE.indexOf(value) + 1;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ash">{label}</span>
        <span className="text-sm text-ink">{INTENSITY_LABEL[value]}</span>
      </div>
      <div
        className="mt-3 flex gap-1"
        role="meter"
        aria-valuenow={level}
        aria-valuemin={1}
        aria-valuemax={INTENSITY_SCALE.length}
        aria-label={`${label}: ${INTENSITY_LABEL[value]}`}
      >
        {INTENSITY_SCALE.map((step, index) => (
          <span key={step} className={cn('h-0.5 flex-1', index < level ? 'bg-aegean' : 'bg-salt')} />
        ))}
      </div>
    </div>
  );
}
