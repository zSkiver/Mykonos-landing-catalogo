const SITE_URL = (import.meta.env.VITE_SITE_URL ?? 'https://mykonosparfum.com.br').replace(/\/$/, '');
const SITE_NAME = import.meta.env.VITE_STORE_NAME ?? 'Mykonos Parfum';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

interface Props {
  title: string;
  description: string;
  /** Caminho relativo, ex.: `/catalogo`. */
  path: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
  noIndex?: boolean;
  /** JSON-LD específico da página, além do Store global do index.html. */
  schema?: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * O React 19 iça cada tag para o head, então não há dependência de helmet.
 */
export function Seo({ title, description, path, image, type = 'website', noIndex, schema }: Props) {
  const url = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const fullTitle = path === '/' ? title : `${title} · ${SITE_NAME}`;
  const cover = image ?? DEFAULT_IMAGE;

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={cover} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={cover} />

      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(schema) ? schema : [schema])}
        </script>
      )}
    </>
  );
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export { SITE_URL, SITE_NAME };
