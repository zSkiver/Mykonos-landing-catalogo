/**
 * Persistência local usada enquanto o Supabase não está configurado.
 * Mantém a mesma superfície assíncrona dos serviços do Firestore, para que
 * componentes e hooks não precisem saber qual backend está ativo.
 */

import { SEED_VERSION } from '@/data/seed';

/**
 * A versão da semente entra no prefixo das chaves. Quando `src/data/seed.ts`
 * muda de conteúdo e o número é incrementado, o navegador passa a ler um
 * espaço novo e recarrega a semente sozinho — sem isso, uma cópia antiga
 * ficaria presa no localStorage e as alterações do arquivo nunca apareceriam.
 */
const NAMESPACE = `mykonos:v${SEED_VERSION}:`;

/** Prefixos e chaves de versões anteriores, limpos na primeira leitura. */
const LEGACY_VERSION_PREFIX = /^mykonos:v\d+:/;
const LEGACY_UNVERSIONED_KEYS = new Set([
  'mykonos:brands',
  'mykonos:categories',
  'mykonos:offers',
  'mykonos:products',
  'mykonos:profiles',
  'mykonos:settings:store',
]);

function key(name: string): string {
  return `${NAMESPACE}${name}`;
}

function dropStaleVersions(): void {
  if (typeof window === 'undefined') return;
  Object.keys(window.localStorage)
    .filter(
      (k) =>
        !k.startsWith(NAMESPACE) &&
        (LEGACY_VERSION_PREFIX.test(k) || LEGACY_UNVERSIONED_KEYS.has(k)),
    )
    .forEach((k) => window.localStorage.removeItem(k));
}

dropStaleVersions();

export function readLocal<T>(name: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key(name));
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeLocal<T>(name: string, value: T): T {
  if (typeof window === 'undefined') return value;
  try {
    window.localStorage.setItem(key(name), JSON.stringify(value));
  } catch {
    // Cota estourada (imagens em base64, por exemplo) — segue sem persistir.
  }
  return value;
}

/** Lê a coleção; na primeira execução grava a semente para que edições persistam. */
export function readCollection<T>(name: string, seed: T[]): T[] {
  const stored = readLocal<T[] | null>(name, null);
  if (stored) return stored;
  return writeLocal(name, seed);
}

export function writeCollection<T>(name: string, items: T[]): T[] {
  return writeLocal(name, items);
}

export function resetLocal(): void {
  if (typeof window === 'undefined') return;
  Object.keys(window.localStorage)
    .filter((k) => k.startsWith(NAMESPACE))
    .forEach((k) => window.localStorage.removeItem(k));
}
