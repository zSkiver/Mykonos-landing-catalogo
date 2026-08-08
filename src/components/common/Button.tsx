import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';

export type ButtonVariant = 'solid' | 'chalk' | 'outline' | 'outline-invert' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

const BASE =
  'btn-primary inline-flex items-center justify-center gap-2.5 rounded-full font-sans font-medium whitespace-nowrap disabled:pointer-events-none disabled:opacity-40';

const VARIANTS: Record<ButtonVariant, string> = {
  solid: 'bg-aegean text-chalk hover:bg-abyss',
  chalk: 'bg-chalk text-ink hover:bg-limewash',
  outline: 'border border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-chalk',
  'outline-invert': 'border border-chalk/35 text-chalk hover:border-chalk hover:bg-chalk hover:text-ink',
  ghost: 'text-ink underline-offset-4 hover:underline',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-[0.8rem]',
  md: 'h-11 px-6 text-sm',
  lg: 'h-13 px-8 text-sm',
};

export function buttonStyles(variant: ButtonVariant = 'solid', size: ButtonSize = 'md', extra?: string) {
  return cn(BASE, VARIANTS[variant], SIZES[size], extra);
}

interface Shared {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
}

export function Button({
  variant,
  size,
  className,
  children,
  type = 'button',
  ...rest
}: Shared & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={buttonStyles(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

export function ExternalButton({
  variant,
  size,
  className,
  children,
  ...rest
}: Shared & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={buttonStyles(variant, size, className)}
      {...rest}
    >
      {children}
    </a>
  );
}

export function RouteButton({ variant, size, className, children, to }: Shared & { to: string }) {
  return (
    <Link to={to} className={buttonStyles(variant, size, className)}>
      {children}
    </Link>
  );
}
