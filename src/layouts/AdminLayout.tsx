import { Suspense, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  ExternalLink,
  BadgePercent,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  Sparkles,
  Tag,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/common/Spinner';
import { ROLE_LABEL, type Permissions } from '@/types';
import { isSupabaseEnabled } from '@/supabase/client';
import { cn } from '@/utils/cn';

const LINKS: { to: string; label: string; icon: React.ElementType; require?: keyof Permissions }[] = [
  { to: '/admin', label: 'Visão geral', icon: LayoutDashboard, require: 'canViewStats' },
  { to: '/admin/produtos', label: 'Produtos', icon: Package, require: 'canEditProduct' },
  { to: '/admin/ofertas', label: 'Ofertas', icon: BadgePercent, require: 'canManageOffers' },
  { to: '/admin/categorias', label: 'Categorias', icon: Tag, require: 'canManageCategories' },
  { to: '/admin/marcas', label: 'Marcas', icon: Sparkles, require: 'canManageBrands' },
  { to: '/admin/configuracoes', label: 'Configurações', icon: Settings, require: 'canManageContent' },
  { to: '/admin/usuarios', label: 'Usuários', icon: Users, require: 'canManageUsers' },
];

export function AdminLayout() {
  const { user, permissions, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const visible = LINKS.filter((link) => !link.require || permissions[link.require]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="flex min-h-dvh bg-limewash">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-70 flex w-64 flex-col border-r border-salt bg-chalk transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <div>
            <p className="text-aegean font-display text-lg uppercase tracking-[0.18em]">Mykonos</p>
            <p className="mt-1 font-mono text-[0.5rem] uppercase tracking-[0.36em] text-ash">Painel</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
            className="grid size-9 place-items-center rounded-full text-stone hover:text-aegean lg:hidden"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <div className="rule" aria-hidden />

        <nav aria-label="Navegação do painel" className="flex-1 overflow-y-auto px-3 py-6">
          <ul className="space-y-1">
            {visible.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/admin'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm transition-colors duration-300',
                      isActive
                        ? 'bg-aegean/10 text-aegean ring-1 ring-aegean/30'
                        : 'text-stone hover:bg-limewash hover:text-ink',
                    )
                  }
                >
                  <link.icon className="size-4 shrink-0" aria-hidden />
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-salt px-5 py-5">
          {user && (
            <div className="mb-4">
              <p className="truncate text-sm text-ink">{user.name}</p>
              <p className="mt-0.5 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-aegean">
                {ROLE_LABEL[user.role]}
              </p>
            </div>
          )}

          <Link
            to="/"
            className="mb-2 flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-stone transition-colors hover:text-ink"
          >
            <ExternalLink className="size-3.5" aria-hidden />
            Ver a loja
          </Link>

          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-stone transition-colors hover:text-ink"
          >
            <LogOut className="size-3.5" aria-hidden />
            Sair
          </button>
        </div>
      </aside>

      {open && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-60 bg-limewash/45 backdrop-blur-sm lg:hidden"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-salt bg-chalk/90 px-5 backdrop-blur-xl lg:px-8">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
            className="grid size-10 place-items-center rounded-full text-stone hover:text-aegean lg:hidden"
          >
            <Menu className="size-5" aria-hidden />
          </button>

          {!isSupabaseEnabled && (
            <p className="truncate font-mono text-[0.55rem] uppercase tracking-[0.16em] text-aegean">
              Modo local — preencha o .env para gravar no Supabase
            </p>
          )}
        </header>

        <main className="flex-1 px-5 py-8 lg:px-8 lg:py-10">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
