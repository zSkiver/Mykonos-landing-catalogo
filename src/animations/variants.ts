import type { Transition, Variants } from 'framer-motion';

const SILK: Transition = { duration: 0.9, ease: [0.16, 1, 0.3, 1] };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: SILK },
};

/** Container que escalona a entrada dos filhos. */
export function stagger(delayChildren = 0.1, staggerChildren = 0.09): Variants {
  return {
    hidden: {},
    visible: { transition: { delayChildren, staggerChildren } },
  };
}

export const VIEWPORT = { once: true, amount: 0.25 } as const;
