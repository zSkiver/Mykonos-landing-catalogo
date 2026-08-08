import type { ReactNode } from 'react';
import { Reveal } from './Reveal';
import { cn } from '@/utils/cn';

export type SectionTone = 'chalk' | 'limewash' | 'aegean' | 'abyss';

const TONES: Record<SectionTone, string> = {
  chalk: 'bg-chalk text-ink',
  limewash: 'bg-limewash text-ink',
  aegean: 'bg-aegean text-chalk',
  abyss: 'bg-abyss text-chalk',
};

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  tone?: SectionTone;
  /** Remove o container central — para blocos que sangram até a borda. */
  bleed?: boolean;
}

export function Section({ id, children, className, tone = 'chalk', bleed }: SectionProps) {
  return (
    <section id={id} className={cn('relative scroll-mt-24', TONES[tone], className)}>
      {bleed ? children : <div className="shell py-20 md:py-28">{children}</div>}
    </section>
  );
}

interface HeaderProps {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  action?: ReactNode;
  invert?: boolean;
}

/**
 * Cabeçalho de seção: rótulo em mono, título em Bodoni minúsculo e o texto de
 * apoio à direita. A minúscula na didone é o que separa a loja das outras.
 */
export function SectionHeader({ eyebrow, title, lead, action, invert }: HeaderProps) {
  return (
    <Reveal as="header" className="mb-14 md:mb-20">
      <p className={cn('eyebrow', invert ? 'text-mist' : 'text-aegean')}>{eyebrow}</p>

      <div className="mt-7 grid gap-8 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md:items-end md:gap-14">
        <h2 className="text-balance lowercase text-[2.5rem] leading-[0.98] md:text-6xl lg:text-[4.25rem]">
          {title}
        </h2>

        {(lead || action) && (
          <div className="flex flex-col items-start gap-7 md:items-end">
            {lead && (
              <p
                className={cn(
                  'max-w-md text-pretty leading-relaxed md:text-right',
                  invert ? 'text-mist' : 'text-stone',
                )}
              >
                {lead}
              </p>
            )}
            {action}
          </div>
        )}
      </div>
    </Reveal>
  );
}
