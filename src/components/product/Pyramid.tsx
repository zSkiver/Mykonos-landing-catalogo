import { motion } from 'framer-motion';
import type { OlfactoryPyramid } from '@/types';
import { VIEWPORT } from '@/animations/variants';

const TIERS = [
  { key: 'top', label: 'Saída', hint: 'primeiros 15 minutos', inset: 'md:mx-16' },
  { key: 'heart', label: 'Coração', hint: 'entre 1 e 4 horas', inset: 'md:mx-8' },
  { key: 'base', label: 'Fundo', hint: 'o que fica na pele', inset: '' },
] as const;

/**
 * A pirâmide olfativa desenhada como estrutura, não como ilustração: cada
 * camada é mais larga que a anterior, na ordem em que a fragrância abre.
 */
export function Pyramid({ pyramid }: { pyramid: OlfactoryPyramid }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.14 } } }}
      className="space-y-10"
    >
      {TIERS.map((tier) => {
        const notes = pyramid[tier.key];
        if (!notes || notes.length === 0) return null;

        return (
          <motion.section
            key={tier.key}
            variants={{
              hidden: { opacity: 0, y: 16 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } },
            }}
            className={tier.inset}
          >
            <div className="tier-label text-aegean">
              {tier.label}
              <span className="order-1 font-sans text-[0.7rem] normal-case tracking-normal text-ash">
                {tier.hint}
              </span>
            </div>

            <p className="mt-4 text-pretty font-display text-2xl leading-snug md:text-3xl">
              {notes.join(' · ')}
            </p>
          </motion.section>
        );
      })}
    </motion.div>
  );
}
