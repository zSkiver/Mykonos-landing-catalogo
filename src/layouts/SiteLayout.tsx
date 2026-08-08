import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppFab } from '@/components/layout/WhatsAppFab';
import { PageLoader } from '@/components/common/Spinner';

export function SiteLayout() {
  const location = useLocation();
  const { pathname, hash } = location;

  /**
   * Sem hash, toda troca de rota volta ao topo. Com hash, rola até a seção.
   *
   * A busca é repetida por alguns quadros porque a seção pode ainda não estar
   * montada quando o hash chega — é o caso de vir de outra rota, em que o
   * componente da home só existe depois do Suspense resolver.
   */
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }

    let frame = 0;
    let attempts = 0;

    const reach = () => {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      if (attempts++ < 30) frame = requestAnimationFrame(reach);
    };

    frame = requestAnimationFrame(reach);
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);

  return (
    <div className="flex min-h-dvh flex-col bg-chalk">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-90 focus:rounded-full focus:bg-aegean focus:px-5 focus:py-3 focus:text-sm focus:text-chalk"
      >
        Ir para o conteúdo
      </a>

      <Navbar />

      <main id="conteudo" className="flex-1">
        {/*
          O wrapper de rota cuida apenas da saída.

          Ele não pode declarar `initial`/`animate` por rótulo de variante nem
          usar `initial={false}`: o primeiro propaga "visible" para baixo e faz
          o `whileInView` da vitrine nascer revelado; o segundo viaja pelo
          PresenceContext e suprime a animação de entrada da subárvore inteira,
          matando a coreografia do hero. Só o `exit` fica aqui — e sem entrada
          em opacity a primeira pintura continua protegida.
        */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            exit={{ opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } }}
          >
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
      <WhatsAppFab />
    </div>
  );
}
