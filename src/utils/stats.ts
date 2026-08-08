import { PRODUCT_KIND_LABEL, type DashboardStats, type Product, type ProductKind } from '@/types';
import { effectivePrice } from './format';

export function buildStats(products: Product[]): DashboardStats {
  const active = products.filter((product) => product.active);
  const prices = active.map((product) => effectivePrice(product.price, product.promoPrice));

  const byKind = (Object.keys(PRODUCT_KIND_LABEL) as ProductKind[]).map((kind) => ({
    kind,
    count: active.filter((product) => product.kind === kind).length,
  }));

  return {
    totalProducts: products.length,
    activeProducts: active.length,
    dailyOffers: active.filter((product) => product.dailyOffer).length,
    averagePrice: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0,
    byKind,
  };
}
