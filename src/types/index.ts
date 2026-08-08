/**
 * Modelos de domínio da Mykonos Parfum.
 * Cada interface corresponde a uma tabela do Supabase, exceto os tipos
 * auxiliares de UI marcados como tal.
 */

export type Timestampish = number;

/* -------------------------------------------------------------------- users */

export type UserRole = 'admin' | 'staff';

export const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Administrador',
  staff: 'Funcionário autorizado',
};

/** Tabela `profiles`, vinculada ao usuário do Supabase Authentication. */
export interface AppUser {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  createdAt: Timestampish;
  lastLoginAt?: Timestampish;
}

/** Permissões derivadas do papel — fonte única de verdade da UI e das rotas. */
export interface Permissions {
  canCreateProduct: boolean;
  canEditProduct: boolean;
  canDeleteProduct: boolean;
  canManageCategories: boolean;
  canManageBrands: boolean;
  canManageOffers: boolean;
  canManageContent: boolean;
  canManageUsers: boolean;
  canViewStats: boolean;
}

export function permissionsFor(role: UserRole | null): Permissions {
  const admin = role === 'admin';
  const staff = role === 'staff';
  return {
    canCreateProduct: admin || staff,
    canEditProduct: admin || staff,
    canDeleteProduct: admin,
    canManageCategories: admin,
    canManageBrands: admin,
    canManageOffers: admin,
    canManageContent: admin,
    canManageUsers: admin,
    canViewStats: admin || staff,
  };
}

/* --------------------------------------------------------------- categories */

/** Coleção `categories`. */
export interface Category {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  /** Nome de um ícone da lucide-react, resolvido em `utils/icons.ts`. */
  icon: string;
  image: string;
  order: number;
  active: boolean;
}

/* ------------------------------------------------------------------- brands */

/** Coleção `brands`. */
export interface Brand {
  id: string;
  slug: string;
  name: string;
  origin?: string;
  logo?: string;
  featured: boolean;
}

/* ----------------------------------------------------------------- products */

export type ProductKind =
  | 'importado'
  | 'nacional'
  | 'arabe'
  | 'body-splash'
  | 'kit'
  | 'cosmetico'
  | 'skincare';

export const PRODUCT_KIND_LABEL: Record<ProductKind, string> = {
  importado: 'Importado',
  nacional: 'Nacional',
  arabe: 'Árabe',
  'body-splash': 'Body splash',
  kit: 'Kit',
  cosmetico: 'Cosmético',
  skincare: 'Skincare',
};

export type Gender = 'masculino' | 'feminino' | 'unissex';

export const GENDER_LABEL: Record<Gender, string> = {
  masculino: 'Masculino',
  feminino: 'Feminino',
  unissex: 'Unissex',
};

export type Intensity = 'leve' | 'moderada' | 'intensa' | 'extrema';

export const INTENSITY_SCALE: Intensity[] = ['leve', 'moderada', 'intensa', 'extrema'];

export const INTENSITY_LABEL: Record<Intensity, string> = {
  leve: 'Leve',
  moderada: 'Moderada',
  intensa: 'Intensa',
  extrema: 'Extrema',
};

export type BadgeKind = 'novo' | 'oferta' | 'mais-vendido' | 'exclusivo';

export const BADGE_LABEL: Record<BadgeKind, string> = {
  novo: 'Novo',
  oferta: 'Oferta',
  'mais-vendido': 'Mais vendido',
  exclusivo: 'Exclusivo',
};

/** A pirâmide olfativa — estrutura que organiza toda a identidade do site. */
export interface OlfactoryPyramid {
  top: string[];
  heart: string[];
  base: string[];
}

/**
 * Uma apresentação do mesmo perfume — 50 ml, 100 ml, e assim por diante.
 * Muda o volume e o preço; nome, fotos, descrição e notas são compartilhados,
 * então um perfume com três tamanhos continua sendo um cadastro só.
 */
