import type { SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Só a checagem das variáveis — não puxa o SDK, pode ser lida na renderização. */
export const isSupabaseEnabled = Boolean(url && key);

/**
 * O SDK do Supabase pesa cerca de 120 kB minificado. Carregamos sob demanda
 * para que a vitrine — lida por visitantes anônimos — não pague por ele antes
 * da primeira consulta.
 */
let clientPromise: Promise<SupabaseClient> | null = null;

export function loadSupabase(): Promise<SupabaseClient> {
  if (!isSupabaseEnabled) {
    return Promise.reject(
      new Error('Supabase não configurado. Preencha VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.'),
    );
  }

  clientPromise ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(url as string, key as string, {
      auth: { persistSession: true, autoRefreshToken: true },
    }),
  );

  return clientPromise;
}
