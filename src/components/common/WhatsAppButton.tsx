import type { ReactNode } from 'react';
import { ExternalButton, type ButtonSize, type ButtonVariant } from './Button';
import { whatsappLink } from '@/utils/whatsapp';

interface Props {
  message: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  /** Rótulo acessível quando o texto visível não descreve o destino. */
  label?: string;
}

/** Todo caminho de conversão passa por aqui. */
export function WhatsAppButton({
  message,
  children,
  variant = 'solid',
  size = 'md',
  className,
  label,
}: Props) {
  return (
    <ExternalButton
      href={whatsappLink(message)}
      variant={variant}
      size={size}
      className={className}
      aria-label={label}
    >
      {children}
    </ExternalButton>
  );
}
