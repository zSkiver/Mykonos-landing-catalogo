const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
});

const compact = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 });

export function formatPrice(value: number): string {
  return brl.format(value);
}

export function formatCompact(value: number): string {
  return compact.format(value);
}

export function formatVolume(ml: number): string {
  return `${ml} ml`;
}

/** Preço efetivo: promocional quando existir e for realmente menor. */
export function effectivePrice(price: number, promoPrice?: number): number {
  return promoPrice && promoPrice > 0 && promoPrice < price ? promoPrice : price;
}

export function discountPercent(price: number, promoPrice?: number): number | null {
  if (!promoPrice || promoPrice <= 0 || promoPrice >= price) return null;
  return Math.round(((price - promoPrice) / price) * 100);
}

export function installments(value: number, max = 6): string {
  const parts = Math.min(max, Math.max(1, Math.floor(value / 30)));
  return `${parts}x de ${brl.format(value / parts)} sem juros`;
}

/** Meia-noite seguinte no fuso local — fim natural de uma "oferta do dia". */
export function endOfToday(from = new Date()): number {
  const end = new Date(from);
  end.setHours(24, 0, 0, 0);
  return end.getTime();
}

export function padTwo(value: number): string {
  return String(Math.max(0, value)).padStart(2, '0');
}
