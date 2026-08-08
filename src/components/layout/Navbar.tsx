import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Menu, Search, X } from 'lucide-react';
import { CATEGORY_LINKS, NAV_ITEMS } from '@/routes/nav';
import { useStore } from '@/contexts/StoreContext';
import { WhatsAppButton } from '@/components/common/WhatsAppButton';
import { generalMessage } from '@/utils/whatsapp';
import { Wordmark } from './Wordmark';
import { cn } from '@/utils/cn';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState('');
  const { settings } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const query = term.trim();
    navigate(query ? `/catalogo?q=${encodeURIComponent(query)}` : '/catalogo');
    setSearchOpen(false);
  };

  return (
    <>
      {/* Aviso permanente — recolhe assim que o usuário começa a rolar. */}
      <div
        className={cn(
          'overflow-hidden bg-aegean transition-[height,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
          scrolled ? 'h-0 opacity-0' : 'h-9 opacity-100',
        )}
      >
        <p className="flex h-9 items-center justify-center px-4 text-center font-mono text-[0.6rem] uppercase tracking-[0.18em] text-chalk/85">
          {settings.announcement}
        </p>
      </div>

      <header
        className={cn(
          'sticky top-0 z-50 bg-chalk transition-shadow duration-500',
          scrolled && 'shadow-[0_1px_0_0_var(--color-salt),0_10px_30px_-24px_rgb(16_28_41/0.4)]',
        )}
      >
        <div
          className={cn(
            'shell-wide flex items-center justify-between gap-6 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
            scrolled ? 'h-16' : 'h-20',
          )}
        >
          <Wordmark compact={scrolled} />

          <nav aria-label="Navegação principal" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              <li>
                {/* Estar numa âncora ainda é estar na home, mas quem sinaliza
                    a posição é a âncora — não os dois ao mesmo tempo. */}
                <Link
                  to="/"
                  className={navLinkStyles({
                    isActive: location.pathname === '/' && !location.hash,
                  })}
                >
                  Home
                </Link>
              </li>

              <CategoriesMenu />

              {NAV_ITEMS.filter((item) => item.to !== '/').map((item) => (
                <li key={item.to}>
                  {item.to.includes('#') ? (
                    // Âncoras compartilham o pathname "/", então o NavLink
                    // marcaria as três como ativas ao mesmo tempo. Quem decide
                    // aqui é o hash.
                    <Link
                      to={item.to}
                      className={navLinkStyles({
                        isActive: location.hash === item.to.slice(item.to.indexOf('#')),
                      })}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <NavLink to={item.to} className={navLinkStyles}>
                      {item.label}
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1 md:gap-3">
            <button
              type="button"
              onClick={() => setSearchOpen((open) => !open)}
              aria-expanded={searchOpen}
              aria-label="Buscar produtos"
              className="grid size-10 place-items-center rounded-full text-stone transition-colors duration-300 hover:bg-limewash hover:text-ink"
            >
              <Search className="size-[1.05rem]" aria-hidden />
            </button>

            <div className="hidden md:block">
              <WhatsAppButton
                message={generalMessage()}
                size="sm"
                label="Falar com um especialista no WhatsApp"
              >
                Falar com especialista
              </WhatsAppButton>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menu"
              className="grid size-10 place-items-center rounded-full text-stone transition-colors duration-300 hover:bg-limewash hover:text-ink lg:hidden"
            >
              <Menu className="size-5" aria-hidden />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden border-t border-salt bg-chalk"
            >
              <form onSubmit={submitSearch} className="shell-wide flex items-center gap-4 py-5" role="search">
                <Search className="size-4 shrink-0 text-aegean" aria-hidden />
                <input
                  autoFocus
                  value={term}
                  onChange={(event) => setTerm(event.target.value)}
                  placeholder="Busque por nome, marca ou nota olfativa"
                  aria-label="Buscar produtos"
                  className="w-full bg-transparent py-1 text-lg text-ink placeholder:text-ash focus:outline-none"
                />
                <button type="submit" className="text-sm font-medium text-aegean hover:underline">
                  Buscar
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

const navLinkStyles = ({ isActive }: { isActive: boolean }) =>
  cn(
    'link-underline text-sm transition-colors duration-300',
    isActive ? 'text-ink' : 'text-stone hover:text-ink',
  );

/**
 * As seis vitrines não cabem na barra em telas de 1280px, então vivem num
 * menu suspenso que abre por hover e por teclado.
 */
function CategoriesMenu() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const active = pathname.startsWith('/catalogo/');

  return (
    <li
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          'link-underline flex items-center gap-1.5 text-sm transition-colors duration-300',
          active || open ? 'text-ink' : 'text-stone hover:text-ink',
        )}
      >
        Coleções
        <ChevronDown
          aria-hidden
          className={cn('size-3.5 transition-transform duration-400', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 top-full z-10 mt-4 w-60 border border-salt bg-chalk p-1.5 shadow-[0_20px_50px_-30px_rgb(16_28_41/0.5)]"
          >
            {CATEGORY_LINKS.map((category) => (
              <li key={category.to}>
                <NavLink
                  to={category.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'block px-3.5 py-2.5 text-sm transition-colors duration-300',
                      isActive ? 'bg-limewash text-ink' : 'text-stone hover:bg-limewash hover:text-ink',
                    )
                  }
                >
                  {category.label}
                </NavLink>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-60 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={onClose}
            className="absolute inset-0 bg-ink/45"
          />

          <motion.nav
            aria-label="Navegação principal"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-y-0 right-0 flex w-[min(22rem,88vw)] flex-col bg-chalk"
          >
            <div className="flex items-center justify-between border-b border-salt px-7 py-5">
              <Wordmark compact />
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar menu"
                className="grid size-10 place-items-center rounded-full text-stone transition-colors hover:text-ink"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-7 py-8">
              <ul>
                {NAV_ITEMS.map((item, index) => (
                  <motion.li
                    key={item.to}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + index * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="border-b border-salt"
                  >
                    <Link
                      to={item.to}
                      onClick={onClose}
                      className="block py-4 font-display lowercase text-2xl text-ink transition-colors duration-300 hover:text-aegean"
                    >
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <p className="mb-4 mt-9 font-mono text-[0.55rem] uppercase tracking-[0.24em] text-ash">
                Coleções
              </p>
              <ul className="space-y-1">
                {CATEGORY_LINKS.map((category, index) => (
                  <motion.li
                    key={category.to}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      to={category.to}
                      onClick={onClose}
                      className="block py-2 text-sm text-stone transition-colors duration-300 hover:text-aegean"
                    >
                      {category.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="border-t border-salt px-7 py-6">
              <WhatsAppButton message={generalMessage()} size="lg" className="w-full">
                Falar no WhatsApp
              </WhatsAppButton>
            </div>
          </motion.nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
