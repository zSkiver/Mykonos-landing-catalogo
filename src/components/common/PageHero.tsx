import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Props {
  eyebrow: string;
  title: ReactNode;
  lead?: string;
  crumbs?: { label: string; to?: string }[];
  aside?: ReactNode;
}

/** Cabeçalho das páginas internas: a mesma gramática da home, sem imagem. */
export function PageHero({ eyebrow, title, lead, crumbs, aside }: Props) {
  return (
    <header className="bg-limewash pb-16 pt-12 md:pb-20 md:pt-16">
      <div className="shell">
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Trilha de navegação" className="mb-10">
            <ol className="flex flex-wrap items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ash">
              {crumbs.map((crumb, index) => (
                <li key={crumb.label} className="flex items-center gap-2">
                  {index > 0 && <span aria-hidden>·</span>}
                  {crumb.to ? (
                    <Link to={crumb.to} className="transition-colors hover:text-aegean">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-stone">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="grid gap-8 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:items-end md:gap-14"
        >
          <div>
            <p className="eyebrow text-aegean">{eyebrow}</p>
            <h1 className="mt-6 text-balance lowercase text-[2.75rem] leading-[0.98] md:text-6xl lg:text-7xl">
              {title}
            </h1>
          </div>

          <div className="flex flex-col items-start gap-6 md:items-end">
            {lead && (
              <p className="max-w-md text-pretty leading-relaxed text-stone md:text-right">{lead}</p>
            )}
            {aside}
          </div>
        </motion.div>
      </div>
    </header>
  );
}
