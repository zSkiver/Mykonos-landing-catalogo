import { SEED_PRODUCTS } from '@/data/seed';
import { isSupabaseEnabled, loadSupabase } from '@/supabase/client';
import { TABLES } from '@/supabase/tables';
import type { Product, ProductInput } from '@/types';
import { readCollection, writeCollection } from './local-db';
import { randomId, uniqueSlug } from '@/utils/slug';

const STORE = TABLES.products;
const local = () => readCollection<Product>(STORE, SEED_PRODUCTS);

export async function listProducts(): Promise<Product[]> {
  if (!isSupabaseEnabled) return [...local()].sort((a, b) => b.createdAt - a.createdAt);

  const client = await loadSupabase();
  const { data, error } = await client.from(STORE).select('*').order('createdAt', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function listActiveProducts(): Promise<Product[]> {
  return (await listProducts()).filter((product) => product.active);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseEnabled) return local().find((product) => product.slug === slug) ?? null;

  const client = await loadSupabase();
  const { data, error } = await client.from(STORE).select('*').eq('slug', slug).maybeSingle();
  if (error) throw error;
  return data as Product | null;
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!isSupabaseEnabled) return local().find((product) => product.id === id) ?? null;

  const client = await loadSupabase();
  const { data, error } = await client.from(STORE).select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Product | null;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const existing = await listProducts();
  const slug = uniqueSlug(input.slug || `${input.brand}-${input.name}`, existing.map((product) => product.slug));
  const stamps = { createdAt: Date.now(), updatedAt: Date.now() };
  const product: Product = { ...input, slug, id: randomId('prod'), ...stamps };

  if (!isSupabaseEnabled) {
    writeCollection(STORE, [product, ...existing]);
    return product;
  }

  const client = await loadSupabase();
  const { error } = await client.from(STORE).insert(product);
  if (error) throw error;
  return product;
}

export async function updateProduct(id: string, patch: Partial<ProductInput>): Promise<void> {
  const changes = { ...patch, updatedAt: Date.now() };
  if (!isSupabaseEnabled) {
    writeCollection(STORE, local().map((product) => (product.id === id ? { ...product, ...changes } : product)));
    return;
  }

  const client = await loadSupabase();
  const { error } = await client.from(STORE).update(changes).eq('id', id);
  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  if (!isSupabaseEnabled) {
    writeCollection(STORE, local().filter((product) => product.id !== id));
    return;
  }

  const client = await loadSupabase();
  const { error } = await client.from(STORE).delete().eq('id', id);
  if (error) throw error;
}

export async function setDailyOffer(id: string, dailyOffer: boolean): Promise<void> {
  await updateProduct(id, { dailyOffer });
}
