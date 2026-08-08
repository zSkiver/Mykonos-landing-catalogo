import {
  Award,
  BadgeCheck,
  Droplet,
  Flame,
  Gem,
  Gift,
  Headphones,
  Heart,
  Leaf,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Wind,
  type LucideIcon,
} from 'lucide-react';

/** Ícones liberados para conteúdo editável no painel — evita import dinâmico. */
export const ICONS: Record<string, LucideIcon> = {
  Award,
  BadgeCheck,
  Droplet,
  Flame,
  Gem,
  Gift,
  Headphones,
  Heart,
  Leaf,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Wind,
};

export const ICON_NAMES = Object.keys(ICONS);

export function resolveIcon(name: string | undefined): LucideIcon {
  return (name && ICONS[name]) || Sparkles;
}
