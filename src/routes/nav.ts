export interface NavItem {
  label: string;
  to: string;
}

/** Vitrines por categoria — também alimentam o menu suspenso da barra. */
export const CATEGORY_LINKS: NavItem[] = [
  { label: 'Perfumes Importados', to: '/catalogo/perfumes-importados' },
  { label: 'Perfumes Nacionais', to: '/catalogo/perfumes-nacionais' },
  { label: 'Perfumes Árabes', to: '/catalogo/perfumes-arabes' },
  { label: 'Body Splash', to: '/catalogo/body-splash' },
  { label: 'Kit Perfumes', to: '/catalogo/kit-perfumes' },
  { label: 'Cosméticos', to: '/catalogo/cosmeticos' },
  { label: 'Skincare', to: '/catalogo/skincare' },
  { label: 'Novidades', to: '/catalogo/novidades' },
];

/**
 * Itens que ficam sempre visíveis na barra a partir de 1024px.
 *
 * Ofertas, Sobre e Contato apontam para seções da home, não para páginas
 * próprias: assim quem clica continua dentro do mesmo documento e pode rolar
 * para cima para reencontrar o resto do site. Catálogo é rota de verdade —
 * tem filtros, URL compartilhável e vida própria.
 */
export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Ofertas', to: '/#ofertas' },
  { label: 'Catálogo', to: '/catalogo' },
  { label: 'Como funciona', to: '/#como-funciona' },
  { label: 'Sobre', to: '/#sobre' },
  { label: 'Contato', to: '/#contato' },
];

export const FOOTER_CATEGORIES = CATEGORY_LINKS;

export const FOOTER_LINKS: NavItem[] = [
  { label: 'Catálogo completo', to: '/catalogo' },
  { label: 'Ofertas do dia', to: '/ofertas' },
  { label: 'Sobre a loja', to: '/sobre' },
  { label: 'Contato', to: '/contato' },
];
