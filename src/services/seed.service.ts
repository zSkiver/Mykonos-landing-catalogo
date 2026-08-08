import { SEED_BRANDS, SEED_CATEGORIES, SEED_PRODUCTS, SEED_SETTINGS } from '@/data/seed';
import { isSupabaseEnabled, loadSupabase } from '@/supabase/client';
import { TABLES } from '@/supabase/tables';

/** Copia o catálogo de demonstração para um projeto Supabase recém-criado. */
export async function seedInitialStore(): Promise<void> {
  if (!isSupabaseEnabled) return;

  const client = await loadSupabase();
  const operations = [
    client.from(TABLES.categories).upsert(SEED_CATEGORIES),
    client.from(TABLES.brands).upsert(SEED_BRANDS),
    client.from(TABLES.products).upsert(SEED_PRODUCTS),
    client.from(TABLES.settings).upsert(SEED_SETTINGS),
  ];
  const results = await Promise.all(operations);
  const failure = results.find((result) => result.error)?.error;
  if (failure) throw failure;
}
