import type { ReactNode } from 'react';
import { BADGE_LABEL, type BadgeKind, type Product } from '@/types';
import { cn } from '@/utils/cn';

const TONE: Record<BadgeKind, string> = {
  oferta: 'bg-aegean text-chalk',
  novo: 'bg-chalk text-ink',
  exclusivo: 'bg-ink text-chalk',
  'mais-vendido': 'bg-chalk/85 text-ink backdrop-blur-sm',
};

export function Badge({
  kind,
  children,
  className,
}: {
  kind: BadgeKind;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.16em]',
        TONE[kind],
        className,
      )}
    >
      {children ?? BADGE_LABEL[kind]}
    </span>
  );
}

/** Um selo por card: oferta vence novo, que vence mais vendido. */
export function primaryBadge(product: Product): BadgeKind | null {
  if (product.dailyOffer || product.promoPrice) return 'oferta';
  if (product.isNew) return 'novo';
  if (product.exclusive) return 'exclusivo';
  if (product.bestSeller) return 'mais-vendido';
  return null;
}
