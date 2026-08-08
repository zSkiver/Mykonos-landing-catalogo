import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { MaskedWords } from '@/components/common/MaskedWords';
import { useStore } from '@/contexts/StoreContext';
import type { Category } from '@/types';
import { canonicalCategorySlug } from '@/utils/categories';

const EASE = [0.16, 1, 0.3, 1] as const;
const VIEWPORT = { once: true, amount: 0.15 } as const;

/**
 * A vitrine é o segundo dos dois momentos coreografados da home.
 *
 * Cada cartão é descoberto por uma cortina — `clip-path` subindo da base —
 * enquanto a foto assenta de uma escala maior e o conteúdo sobe por dentro.
 * São três tempos por cartão, escalonados entre eles: o efeito de alguém
 * levantando as peças da vitrine uma a uma.
 */
const grid: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.1, staggerChildren: 0.13 } },
};

const card: Variants = {
  hidden: { clipPath: 'inset(100% 0% 0% 0%)', y: 44 },
  visible: {
    clipPath: 'inset(0% 0% 0% 0%)',
    y: 0,
    transition: { duration: 1.05, ease: EASE, staggerChildren: 0.07, delayChildren: 0.25 },
  },
};

const photo: Variants = {
  hidden: { scale: 1.18 },
  visible: { scale: 1, transition: { duration: 1.4, ease: EASE } },
};

const line: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export function Categories() {
  const { categories } = useStore();
  const visible = categories.filter(
    (category) =>
      category.active &&
      !['cosmeticos', 'skincare'].includes(canonicalCategorySlug(category.slug)),
  );

  if (visible.length === 0) return null;

  return (
    <section id="categorias" className="scroll-mt-24 bg-chalk py-20 md:py-28">
      <div className="shell-wide">
        <motion.header
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
          className="mb-12 grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(18rem,0.42fr)] md:items-end"
        >
          <div>
            <motion.p variants={line} className="eyebrow text-aegean">
              Coleções da casa
            </motion.p>
            <h2 className="mt-6 max-w-4xl text-balance lowercase text-[2.5rem] leading-[0.98] md:text-6xl lg:text-[4.5rem]">
              <MaskedWords
                text="escolha pelo ritual, pela ocasião ou pela família olfativa"
                as="div"
                stagger={0.045}
              />
            </h2>
          </div>
          <motion.p variants={line} className="max-w-md leading-relaxed text-stone md:text-right">
            A vitrine reúne perfumes, body splashes, kits e novidades: curadoria direta e um
            caminho simples para conversar.
          </motion.p>
        </motion.header>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          variants={grid}
          className="grid gap-3 md:grid-cols-2 xl:grid-cols-3"
        >
          {visible.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CategoryCard({ category, index }: { category: Category; index: number }) {
  const reduced = useReducedMotion();

  return (
    <motion.article variants={card}>
      <Link
        to={`/catalogo/${canonicalCategorySlug(category.slug)}`}
        className="group relative flex min-h-[23rem] overflow-hidden bg-deep p-6 text-chalk sm:p-8 md:min-h-[30rem]"
      >
        <motion.img
          variants={reduced ? undefined : photo}
          src={category.image}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-deep/88 via-deep/38 to-deep/12" aria-hidden />
        <div className="absolute inset-0 bg-aegean/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden />

        <div className="relative z-10 mt-auto flex min-h-56 w-full flex-col justify-end">
          <motion.p
            variants={line}
            className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-chalk/56"
          >
            {String(index + 1).padStart(2, '0')}
          </motion.p>
          <motion.h3
            variants={line}
            className="mt-4 max-w-sm text-balance font-display text-4xl lowercase leading-none md:text-5xl"
          >
            {category.name}
          </motion.h3>
          <motion.p
            variants={line}
            className="mt-4 max-w-sm text-pretty text-sm leading-relaxed text-chalk/72"
          >
            {category.tagline}
          </motion.p>
          <motion.span
            variants={line}
            className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-chalk"
          >
            Abrir coleção
            <ArrowRight
              className="size-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden
            />
          </motion.span>
        </div>
      </Link>
    </motion.article>
  );
}
