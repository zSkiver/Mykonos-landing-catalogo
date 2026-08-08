import { isSupabaseEnabled, loadSupabase } from '@/supabase/client';
import { TABLES } from '@/supabase/tables';
import type { AppUser, UserRole } from '@/types';
import { readCollection, readLocal, writeCollection, writeLocal } from './local-db';

const SESSION_KEY = 'session';

export class AuthError extends Error {}

const localUsers = () => readCollection<AppUser>(TABLES.profiles, []);

async function loadProfile(uid: string): Promise<AppUser> {
  const client = await loadSupabase();
  const { data, error } = await client.from(TABLES.profiles).select('*').eq('uid', uid).maybeSingle();
  if (error) throw error;
  if (!data) throw new AuthError('Seu acesso ainda não foi liberado. Fale com o administrador.');
  return data as AppUser;
}

export async function signIn(email: string, password: string): Promise<AppUser> {
  if (!isSupabaseEnabled) {
    void email;
    void password;
    throw new AuthError('Painel indisponível sem Supabase configurado.');
  }

  const client = await loadSupabase();
  const { data, error } = await client.auth.signInWithPassword({ email: email.trim(), password });
  if (error || !data.user) throw new AuthError(error?.message ?? 'Não foi possível entrar.');
  const profile = await loadProfile(data.user.id);
  if (!profile.active) {
    await client.auth.signOut();
    throw new AuthError('Este acesso foi desativado. Fale com o administrador.');
  }
  return profile;
}

export async function signOut(): Promise<void> {
  if (!isSupabaseEnabled) {
    writeLocal<AppUser | null>(SESSION_KEY, null);
    return;
  }
  const client = await loadSupabase();
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

export function observeSession(callback: (user: AppUser | null) => void): () => void {
  if (!isSupabaseEnabled) {
    callback(readLocal<AppUser | null>(SESSION_KEY, null));
    return () => {};
  }

  // O SDK chega de forma assíncrona, então a inscrição pode ser cancelada
  // antes de existir — daí a bandeira.
  let cancelled = false;
  let unsubscribe: (() => void) | null = null;

  void loadSupabase()
    .then((client) => {
      if (cancelled) return;
      const { data } = client.auth.onAuthStateChange((_event, session) => {
        if (!session?.user) {
          callback(null);
          return;
        }
        void loadProfile(session.user.id)
          .then((profile) => callback(profile.active ? profile : null))
          .catch(() => callback(null));
      });
      unsubscribe = () => data.subscription.unsubscribe();
    })
    .catch(() => callback(null));

  return () => {
    cancelled = true;
    unsubscribe?.();
  };
}

export async function listUsers(): Promise<AppUser[]> {
  if (!isSupabaseEnabled) return localUsers();
  const client = await loadSupabase();
  const { data, error } = await client.from(TABLES.profiles).select('*').order('createdAt');
  if (error) throw error;
  return (data ?? []) as AppUser[];
}

async function patchUser(uid: string, changes: Partial<AppUser>): Promise<void> {
  if (!isSupabaseEnabled) {
    writeCollection(TABLES.profiles, localUsers().map((user) => (user.uid === uid ? { ...user, ...changes } : user)));
    return;
  }
  const client = await loadSupabase();
  const { error } = await client.from(TABLES.profiles).update(changes).eq('uid', uid);
  if (error) throw error;
}

export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
  await patchUser(uid, { role });
}

export async function setUserActive(uid: string, active: boolean): Promise<void> {
  await patchUser(uid, { active });
}

export async function deleteUserProfile(uid: string): Promise<void> {
  if (!isSupabaseEnabled) {
    writeCollection(TABLES.profiles, localUsers().filter((user) => user.uid !== uid));
    return;
  }
  const client = await loadSupabase();
  const { error } = await client.from(TABLES.profiles).delete().eq('uid', uid);
  if (error) throw error;
}
