import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { cn } from '@/utils/cn';

/**
 * Cada palavra sobe de dentro de uma máscara, como um tipo saindo da caixa.
 * Serve aos dois momentos coreografados da home — a abertura e a vitrine.
 *
 * O escalonamento vem do container pai por variants, não de delays fixos por
 * elemento: assim a sequência inteira pode ser reordenada em um lugar só.
 */
const word: Variants = {
  hidden: { y: '110%' },
  visible: { y: '0%', transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
};

interface Props {
  text: string;
  className?: string;
  /** Intervalo entre palavras. 0 revela todas juntas. */
  stagger?: number;
  as?: 'span' | 'div';
}

export function MaskedWords({ text, className, stagger = 0.07, as = 'span' }: Props) {
  const reduced = useReducedMotion();
  const Wrapper = as === 'div' ? motion.div : motion.span;

  if (reduced) return <span className={className}>{text}</span>;

  return (
    <Wrapper
      className={cn(as === 'span' && 'inline', className)}
      variants={{ visible: { transition: { staggerChildren: stagger } } }}
    >
      {text.split(' ').map((piece, index) => (
        <span
          key={`${piece}-${index}`}
          className="inline-block overflow-hidden align-bottom pb-[0.08em]"
        >
          <motion.span className="inline-block" variants={word}>
            {piece}
            {' '}
          </motion.span>
        </span>
      ))}
    </Wrapper>
  );
}
