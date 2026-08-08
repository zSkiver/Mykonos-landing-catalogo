import { Link } from 'react-router-dom';
import { Badge, primaryBadge } from '@/components/common/Badge';
import { Price } from '@/components/common/Price';
import { GENDER_LABEL, type Product } from '@/types';
import { formatVolume } from '@/utils/format';
import { productMessage, whatsappLink } from '@/utils/whatsapp';
import { cheapestVariant, productVariants } from '@/utils/variants';
import { cn } from '@/utils/cn';

interface Props {
  product: Product;
  priority?: boolean;
  className?: string;
}

export function ProductCard({ product, priority, className }: Props) {
  const badge = primaryBadge(product);
  const [cover, hoverImage] = product.images;

  // Com vários tamanhos a listagem ancora no mais barato e anuncia isso.
  const sizes = productVariants(product);
  const entry = cheapestVariant(product);
  const multiple = sizes.length > 1;

  return (
    <article className={cn('group flex flex-col', className)}>
      <Link
        to={`/produto/${product.slug}`}
        className="relative block aspect-4/5 overflow-hidden bg-limewash"
      >
        <img
          src={cover}
          alt={`${product.name} — ${product.brand}`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={cn(
            'size-full object-cover transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]',
            hoverImage ? 'group-hover:opacity-0' : 'group-hover:scale-105',
          )}
        />
        {hoverImage && (
          <img
            src={hoverImage}
            alt=""
            loading="lazy"
            decoding="async"
            aria-hidden
            className="absolute inset-0 size-full scale-105 object-cover opacity-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-100 group-hover:opacity-100"
          />
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          {badge ? <Badge kind={badge} /> : <span />}
        </div>
      </Link>

      <div className="flex flex-1 flex-col pt-5">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-ash">{product.brand}</p>

        <h3 className="mt-2.5 font-display text-xl leading-snug">
          <Link
            to={`/produto/${product.slug}`}
            className="text-ink transition-colors duration-300 hover:text-aegean"
          >
            {product.name}
          </Link>
        </h3>

        <p className="numeric mt-2 text-[0.68rem] uppercase tracking-[0.12em] text-ash">
          {sizes.map((size) => formatVolume(size.volumeMl)).join(' · ')} ·{' '}
          {GENDER_LABEL[product.gender]}
        </p>

        <div className="mt-auto pt-5">
          {multiple && (
            <p className="mb-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-ash">
              A partir de
            </p>
          )}
          <Price price={entry.price} promoPrice={entry.promoPrice} size="sm" />

          <a
            href={whatsappLink(productMessage(product, undefined, entry))}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Comprar ${product.name} pelo WhatsApp`}
            className="btn-primary mt-4 flex h-10 items-center justify-center rounded-full border border-ink/20 text-[0.8rem] font-medium text-ink hover:border-aegean hover:bg-aegean hover:text-chalk"
          >
            Quero este produto
          </a>
        </div>
      </div>
    </article>
  );
}
