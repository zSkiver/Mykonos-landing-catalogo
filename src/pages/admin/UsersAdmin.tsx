import { useCallback, useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Select } from '@/components/admin/Field';
import { useAuth } from '@/contexts/AuthContext';
import {
  deleteUserProfile,
  listUsers,
  setUserActive,
  updateUserRole,
} from '@/services/auth.service';
import { isSupabaseEnabled } from '@/supabase/client';
import { ROLE_LABEL, type AppUser, type UserRole } from '@/types';
import { cn } from '@/utils/cn';

export default function UsersAdmin() {
  const { user: current } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setUsers(await listUsers());
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    try {
      await action();
      await load();
    } finally {
      setBusy(false);
    }
  };

  const remove = (target: AppUser) => {
    if (target.uid === current?.uid) return;
    if (!window.confirm(`Remover o acesso de ${target.name}?`)) return;
    void run(() => deleteUserProfile(target.uid));
  };

  return (
    <div className="space-y-6 pb-16">
      <AdminHeader
        title="Usuários"
        description="Administradores editam tudo; funcionários cadastram e atualizam produtos."
      />

      <div className="rounded-2xl bg-chalk p-6 ring-1 ring-salt">
        <h2 className="font-display text-lg text-ink">Como criar um acesso</h2>
        <p className="mt-2 text-sm leading-relaxed text-stone">
          {isSupabaseEnabled
            ? 'Crie a conta no Supabase em Authentication > Users. No primeiro acesso, o perfil aparece aqui como funcionário; então você pode promover a administrador.'
            : 'Enquanto o Supabase não estiver configurado, as contas de demonstração são as únicas disponíveis e as alterações ficam apenas neste navegador.'}
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl ring-1 ring-salt">
        <table className="w-full min-w-[44rem] border-collapse text-left">
          <thead>
            <tr className="bg-limewash">
              {['Usuário', 'Papel', 'Situação', ''].map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="px-4 py-3.5 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-ash"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className={cn('divide-y divide-salt', busy && 'opacity-60')}>
            {users.map((item) => {
              const isSelf = item.uid === current?.uid;
              return (
                <tr key={item.uid}>
                  <td className="px-4 py-3.5">
                    <p className="text-sm text-ink">
                      {item.name}
                      {isSelf && <span className="ml-2 text-[0.65rem] text-aegean">você</span>}
                    </p>
                    <p className="text-xs text-ash">{item.email}</p>
                  </td>

                  <td className="px-4 py-3.5">
                    <Select
                      value={item.role}
                      disabled={isSelf}
                      aria-label={`Papel de ${item.name}`}
                      onChange={(event) =>
                        void run(() => updateUserRole(item.uid, event.target.value as UserRole))
                      }
                      className="w-52"
                    >
                      {(Object.keys(ROLE_LABEL) as UserRole[]).map((role) => (
                        <option key={role} value={role}>
                          {ROLE_LABEL[role]}
                        </option>
                      ))}
                    </Select>
                  </td>

                  <td className="px-4 py-3.5">
                    <button
                      type="button"
                      disabled={isSelf}
                      onClick={() => void run(() => setUserActive(item.uid, !item.active))}
                      className={cn(
                        'rounded-full border px-3 py-1 font-mono text-[0.55rem] uppercase tracking-[0.14em] transition-colors disabled:opacity-40',
                        item.active
                          ? 'border-aegean text-aegean'
                          : 'border-salt text-ash hover:text-stone',
                      )}
                    >
                      {item.active ? 'Ativo' : 'Desativado'}
                    </button>
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <button
                      type="button"
                      disabled={isSelf}
                      onClick={() => remove(item)}
                      aria-label={`Remover ${item.name}`}
                      className="grid size-9 place-items-center rounded-md text-stone transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-stone"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {users.length === 0 && (
          <p className="px-6 py-14 text-center text-sm text-ash">Nenhum usuário cadastrado ainda.</p>
        )}
      </div>
    </div>
  );
}
