import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  type CatalogFilters,
  type Gender,
  type Product,
  type ProductKind,
  type SortKey,
} from '@/types';
import { startingPrice } from '@/utils/variants';

const KINDS: ProductKind[] = ['importado', 'nacional', 'arabe', 'body-splash', 'cosmetico', 'skincare', 'kit'];
const GENDERS: Gender[] = ['masculino', 'feminino', 'unissex'];
const SORTS: SortKey[] = ['relevancia', 'preco-asc', 'preco-desc', 'novidades', 'nome'];

function num(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function oneOf<T extends string>(value: string | null, allowed: T[]): T | null {
  return value && (allowed as string[]).includes(value) ? (value as T) : null;
}

/** Filtros do catálogo espelhados na query string — a URL é compartilhável. */
export function useCatalogFilters(categoryFromRoute?: string) {
  const [params, setParams] = useSearchParams();

  const filters = useMemo<CatalogFilters>(
    () => ({
      search: params.get('q') ?? '',
      category: categoryFromRoute ?? params.get('categoria'),
      brand: params.get('marca'),
      kind: oneOf(params.get('tipo'), KINDS),
      gender: oneOf(params.get('genero'), GENDERS),
      minPrice: num(params.get('min')),
      maxPrice: num(params.get('max')),
      onlyOffers: params.get('ofertas') === '1',
      sort: oneOf(params.get('ordem'), SORTS) ?? 'relevancia',
    }),
    [params, categoryFromRoute],
  );

  const setFilter = useCallback(
    <K extends keyof CatalogFilters>(key: K, value: CatalogFilters[K]) => {
      const next = new URLSearchParams(params);
      const paramName: Record<keyof CatalogFilters, string> = {
        search: 'q',
        category: 'categoria',
        brand: 'marca',
        kind: 'tipo',
        gender: 'genero',
        minPrice: 'min',
        maxPrice: 'max',
        onlyOffers: 'ofertas',
        sort: 'ordem',
      };

      const name = paramName[key];
      const isEmpty =
        value === null || value === '' || value === false || (key === 'sort' && value === 'relevancia');

      if (isEmpty) next.delete(name);
      else next.set(name, value === true ? '1' : String(value));

      setParams(next, { replace: true, preventScrollReset: true });
    },
    [params, setParams],
  );

  const clear = useCallback(() => {
    setParams(new URLSearchParams(), { replace: true, preventScrollReset: true });
  }, [setParams]);

  const activeCount = useMemo(() => {
    let count = 0;
    if (filters.search) count += 1;
    if (filters.category && !categoryFromRoute) count += 1;
    if (filters.brand) count += 1;
    if (filters.kind) count += 1;
    if (filters.gender) count += 1;
    if (filters.minPrice !== null || filters.maxPrice !== null) count += 1;
    if (filters.onlyOffers) count += 1;
    return count;
  }, [filters, categoryFromRoute]);

  return { filters, setFilter, clear, activeCount };
}

function matches(product: Product, filters: CatalogFilters): boolean {
  if (!product.active) return false;
  if (filters.category && product.categorySlug !== filters.category) {
    // "Novidades" é uma vitrine, não uma categoria física do produto.
    if (!(filters.category === 'novidades' && product.isNew)) return false;
  }
  if (filters.brand && product.brandSlug !== filters.brand) return false;
  if (filters.kind && product.kind !== filters.kind) return false;
  if (filters.gender && product.gender !== filters.gender) return false;
  if (filters.onlyOffers && !product.dailyOffer && !product.promoPrice) return false;

  // Com varias apresentacoes, o filtro considera a mais barata.
  const price = startingPrice(product);
  if (filters.minPrice !== null && price < filters.minPrice) return false;
  if (filters.maxPrice !== null && price > filters.maxPrice) return false;

  if (filters.search) {
    const haystack = [
      product.name,
      product.brand,
      product.description,
      product.olfactoryFamily ?? '',
      ...(product.pyramid ? [...product.pyramid.top, ...product.pyramid.heart, ...product.pyramid.base] : []),
    ]
      .join(' ')
      .toLowerCase();

    const terms = filters.search.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.every((term) => haystack.includes(term))) return false;
  }

  return true;
}

/** Relevância = destaque, depois oferta e mais vendido. */
function relevance(product: Product): number {
  return (
    (product.featured ? 8 : 0) +
    (product.dailyOffer ? 4 : 0) +
    (product.bestSeller ? 3 : 0) +
    (product.isNew ? 2 : 0)
  );
}

export function applyFilters(products: Product[], filters: CatalogFilters): Product[] {
  const result = products.filter((product) => matches(product, filters));

  switch (filters.sort) {
    case 'preco-asc':
      return result.sort(
        (a, b) => startingPrice(a) - startingPrice(b),
      );
    case 'preco-desc':
      return result.sort(
        (a, b) => startingPrice(b) - startingPrice(a),
      );
    case 'novidades':
      return result.sort((a, b) => b.createdAt - a.createdAt);
    case 'nome':
      return result.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    default:
      return result.sort((a, b) => relevance(b) - relevance(a) || b.createdAt - a.createdAt);
  }
}

export function priceBounds(products: Product[]): { min: number; max: number } {
  if (products.length === 0) return { min: 0, max: 1000 };
  const prices = products.map(startingPrice);
  return {
    min: Math.floor(Math.min(...prices) / 10) * 10,
    max: Math.ceil(Math.max(...prices) / 10) * 10,
  };
}
