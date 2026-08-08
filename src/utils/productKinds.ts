import type { Product, ProductKind } from '@/types';

/**
 * A categoria já diz que tipo de produto é aquilo: quem está em
 * "perfumes-arabes" é, por definição, um perfume árabe. Manter os dois campos
 * como perguntas separadas no formulário criava duas fontes de verdade que
 * podiam discordar — e um produto cadastrado na categoria certa com o tipo
 * errado desaparece do filtro sem ninguém entender por quê.
 *
 * Aqui a categoria manda e o tipo é derivado dela.
 */
const KIND_BY_CATEGORY: Record<string, ProductKind> = {
  'perfumes-importados': 'importado',
  'perfumes-nacionais': 'nacional',
  'perfumes-arabes': 'arabe',
  'body-splash': 'body-splash',
  'kit-perfumes': 'kit',
  cosmeticos: 'cosmetico',
  skincare: 'skincare',
};

/**
 * "Novidades" é vitrine, não prateleira: cabe qualquer produto dentro, então a
 * categoria não determina o tipo. Nesses casos devolvemos `null` e o formulário
 * volta a perguntar. Vale também para categorias que a loja criar depois.
 */
export function kindForCategory(categorySlug: string): ProductKind | null {
  return KIND_BY_CATEGORY[categorySlug] ?? null;
}

/**
 * O que se compra pelo cheiro. Só esses produtos têm pirâmide olfativa,
 * fixação e projeção — shampoo e hidratante não têm nota de saída.
 */
const SCENTED = new Set<ProductKind>(['importado', 'nacional', 'arabe', 'body-splash', 'kit']);

export function isScented(kind: ProductKind): boolean {
  return SCENTED.has(kind);
}

/**
 * Uma pirâmide existe, mas com as três listas vazias, continua sendo objeto —
 * e um `product.pyramid &&` deixaria a seção inteira aparecer em branco.
 */
export function hasPyramid(product: Pick<Product, 'pyramid'>): boolean {
  const pyramid = product.pyramid;
  if (!pyramid) return false;
  return pyramid.top.length > 0 || pyramid.heart.length > 0 || pyramid.base.length > 0;
}
