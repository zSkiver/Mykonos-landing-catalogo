import type { Product, ProductVariant } from '@/types';
import { cheapestVariant } from './variants';
import { effectivePrice, formatPrice, formatVolume } from './format';

const FALLBACK_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER ?? '5564992970843';

let runtimeNumber = FALLBACK_NUMBER;

/** As configurações da loja (Firestore) sobrescrevem o número do .env. */
export function setWhatsappNumber(value: string | undefined | null): void {
  const digits = (value ?? '').replace(/\D/g, '');
  runtimeNumber = digits.length >= 10 ? digits : FALLBACK_NUMBER;
}

export function whatsappNumber(): string {
  return runtimeNumber.replace(/\D/g, '');
}

/** Exibe o número no padrão brasileiro: +55 (11) 99999-9999 */
export function formatWhatsappNumber(raw = whatsappNumber()): string {
  const m = raw.match(/^(\d{2})(\d{2})(\d{4,5})(\d{4})$/);
  if (!m) return `+${raw}`;
  return `+${m[1]} (${m[2]}) ${m[3]}-${m[4]}`;
}

export function whatsappLink(message: string): string {
  return `https://wa.me/${whatsappNumber()}?text=${encodeURIComponent(message)}`;
}

/** Mensagem genérica, usada nos CTAs de seção. */
export function generalMessage(context?: string): string {
  return context
    ? `Olá, Mykonos Parfum! Vim pelo site e quero falar sobre ${context}.`
    : 'Olá, Mykonos Parfum! Vim pelo site e quero atendimento de um especialista.';
}

/**
 * Mensagem de produto: leva marca, volume e preço para que o atendente já
 * abra a conversa sabendo exatamente do que se trata.
 */
/**
 * A mensagem carrega a apresentação escolhida. Sem isso o atendente teria de
 * perguntar "50 ou 100 ml?" logo na primeira resposta — atrito bobo justamente
 * no momento em que a pessoa já decidiu comprar.
 */
export function productMessage(
  product: Product,
  extra?: string,
  variant?: ProductVariant,
): string {
  const chosen = variant ?? cheapestVariant(product);
  const price = effectivePrice(chosen.price, chosen.promoPrice);

  const lines = [
    `Olá, Mykonos Parfum! Quero este perfume:`,
    ``,
    `• ${product.name} — ${product.brand}`,
    `• ${formatVolume(chosen.volumeMl)} · ${formatPrice(price)}`,
  ];
  if (extra) lines.push('', extra);
  return lines.join('\n');
}

export function offerMessage(product: Product): string {
  return productMessage(product, 'Vi na Oferta do Dia e quero garantir antes de acabar.');
}

export function specialistMessage(): string {
  return 'Olá, Mykonos Parfum! Gostaria da ajuda de um especialista para escolher uma fragrância.';
}
