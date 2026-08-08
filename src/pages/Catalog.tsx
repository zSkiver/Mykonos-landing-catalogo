import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Seo, breadcrumbSchema } from '@/components/common/Seo';
import { PageHero } from '@/components/common/PageHero';
import { ProductFilters } from '@/components/catalog/ProductFilters';
import { ProductCard } from '@/components/catalog/ProductCard';
import { WhatsAppButton } from '@/components/common/WhatsAppButton';
import { Spinner } from '@/components/common/Spinner';
import { useStore } from '@/contexts/StoreContext';
import { applyFilters, priceBounds, useCatalogFilters } from '@/hooks/useCatalog';
import { generalMessage } from '@/utils/whatsapp';
import { canonicalCategorySlug } from '@/utils/categories';
import { applyActiveOffer } from '@/utils/offers';

export default function Catalog() {
  const { categoria } = useParams<{ categoria?: string }>();
  const { products, categories, brands, offers, loading } = useStore();
  const categorySlug = categoria ? canonicalCategorySlug(categoria) : undefined;
  const { filters, setFilter, clear, activeCount } = useCatalogFilters(categorySlug);

  const category = categories.find((item) => item.slug === categoria || item.slug === categorySlug);
  const pricedProducts = useMemo(
    () => products.map((product) => applyActiveOffer(product, offers)),
    [products, offers],
  );
  const results = useMemo(() => applyFilters(pricedProducts, filters), [pricedProducts, filters]);
  const bounds = useMemo(() => priceBounds(pricedProducts), [pricedProducts]);

  const title = category?.name ?? 'Catálogo completo';
  const lead =
    category?.tagline ??
    'Todo o acervo em um lugar. Filtre por marca, tipo, gênero ou faixa de preço e fale com a gente sobre o que encontrar.';

  const path = categorySlug ? `/catalogo/${categorySlug}` : '/catalogo';

  return (
    <>
      <Seo
        title={title}
        description={`${lead} Atendimento direto pelo WhatsApp e retirada na loja em Rio Verde, GO.`}
        path={path}
        schema={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Catálogo', path: '/catalogo' },
          ...(category ? [{ name: category.name, path }] : []),
        ])}
      />

      <PageHero
        eyebrow={category ? 'Coleção' : 'Acervo'}
        title={title}
        lead={lead}
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Catálogo', to: categoria ? '/catalogo' : undefined },
          ...(category ? [{ label: category.name }] : []),
        ]}
        aside={
          <p className="numeric font-mono text-[0.66rem] uppercase tracking-[0.18em] text-aegean">
            {results.length} {results.length === 1 ? 'produto disponível' : 'produtos disponíveis'}
          </p>
        }
      />

      <div className="shell grid gap-10 pb-24 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14">
        <ProductFilters
          filters={filters}
          setFilter={setFilter}
          clear={clear}
          activeCount={activeCount}
          brands={brands}
          bounds={bounds}
          resultCount={results.length}
          lockedCategory={Boolean(categoria)}
          categories={categories.map((item) => ({ slug: item.slug, name: item.name }))}
        />

        <div>
          {loading && products.length === 0 ? (
            <div className="flex min-h-80 items-center justify-center">
              <Spinner label="Carregando catálogo" />
            </div>
          ) : results.length === 0 ? (
            <EmptyResults onClear={clear} hasFilters={activeCount > 0} />
          ) : (
            <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((product, index) => (
                <div key={product.id} className="h-full">
                  <ProductCard product={product} priority={index < 6} className="h-full" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function EmptyResults({ onClear, hasFilters }: { onClear: () => void; hasFilters: boolean }) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center border border-dashed border-salt px-8 py-16 text-center">
      <p className="eyebrow text-aegean">Nenhum resultado</p>
      <h2 className="mt-4 max-w-md text-balance lowercase text-2xl">
        Não achamos nada com esses filtros — mas podemos ajudar pelo WhatsApp
      </h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-stone">
        Parte do acervo gira rápido demais para ficar no site. Diga o que procura e conferimos na
        hora.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <WhatsAppButton message={generalMessage('um perfume que não encontrei no site')}>
          Perguntar no WhatsApp
        </WhatsAppButton>
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="link-underline self-center font-mono text-[0.62rem] uppercase tracking-[0.18em] text-stone hover:text-ink"
          >
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}
