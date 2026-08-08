import { SEED_BRANDS, SEED_CATEGORIES, SEED_SETTINGS } from '@/data/seed';
import { TABLES, SINGLETON_IDS } from '@/supabase/tables';
import type { Brand, Category, Offer, StoreSettings } from '@/types';
import { canonicalCategorySlug } from '@/utils/categories';
import { createCrudService, createSingletonService } from './crud';

const seedCategoryBySlug = new Map(SEED_CATEGORIES.map((category) => [category.slug, category]));

function hydrateCategories(categories: Category[]): Category[] {
  const extras: Category[] = [];
  const remoteByCanonical = new Map<string, Category>();

  for (const category of categories) {
    const canonicalSlug = canonicalCategorySlug(category.slug);
    if (seedCategoryBySlug.has(canonicalSlug)) {
      remoteByCanonical.set(canonicalSlug, category);
    } else {
      extras.push(category);
    }
  }

  return [
    ...SEED_CATEGORIES.map((seed) => {
      const remote = remoteByCanonical.get(seed.slug);
      if (!remote) return seed;

      const isLegacySlug = remote.slug !== seed.slug;

      return {
        ...seed,
        ...remote,
        slug: seed.slug,
        name: isLegacySlug || !remote.name.trim() ? seed.name : remote.name,
        tagline: isLegacySlug || !remote.tagline.trim() ? seed.tagline : remote.tagline,
        icon: !remote.icon.trim() ? seed.icon : remote.icon,
        image: !remote.image.trim() ? seed.image : remote.image,
        order: isLegacySlug && remote.order === 99 ? seed.order : remote.order,
      };
    }),
    ...extras,
  ].sort((a, b) => a.order - b.order);
}

const baseCategoriesService = createCrudService<Category>(
  TABLES.categories,
  SEED_CATEGORIES,
  (a, b) => a.order - b.order,
);

export const categoriesService = {
  ...baseCategoriesService,
  async list(): Promise<Category[]> {
    return hydrateCategories(await baseCategoriesService.list());
  },
};

export const brandsService = createCrudService<Brand>(TABLES.brands, SEED_BRANDS, (a, b) =>
  a.name.localeCompare(b.name, 'pt-BR'),
);

export const offersService = createCrudService<Offer>(TABLES.offers, [], (a, b) => {
  if (a.active !== b.active) return a.active ? -1 : 1;
  return a.endsAt - b.endsAt;
});

export const settingsService = createSingletonService<StoreSettings>(
  TABLES.settings,
  SINGLETON_IDS.settings,
  SEED_SETTINGS,
);
