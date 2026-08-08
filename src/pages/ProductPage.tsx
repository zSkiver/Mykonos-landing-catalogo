import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Seo, SITE_URL, breadcrumbSchema } from '@/components/common/Seo';
import { Gallery } from '@/components/product/Gallery';
import { Pyramid } from '@/components/product/Pyramid';
import { IntensityMeter } from '@/components/product/IntensityMeter';
import { VolumePicker } from '@/components/product/VolumePicker';
import { Badge, primaryBadge } from '@/components/common/Badge';
import { Price } from '@/components/common/Price';
import { WhatsAppButton } from '@/components/common/WhatsAppButton';
import { ProductCard } from '@/components/catalog/ProductCard';
import { Section, SectionHeader } from '@/components/common/Section';
import { RevealGroup, RevealItem, Reveal } from '@/components/common/Reveal';
import { PageLoader } from '@/components/common/Spinner';
import { useStore } from '@/contexts/StoreContext';
import { GENDER_LABEL, PRODUCT_KIND_LABEL } from '@/types';
import { effectivePrice, formatVolume } from '@/utils/format';
import { canonicalCategorySlug } from '@/utils/categories';
import { generalMessage, productMessage } from '@/utils/whatsapp';
import { applyActiveOffer } from '@/utils/offers';
import { cheapestVariant, findVariant, variantSku } from '@/utils/variants';
import { hasPyramid, isScented } from '@/utils/productKinds';
import { cn } from '@/utils/cn';
import NotFound from './NotFound';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { products, categories, offers, loading } = useStore();

  const baseProduct = products.find((item) => item.slug === slug);
  const product = useMemo(
    () => (baseProduct ? applyActiveOffer(baseProduct, offers) : undefined),
    [baseProduct, offers],
  );
  const category = categories.find((item) => item.slug === product?.categorySlug);

  const related = useMemo(() => {
    if (!product) return [];
    const sameCategory = products.filter(
      (item) => item.active && item.id !== product.id && item.categorySlug === product.categorySlug,
    );
    const sameBrand = products.filter(
      (item) =>
        item.active &&
        item.id !== product.id &&
        item.brandSlug === product.brandSlug &&
        item.categorySlug !== product.categorySlug,
    );
    return [...sameCategory, ...sameBrand]
      .slice(0, 4)
      .map((item) => applyActiveOffer(item, offers));
  }, [products, product, offers]);

  // `null` significa "ainda não escolheram" — mostramos a apresentação mais
  // barata, que é a mesma âncora de preço usada na listagem.
  const [variantId, setVariantId] = useState<string | null>(null);
  useEffect(() => setVariantId(null), [baseProduct?.id]);

  if (loading && products.length === 0) return <PageLoader label="Carregando produto" />;
  if (!product) return <NotFound />;

  const variant = variantId ? findVariant(product, variantId) : cheapestVariant(product);
  const price = effectivePrice(variant.price, variant.promoPrice);
  const badge = primaryBadge(product);
  const pyramid = hasPyramid(product) ? (product.pyramid ?? null) : null;
  const showPyramid = pyramid !== null;
  const assurances = [
    'Confirme a disponibilidade pelo WhatsApp antes de visitar a loja.',
    'Atendimento local em Rio Verde, GO.',
  ];

  return (
    <>
      <Seo
        title={`${product.name} — ${product.brand}`}
        description={product.description}
        path={`/produto/${product.slug}`}
        image={product.images[0]}
        type="product"
        schema={[
          {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            image: product.images,
            description: product.description,
            brand: { '@type': 'Brand', name: product.brand },
            offers: {
              '@type': 'Offer',
              url: `${SITE_URL}/produto/${product.slug}`,
              priceCurrency: 'BRL',
              price: price.toFixed(2),
              seller: { '@type': 'Organization', name: 'Mykonos Parfum' },
            },
          },
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Catálogo', path: '/catalogo' },
            ...(category
              ? [{ name: category.name, path: `/catalogo/${canonicalCategorySlug(category.slug)}` }]
              : []),
            { name: product.name, path: `/produto/${product.slug}` },
          ]),
        ]}
      />

      <div className="shell pt-10 md:pt-14">
        <nav aria-label="Trilha de navegação" className="mb-10">
          <ol className="flex flex-wrap items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ash">
            <li>
              <Link to="/" className="transition-colors hover:text-aegean">
                Home
              </Link>
            </li>
            <li aria-hidden>·</li>
            <li>
              <Link to="/catalogo" className="transition-colors hover:text-aegean">
                Catálogo
              </Link>
            </li>
            {category && (
              <>
                <li aria-hidden>·</li>
                <li>
                  <Link
                    to={`/catalogo/${canonicalCategorySlug(category.slug)}`}
                    className="transition-colors hover:text-aegean"
                  >
                    {category.name}
                  </Link>
                </li>
              </>
            )}
            <li aria-hidden>·</li>
            <li className="text-stone">{product.name}</li>
          </ol>
        </nav>

        <div className="grid gap-10 pb-20 lg:grid-cols-2 lg:gap-20">
          <Gallery
            images={product.images}
            alt={`${product.name} — ${product.brand}`}
          />

          <div>
            <div className="flex flex-wrap items-center gap-3">
              {badge && <Badge kind={badge} />}
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ash">
                {product.brand}
              </p>
            </div>

            <h1 className="mt-6 text-balance font-display text-4xl leading-[1.05] md:text-5xl">
              {product.name}
            </h1>

            <p className="numeric mt-5 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-stone">
              {formatVolume(variant.volumeMl)} · {GENDER_LABEL[product.gender]} ·{' '}
              {PRODUCT_KIND_LABEL[product.kind]}
              {product.olfactoryFamily && ` · ${product.olfactoryFamily}`}
            </p>

            <p className="mt-8 text-pretty text-lg leading-relaxed text-stone">
              {product.description}
            </p>

            <div className="my-10 h-px bg-salt" aria-hidden />

            <Price
              price={variant.price}
              promoPrice={variant.promoPrice}
              size="lg"
              showInstallments
            />

            <VolumePicker
              product={product}
              selectedId={variant.id}
              onSelect={(next) => setVariantId(next.id)}
            />

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <WhatsAppButton message={productMessage(product, undefined, variant)} size="lg">
                Quero este produto
              </WhatsAppButton>
              <WhatsAppButton
                message={generalMessage(`indicação parecida com ${product.name}`)}
                size="lg"
                variant="outline"
              >
                Pedir indicação parecida
              </WhatsAppButton>
            </div>

            <ul className="mt-10 space-y-3 border-t border-salt pt-8">
              {assurances.map((line) => (
                <li key={line} className="flex gap-3 text-sm text-stone">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-aegean" aria-hidden />
                  {line}
                </li>
              ))}
            </ul>

            {/* Cadastros antigos de cosmético podem ter fixação gravada de um
                tempo em que o formulário perguntava para todo mundo. */}
            {isScented(product.kind) && (product.longevity || product.projection) && (
              <div className="mt-10 grid gap-8 border-t border-salt pt-8 sm:grid-cols-2">
                {product.longevity && <IntensityMeter label="Fixação" value={product.longevity} />}
                {product.projection && <IntensityMeter label="Projeção" value={product.projection} />}
              </div>
            )}

            {product.occasions && product.occasions.length > 0 && (
              <div className="mt-10">
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ash">Ocasião</p>
                <div className="mt-3.5 flex flex-wrap gap-2">
                  {product.occasions.map((occasion) => (
                    <span
                      key={occasion}
                      className="rounded-full border border-ink/15 px-3.5 py-1.5 text-[0.8rem] text-stone"
                    >
                      {occasion}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <p className="numeric mt-10 text-[0.65rem] uppercase tracking-[0.14em] text-ash">
              Código {variantSku(product, variant)}
            </p>
          </div>
        </div>
      </div>

      {/* Sem notas cadastradas não há pirâmide — mas o texto longo, se houver,
          continua merecendo um lugar. */}
      {(showPyramid || product.story) && (
        <Section tone="limewash">
          <div
            className={cn(
              'grid gap-14',
              showPyramid && 'lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-24',
            )}
          >
            <Reveal>
              <p className="eyebrow text-aegean">
                {showPyramid ? 'Pirâmide olfativa' : 'Sobre o produto'}
              </p>
              <h2 className="mt-6 text-balance lowercase text-3xl md:text-4xl">
                {showPyramid ? (
                  <>
                    como {product.name} <span className="italic text-aegean">se abre na pele</span>
                  </>
                ) : (
                  <>
                    o que faz <span className="italic text-aegean">{product.name}</span> valer a pena
                  </>
                )}
              </h2>
              {showPyramid && (
                <p className="mt-6 max-w-sm text-pretty leading-relaxed text-stone">
                  Toda fragrância evapora em camadas. A saída é a primeira impressão; o fundo é o
                  que as pessoas lembram de você.
                </p>
              )}
              {product.story && (
                <p
                  className={cn(
                    'mt-5 text-pretty leading-relaxed text-stone',
                    showPyramid ? 'max-w-sm text-sm' : 'mt-6 max-w-2xl',
                  )}
                >
                  {product.story}
                </p>
              )}
            </Reveal>

            {pyramid && <Pyramid pyramid={pyramid} />}
          </div>
        </Section>
      )}

      {related.length > 0 && (
        <Section>
          <SectionHeader
            eyebrow="Também combinam"
            title={
              <>
                quem levou este, <span className="italic text-aegean">olhou estes</span>
              </>
            }
            lead="Selecionados pela família olfativa e pela mesma casa."
          />
          <RevealGroup className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <RevealItem key={item.id} className="h-full">
                <ProductCard product={item} className="h-full" />
              </RevealItem>
            ))}
          </RevealGroup>
        </Section>
      )}
    </>
  );
}
