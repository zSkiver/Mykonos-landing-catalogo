import { discountPercent, effectivePrice, formatPrice, installments } from '@/utils/format';
import { cn } from '@/utils/cn';

interface Props {
  price: number;
  promoPrice?: number;
  size?: 'sm' | 'md' | 'lg';
  showInstallments?: boolean;
  invert?: boolean;
  className?: string;
}

const SIZE = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-3xl',
} as const;

/** Preços sempre em mono tabular — mesma largura de dígito em toda a loja. */
export function Price({ price, promoPrice, size = 'md', showInstallments, invert, className }: Props) {
  const current = effectivePrice(price, promoPrice);
  const discount = discountPercent(price, promoPrice);

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {discount !== null && (
        <div className="flex items-baseline gap-2.5">
          <s className={cn('numeric text-xs', invert ? 'text-mist' : 'text-ash')}>
            {formatPrice(price)}
          </s>
          <span
            className={cn(
              'numeric text-[0.68rem] font-medium',
              invert ? 'text-chalk' : 'text-aegean',
            )}
          >
            −{discount}%
          </span>
        </div>
      )}

      <span className={cn('numeric font-medium', SIZE[size], invert ? 'text-chalk' : 'text-ink')}>
        {formatPrice(current)}
      </span>

      {showInstallments && (
        <span className={cn('text-xs', invert ? 'text-mist' : 'text-stone')}>
          {installments(current)}
        </span>
      )}
    </div>
  );
}
