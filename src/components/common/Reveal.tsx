import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';
import { fadeUp, stagger, VIEWPORT } from '@/animations/variants';
import { cn } from '@/utils/cn';

interface RevealProps {
  children: ReactNode;
  className?: string;
  variants?: Variants;
  delay?: number;
  as?: 'div' | 'section' | 'li' | 'article' | 'header';
}

/** Entrada única ao entrar na viewport. */
export function Reveal({ children, className, variants = fadeUp, delay = 0, as = 'div' }: RevealProps) {
  const Component = motion[as] as typeof motion.div;
  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={variants}
      transition={delay ? { delay } : undefined}
    >
      {children}
    </Component>
  );
}

/** Escalona a entrada dos filhos diretos marcados com <RevealItem>. */
export function RevealGroup({
  children,
  className,
  delayChildren = 0.05,
  step = 0.08,
}: {
  children: ReactNode;
  className?: string;
  delayChildren?: number;
  step?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={stagger(delayChildren, step)}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
  variants = fadeUp,
}: {
  children: ReactNode;
  className?: string;
  variants?: Variants;
}) {
  return (
    <motion.div className={cn(className)} variants={variants}>
      {children}
    </motion.div>
  );
}
