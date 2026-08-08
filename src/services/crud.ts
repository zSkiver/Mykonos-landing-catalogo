import { isSupabaseEnabled, loadSupabase } from '@/supabase/client';
import type { TableName } from '@/supabase/tables';
import { readCollection, readLocal, writeCollection, writeLocal } from './local-db';
import { randomId } from '@/utils/slug';

interface Identified {
  id: string;
}

/** CRUD para coleções simples, alternando entre Supabase e armazenamento local. */
export function createCrudService<T extends Identified>(
  name: TableName,
  seed: T[],
  sort?: (a: T, b: T) => number,
) {
  const order = (items: T[]) => (sort ? [...items].sort(sort) : items);
  const local = () => readCollection<T>(name, seed);

  async function list(): Promise<T[]> {
    if (!isSupabaseEnabled) return order(local());

    const client = await loadSupabase();
    const { data, error } = await client.from(name).select('*');
    if (error) throw error;
    return order((data ?? []) as T[]);
  }

  async function create(input: Omit<T, 'id'>): Promise<T> {
    const item = { ...input, id: randomId(name) } as T;
    if (!isSupabaseEnabled) {
      writeCollection(name, [...local(), item]);
      return item;
    }

    const client = await loadSupabase();
    const { error } = await client.from(name).insert(item);
    if (error) throw error;
    return item;
  }

  async function update(id: string, patch: Partial<Omit<T, 'id'>>): Promise<void> {
    if (!isSupabaseEnabled) {
      writeCollection(name, local().map((item) => (item.id === id ? { ...item, ...patch } : item)));
      return;
    }

    const client = await loadSupabase();
    const { error } = await client.from(name).update(patch as never).eq('id', id);
    if (error) throw error;
  }

  async function remove(id: string): Promise<void> {
    if (!isSupabaseEnabled) {
      writeCollection(name, local().filter((item) => item.id !== id));
      return;
    }

    const client = await loadSupabase();
    const { error } = await client.from(name).delete().eq('id', id);
    if (error) throw error;
  }

  return { list, create, update, remove };
}

/** Registro único, usado pelas configurações da loja. */
export function createSingletonService<T extends Identified>(name: TableName, id: string, seed: T) {
  const localKey = `${name}:${id}`;

  async function get(): Promise<T> {
    if (!isSupabaseEnabled) return readLocal<T>(localKey, seed);

    const client = await loadSupabase();
    const { data, error } = await client.from(name).select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return (data as T | null) ?? seed;
  }

  async function save(patch: Partial<Omit<T, 'id'>>): Promise<T> {
    if (!isSupabaseEnabled) {
      return writeLocal(localKey, { ...readLocal<T>(localKey, seed), ...patch } as T);
    }

    const item = { ...seed, ...patch, id } as T;
    const client = await loadSupabase();
    const { error } = await client.from(name).upsert(item);
    if (error) throw error;
    return item;
  }

  return { get, save };
}
