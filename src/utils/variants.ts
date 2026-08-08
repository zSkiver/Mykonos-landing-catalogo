import type { Product, ProductVariant } from '@/types';
import { effectivePrice } from './format';

/**
 * Um perfume de tamanho único e um de três tamanhos são a mesma coisa aqui:
 * a apresentação padrão vira a primeira variação da lista. Assim nenhum
 * componente precisa tratar os dois casos separadamente.
 */
export function productVariants(product: Product): ProductVariant[] {
  const extra = product.variants?.filter((variant) => variant.volumeMl !== product.volumeMl) ?? [];

  const base: ProductVariant = {
    id: 'base',
    volumeMl: product.volumeMl,
    price: product.price,
    promoPrice: product.promoPrice,
  };

  return [base, ...extra].sort((a, b) => a.volumeMl - b.volumeMl);
}

export function hasMultipleSizes(product: Product): boolean {
  return productVariants(product).length > 1;
}

/** A apresentação mais barata é a que ancora o preço nas listagens. */
export function cheapestVariant(product: Product): ProductVariant {
  return productVariants(product).reduce((cheapest, variant) =>
    effectivePrice(variant.price, variant.promoPrice) <
    effectivePrice(cheapest.price, cheapest.promoPrice)
      ? variant
      : cheapest,
  );
}

/** Menor preço efetivo do produto — usado na ordenação e no filtro de faixa. */
export function startingPrice(product: Product): number {
  const variant = cheapestVariant(product);
  return effectivePrice(variant.price, variant.promoPrice);
}

export function findVariant(product: Product, variantId: string): ProductVariant {
  const variants = productVariants(product);
  return variants.find((variant) => variant.id === variantId) ?? cheapestVariant(product);
}

/** SKU legível derivado do produto e do tamanho escolhido. */
export function variantSku(product: Product, variant: ProductVariant): string {
  return `${product.slug.slice(0, 18).toUpperCase()}-${variant.volumeMl}ML`;
}

/** Todas as apresentações esgotadas significa produto indisponível. */
export function isSoldOut(product: Product): boolean {
  return productVariants(product).every((variant) => variant.soldOut === true);
}
