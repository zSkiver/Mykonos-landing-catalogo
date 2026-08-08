import { useEffect, useRef } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { ArrowRight, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import { RouteButton } from '@/components/common/Button';
import { WhatsAppButton } from '@/components/common/WhatsAppButton';
import { MaskedWords } from '@/components/common/MaskedWords';
import { useStore } from '@/contexts/StoreContext';
import { generalMessage } from '@/utils/whatsapp';
import { parallax } from '@/animations/gsap';

const EASE = [0.16, 1, 0.3, 1] as const;

// Geradas por `npm run images` a partir de src/assets/. A imagem é o LCP da
// página, então o navegador escolhe a menor largura que serve.
const STOREFRONT = {
  src: '/img/mykonos-storefront-cover-1087.webp',
  srcSet:
    '/img/mykonos-storefront-cover-768.webp 768w, /img/mykonos-storefront-cover-1087.webp 1087w',
};

const HERO_FACTS = [
  { icon: MapPin, value: 'Loja física', label: 'fachada e atendimento local' },
  { icon: ShieldCheck, value: 'Originais', label: 'lacre, lote e nota fiscal' },
  { icon: Sparkles, value: 'Beleza completa', label: 'perfumes, maquiagem e skincare' },
];

/**
 * A abertura é o primeiro dos dois momentos coreografados da home.
 *
 * Tudo pendura numa árvore de variants com um relógio só: o container abre,
 * escalona os filhos, e cada bloco tem seu próprio tempo dentro da sequência.
 * Delays soltos por elemento — como estava antes — desandam assim que alguém
 * mexe na ordem.
 *
 * A fotografia nunca entra na coreografia: ela é o LCP e precisa pintar no
 * primeiro quadro. Quem se move sobre ela é o véu escuro, que recua.
 */
const stage: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.15, staggerChildren: 0.14 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
};

const veil: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 0, transition: { duration: 1.6, ease: EASE } },
};

// A régua desenha da esquerda para a direita e ancora o bloco de texto.
const rule: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 1.1, ease: EASE } },
};

const strip: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: EASE, staggerChildren: 0.09 },
  },
};

export function Hero() {
  const { hero } = useStore();
  const frameRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => parallax(imageRef.current, -36, frameRef.current), []);

  return (
    <motion.section
      ref={frameRef}
      initial="hidden"
      animate="visible"
      variants={stage}
      className="relative isolate min-h-[calc(92svh-5.5rem)] overflow-hidden bg-deep text-chalk"
    >
      <img
        ref={imageRef}
        src={STOREFRONT.src}
        srcSet={STOREFRONT.srcSet}
        sizes="100vw"
        width={1087}
        height={1447}
        alt="Fachada da loja física Mykonos Parfum"
        className="absolute inset-0 -z-20 size-full scale-105 object-cover object-[52%_43%]"
        loading="eager"
        fetchPriority="high"
        decoding="async"
      />

      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-deep/95 via-deep/64 to-deep/20" aria-hidden />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-deep/88 via-deep/22 to-deep/36" aria-hidden />

      {/* Véu de abertura: some sozinho e entrega a fachada já pintada. */}
      {!reduced && (
        <motion.div variants={veil} className="absolute inset-0 -z-10 bg-deep" aria-hidden />
      )}

      <div className="shell-wide flex min-h-[calc(92svh-5.5rem)] flex-col justify-end pb-7 pt-28 md:pb-10 md:pt-36">
        <div className="max-w-5xl">
          <motion.p variants={rise} className="eyebrow text-chalk/72">
            {hero.eyebrow}
          </motion.p>

          <h1 className="mt-7 text-balance text-5xl leading-[1] sm:text-6xl md:text-7xl lg:text-[6.5rem]">
            <MaskedWords text="Mykonos" as="div" stagger={0.08} />
            <MaskedWords
              text="Parfum"
              as="div"
              stagger={0.08}
              className="block italic text-chalk/86"
            />
          </h1>

          <motion.div
            variants={rule}
            className="mt-9 h-px w-full max-w-2xl origin-left bg-chalk/28"
            aria-hidden
          />

          <motion.p
            variants={rise}
            className="mt-8 max-w-2xl text-pretty text-xl leading-relaxed text-chalk/84 md:text-2xl"
          >
            {hero.headline} <span className="italic text-chalk">{hero.headlineAccent}</span>
          </motion.p>

          <motion.p variants={rise} className="mt-4 max-w-xl leading-relaxed text-chalk/70">
            {hero.subheadline}
          </motion.p>

          <motion.div variants={rise} className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <WhatsAppButton message={generalMessage()} variant="chalk" size="lg">
              {hero.primaryCta}
              <ArrowRight className="size-4" aria-hidden />
            </WhatsAppButton>
            <RouteButton to="/catalogo" variant="outline-invert" size="lg">
              {hero.secondaryCta}
              <ArrowRight className="size-4" aria-hidden />
            </RouteButton>
          </motion.div>
        </div>

        <motion.div
          variants={strip}
          className="mt-14 grid gap-px overflow-hidden rounded-md bg-chalk/14 p-px backdrop-blur-md sm:grid-cols-3"
        >
          {HERO_FACTS.map(({ icon: Icon, value, label }) => (
            <motion.div
              key={value}
              variants={rise}
              className="flex min-h-24 items-center gap-4 bg-deep/46 px-5 py-4"
            >
              <Icon className="size-5 shrink-0 text-chalk/72" aria-hidden />
              <div>
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-chalk/52">
                  {value}
                </p>
                <p className="mt-1 text-sm text-chalk/82">{label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
