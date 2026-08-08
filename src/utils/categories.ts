const LEGACY_SLUGS: Record<string, string> = {
  'perfume-importado': 'perfumes-importados',
  'perfume-arabe': 'perfumes-arabes',
  cosmetico: 'cosmeticos',
  'kits-presente': 'kit-perfumes',
};

/** Mantém links antigos compatíveis com os slugs atuais do catálogo. */
export function canonicalCategorySlug(slug: string): string {
  return LEGACY_SLUGS[slug] ?? slug;
}
