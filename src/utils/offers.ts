import type { Offer, Product } from '@/types';
import { discountPercent, effectivePrice } from './format';

export function activeOfferForProduct(
  productId: string,
  offers: Offer[],
  now = Date.now(),
): Offer | undefined {
  return offers
    .filter((offer) => offer.productId === productId && offer.active && offer.endsAt > now)
    .sort((a, b) => a.promoPrice - b.promoPrice || a.endsAt - b.endsAt)[0];
}

export function applyActiveOffer(product: Product, offers: Offer[], now = Date.now()): Product {
  const offer = activeOfferForProduct(product.id, offers, now);
  return offer ? { ...product, promoPrice: offer.promoPrice, dailyOffer: true } : product;
}

/**
 * Vitrine de ofertas: produtos marcados como "Oferta do Dia" no cadastro,
 * mais as janelas promocionais ativas da coleção `offers`, que sobrescrevem
 * o preço do produto enquanto valem.
 */
export function resolveDailyOffers(products: Product[], offers: Offer[] = []): Product[] {
  const now = Date.now();

  return products
    .map((product) => applyActiveOffer(product, offers, now))
    .filter((product) => product.active && product.dailyOffer)
    .sort((a, b) => (discountPercent(b.price, b.promoPrice) ?? 0) - (discountPercent(a.price, a.promoPrice) ?? 0));
}

export function biggestDiscount(products: Product[]): number {
  return products.reduce((max, product) => Math.max(max, discountPercent(product.price, product.promoPrice) ?? 0), 0);
}

export function totalSavings(products: Product[]): number {
  return products.reduce(
    (sum, product) => sum + (product.price - effectivePrice(product.price, product.promoPrice)),
    0,
  );
}