export interface ProductVariant {
  /** Identificador estável dentro do produto, usado como chave e no SKU. */
  id: string;
  volumeMl: number;
  price: number;
  promoPrice?: number;
  /** Sem estoque desta apresentação, mas as outras seguem à venda. */
  soldOut?: boolean;
}

/** Coleção `products`. */
export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  brandSlug: string;
  categorySlug: string;
  kind: ProductKind;
  gender: Gender;

  description: string;
  /** Texto longo opcional exibido na página do produto. */
  story?: string;

  /** Preço e volume da apresentação padrão — a primeira da lista. */
  price: number;
  promoPrice?: number;
  volumeMl: number;
  /**
   * Apresentações adicionais. Vazio ou ausente significa tamanho único, e
   * nesse caso `price`/`volumeMl` acima respondem sozinhos pelo produto.
   */
  variants?: ProductVariant[];
  olfactoryFamily?: string;
  pyramid?: OlfactoryPyramid;
  longevity?: Intensity;
  projection?: Intensity;
  occasions?: string[];

  images: string[];

  featured: boolean;
  dailyOffer: boolean;
  bestSeller: boolean;
  isNew: boolean;
  exclusive: boolean;
  active: boolean;

  createdAt: Timestampish;
  updatedAt: Timestampish;
}

/** Payload de escrita — o id e as datas são atribuídos pelo serviço. */
export type ProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

/* ------------------------------------------------------------------ offers */

/** Coleção `offers` — janela promocional que sobrepõe os dados do produto. */
export interface Offer {
  id: string;
  productId: string;
  headline: string;
  promoPrice: number;
  /** Encerramento da oferta em epoch ms. */
  endsAt: Timestampish;
  active: boolean;
}

/* ------------------------------------------------------- conteúdo editável */

/**
 * Textos do hero. A fotografia de fundo é servida direto de `public/img/`,
 * com `srcset`, então não passa por aqui.
 */
export interface HeroContent {
  id: string;
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  subheadline: string;
  primaryCta: string;
  secondaryCta: string;
  /** Tríade exibida na gramática da pirâmide, do topo à base. */
  tiers: { label: string; value: string }[];
}

/** Coleção `banners`. */
export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  ctaLabel: string;
  ctaMessage: string;
  placement: 'home-mid' | 'catalog-top';
  order: number;
  active: boolean;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

/** Coleção `settings`, documento único `store`. */
export interface StoreSettings {
  id: string;
  storeName: string;
  whatsappNumber: string;
  instagram: string;
  email: string;
  address: string;
  mapsQuery: string;
  openingHours: { days: string; hours: string }[];
  aboutTitle: string;
  aboutText: string[];
  announcement: string;
  faq: FaqItem[];
}

/* ------------------------------------------------------------- auxiliares */

export type SortKey = 'relevancia' | 'preco-asc' | 'preco-desc' | 'novidades' | 'nome';

export const SORT_LABEL: Record<SortKey, string> = {
  relevancia: 'Relevância',
  'preco-asc': 'Menor preço',
  'preco-desc': 'Maior preço',
  novidades: 'Novidades',
  nome: 'Nome (A–Z)',
};

/** Estado dos filtros do catálogo — espelhado na query string. */
export interface CatalogFilters {
  search: string;
  category: string | null;
  brand: string | null;
  kind: ProductKind | null;
  gender: Gender | null;
  minPrice: number | null;
  maxPrice: number | null;
  onlyOffers: boolean;
  sort: SortKey;
}

export const EMPTY_FILTERS: CatalogFilters = {
  search: '',
  category: null,
  brand: null,
  kind: null,
  gender: null,
  minPrice: null,
  maxPrice: null,
  onlyOffers: false,
  sort: 'relevancia',
};

export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  dailyOffers: number;
  averagePrice: number;
  byKind: { kind: ProductKind; count: number }[];
}
