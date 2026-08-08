import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Banner, Brand, Category, HeroContent, Offer, Product, StoreSettings } from '@/types';
import { listProducts } from '@/services/products.service';
import {
  brandsService,
  categoriesService,
  offersService,
  settingsService,
} from '@/services/content.service';
import { SEED_BANNERS, SEED_HERO, SEED_SETTINGS } from '@/data/seed';
import { setWhatsappNumber } from '@/utils/whatsapp';

interface StoreValue {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  offers: Offer[];
  banners: Banner[];
  hero: HeroContent;
  settings: StoreSettings;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(SEED_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const [nextProducts, nextCategories, nextBrands, nextOffers, nextSettings] =
        await Promise.all([
          listProducts(),
          categoriesService.list(),
          brandsService.list(),
          offersService.list(),
          settingsService.get(),
        ]);

      setProducts(nextProducts);
      setCategories(nextCategories);
      setBrands(nextBrands);
      setOffers(nextOffers);
      setSettings(nextSettings);
      setWhatsappNumber(nextSettings.whatsappNumber);
    } catch (cause) {
      console.error('[store] falha ao carregar dados', cause);
      setError('Não foi possível carregar o catálogo. Recarregue a página.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<StoreValue>(
    () => ({
      products,
      categories,
      brands,
      offers,
      banners: SEED_BANNERS,
      hero: SEED_HERO,
      settings,
      loading,
      error,
      refresh,
    }),
    [products, categories, brands, offers, settings, loading, error, refresh],
  );

  return <StoreContext value={value}>{children}</StoreContext>;
}

export function useStore(): StoreValue {
  const context = use(StoreContext);
  if (!context) throw new Error('useStore precisa estar dentro de <StoreProvider>.');
  return context;
}
