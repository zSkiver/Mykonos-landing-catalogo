import type { Product, ProductVariant } from '@/types';
import { discountPercent, effectivePrice, formatPrice } from '@/utils/format';
import { productVariants } from '@/utils/variants';
import { cn } from '@/utils/cn';

interface Props {
  product: Product;
  selectedId: string;
  onSelect: (variant: ProductVariant) => void;
}

/**
 * Escolha da apresentação. Cada opção já mostra o próprio preço — esconder o
 * valor atrás do clique obriga a pessoa a testar os tamanhos um por um só para
 * descobrir quanto custa.
 */
export function VolumePicker({ product, selectedId, onSelect }: Props) {
  const variants = productVariants(product);
  if (variants.length < 2) return null;

  return (
    <fieldset className="mt-9">
      <legend className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ash">
        Tamanho
      </legend>

      <div className="mt-3.5 flex flex-wrap gap-2.5">
        {variants.map((variant) => {
          const selected = variant.id === selectedId;
          const price = effectivePrice(variant.price, variant.promoPrice);
          const discount = discountPercent(variant.price, variant.promoPrice);

          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => onSelect(variant)}
              disabled={variant.soldOut}
              aria-pressed={selected}
              className={cn(
                'group relative flex min-w-28 flex-col items-start gap-1 rounded-lg border px-4 py-3 text-left transition-colors duration-300',
                selected
                  ? 'border-aegean bg-aegean text-chalk'
                  : 'border-ink/15 text-ink hover:border-ink/40',
                variant.soldOut && 'cursor-not-allowed opacity-45 hover:border-ink/15',
              )}
            >
              <span className="numeric text-sm font-medium">{variant.volumeMl} ml</span>

              <span
                className={cn(
                  'numeric text-[0.8rem]',
                  selected ? 'text-chalk/85' : 'text-stone',
                )}
              >
                {variant.soldOut ? 'Esgotado' : formatPrice(price)}
              </span>

              {discount !== null && !variant.soldOut && (
                <span
                  className={cn(
                    'numeric absolute -top-2 right-2 rounded-full px-2 py-0.5 text-[0.6rem] font-medium',
                    selected ? 'bg-chalk text-aegean' : 'bg-aegean text-chalk',
                  )}
                >
                  −{discount}%
                </span>
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
