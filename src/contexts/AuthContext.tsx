import { createContext, use, useEffect, useMemo, useState, type ReactNode } from 'react';
import { permissionsFor, type AppUser, type Permissions } from '@/types';
import { observeSession, signIn, signOut } from '@/services/auth.service';

interface AuthValue {
  user: AppUser | null;
  permissions: Permissions;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = observeSession((next) => {
      setUser(next);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      permissions: permissionsFor(user?.role ?? null),
      loading,
      login: async (email, password) => {
        setUser(await signIn(email, password));
      },
      logout: async () => {
        await signOut();
        setUser(null);
      },
    }),
    [user, loading],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthValue {
  const context = use(AuthContext);
  if (!context) throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  return context;
}
