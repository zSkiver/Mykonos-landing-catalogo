import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Countdown } from '@/components/common/Countdown';
import { Price } from '@/components/common/Price';
import { Reveal } from '@/components/common/Reveal';
import { WhatsAppButton } from '@/components/common/WhatsAppButton';
import { useStore } from '@/contexts/StoreContext';
import { activeOfferForProduct, resolveDailyOffers } from '@/utils/offers';
import { discountPercent, endOfToday, formatVolume } from '@/utils/format';
import { generalMessage, offerMessage } from '@/utils/whatsapp';
import type { Product } from '@/types';

const ROTATION_MS = 7_000;

export function DailyOffers() {
  const { products, offers: offerWindows } = useStore();
  const offers = useMemo(
    () => resolveDailyOffers(products, offerWindows),
    [products, offerWindows],
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setCurrentIndex((index) => (offers.length > 0 ? index % offers.length : 0));
  }, [offers.length]);

  useEffect(() => {
    if (paused || offers.length <= 1) return;
    const timer = window.setTimeout(
      () => setCurrentIndex((index) => (index + 1) % offers.length),
      ROTATION_MS,
    );
    return () => window.clearTimeout(timer);
  }, [currentIndex, offers.length, paused]);

  if (offers.length === 0) return <EmptyDailyOffers />;

  const highlight = offers[currentIndex] ?? offers[0];
  const highlightWindow = activeOfferForProduct(highlight.id, offerWindows);
  const deadline = highlightWindow?.endsAt ?? endOfToday();
  const previous = () => setCurrentIndex((index) => (index - 1 + offers.length) % offers.length);
  const next = () => setCurrentIndex((index) => (index + 1) % offers.length);

  return (
    <section id="ofertas" className="relative scroll-mt-24 overflow-hidden bg-deep text-chalk">
      <div className="border-b border-chalk/12">
        <div className="shell-wide flex min-h-12 items-center justify-between gap-5 py-3">
          <p className="flex items-center gap-2 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-chalk/70">
            <Clock3 className="size-3.5 text-[#d97962]" aria-hidden />
            Vitrine ativa agora
          </p>
          <p className="numeric text-xs text-chalk/55">
            {offers.length} {offers.length === 1 ? 'oportunidade selecionada' : 'oportunidades selecionadas'}
          </p>
        </div>
      </div>

      <div className="shell-wide py-20 md:py-28">
        <Reveal as="header" className="mb-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="eyebrow text-[#d97962]">Oferta do dia</p>
            <h2 className="mt-6 max-w-4xl text-balance lowercase text-[2.75rem] leading-[0.96] md:text-6xl lg:text-[4.75rem]">
              hoje o desejo encontra <span className="italic text-[#d9e2eb]">a hora certa</span>
            </h2>
          </div>
          <div className="border-l border-chalk/16 pl-6 lg:min-w-80">
            <p className="mb-4 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-chalk/50">
              A oferta selecionada termina em
            </p>
            <Countdown key={highlight.id} target={deadline} invert />
          </div>
        </Reveal>

        <Reveal>
          <div
            role="region"
            aria-roledescription="carrossel"
            aria-label="Ofertas da vitrine do dia"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
            }}
          >
            <div className="mb-5 flex items-center justify-between gap-5">
              <p className="numeric text-xs text-chalk/60" aria-live="polite">
                {String(currentIndex + 1).padStart(2, '0')} / {String(offers.length).padStart(2, '0')}
              </p>
              {offers.length > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={previous}
                    aria-label="Oferta anterior"
                    title="Oferta anterior"
                    className="grid size-11 place-items-center rounded-full border border-chalk/25 text-chalk transition-colors hover:border-chalk hover:bg-chalk hover:text-ink"
                  >
                    <ChevronLeft className="size-5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    aria-label="Próxima oferta"
                    title="Próxima oferta"
                    className="grid size-11 place-items-center rounded-full border border-chalk/25 text-chalk transition-colors hover:border-chalk hover:bg-chalk hover:text-ink"
                  >
                    <ChevronRight className="size-5" aria-hidden />
                  </button>
                </div>
              )}
            </div>

            <div aria-live="polite" aria-atomic="true">
              <motion.div
                key={highlight.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <HighlightOffer product={highlight} headline={highlightWindow?.headline} />
              </motion.div>
            </div>

            {offers.length > 1 && (
              <div className="mt-5 h-px overflow-hidden bg-chalk/15" aria-hidden>
                <div
                  key={highlight.id}
                  className="offer-progress h-full bg-[#d97962]"
                  style={{ animationDuration: `${ROTATION_MS}ms`, animationPlayState: paused ? 'paused' : 'running' }}
                />
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function EmptyDailyOffers() {
  return (
    <section id="ofertas" className="relative scroll-mt-24 bg-deep text-chalk">
      <div className="grid min-h-[38rem] lg:grid-cols-2">
        <div className="flex items-center">
          <Reveal className="w-full px-5 py-20 md:px-10 lg:px-16 xl:px-24">
            <p className="eyebrow text-[#d97962]">Vitrine do dia</p>
            <h2 className="mt-7 max-w-2xl text-balance lowercase text-[2.75rem] leading-[0.96] md:text-6xl">
              a próxima escolha especial <span className="italic text-[#d9e2eb]">está chegando</span>
            </h2>
            <p className="mt-7 max-w-lg text-pretty leading-relaxed text-chalk/65">
              A curadoria de hoje está sendo preparada. Enquanto isso, descubra o catálogo ou fale com a equipe para encontrar uma condição especial.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/catalogo"
                className="btn-primary inline-flex h-13 items-center justify-center gap-2 rounded-full bg-chalk px-8 text-sm font-medium text-ink hover:bg-limewash"
              >
                Explorar catálogo
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <WhatsAppButton message={generalMessage('uma condição especial de hoje')} variant="outline-invert" size="lg">
                Perguntar no WhatsApp
              </WhatsAppButton>
            </div>
          </Reveal>
        </div>
        <div className="relative min-h-[28rem] overflow-hidden lg:min-h-full">
          <img
            src="/img/cat-perfumes-importados-v2-896.webp"
            alt="Seleção de perfumes importados sobre uma bancada de mármore"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-deep/35 via-transparent to-transparent" aria-hidden />
        </div>
      </div>
    </section>
  );
}

function HighlightOffer({ product, headline }: { product: Product; headline?: string }) {
  const discount = discountPercent(product.price, product.promoPrice);

  return (
    <article className="grid overflow-hidden bg-chalk text-ink lg:grid-cols-[minmax(0,1.08fr)_minmax(26rem,0.92fr)]">
      <Link
        to={`/produto/${product.slug}`}
        className="group relative block aspect-4/5 overflow-hidden bg-limewash sm:aspect-16/11 lg:aspect-auto lg:min-h-[38rem]"
      >
        <img
          src={product.images[0]}
          alt={`${product.name} — ${product.brand}`}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-deep/65 via-transparent to-transparent" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-chalk md:p-8">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em]">
            {product.brand} · {formatVolume(product.volumeMl)}
          </p>
          <span className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-chalk/70">Ver produto</span>
        </div>
        {discount !== null && (
          <span className="numeric absolute left-5 top-5 bg-[#c85f49] px-4 py-2 text-sm font-medium text-chalk md:left-8 md:top-8">
            −{discount}% hoje
          </span>
        )}
      </Link>

      <div className="flex flex-col justify-center p-7 sm:p-10 md:p-14 lg:p-16">
        <p className="eyebrow text-[#b54832]">Escolha principal</p>
        <p className="mt-7 max-w-md text-pretty text-sm font-medium leading-relaxed text-stone">
          {headline ?? 'Uma escolha especial para transformar vontade em presença.'}
        </p>
        <h3 className="mt-5 max-w-xl text-balance font-display text-4xl leading-none md:text-5xl">
          <Link to={`/produto/${product.slug}`} className="transition-colors hover:text-aegean">
            {product.name}
          </Link>
        </h3>
        <p className="mt-6 max-w-lg text-pretty leading-relaxed text-stone">{product.description}</p>

        <div className="my-8 h-px bg-salt" aria-hidden />
        <Price price={product.price} promoPrice={product.promoPrice} size="lg" showInstallments />

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <WhatsAppButton message={offerMessage(product)} size="lg">
            Garantir este preço
          </WhatsAppButton>
          <Link
            to={`/produto/${product.slug}`}
            className="link-underline self-center text-sm text-stone transition-colors hover:text-ink"
          >
            Conhecer a fragrância
          </Link>
        </div>

        <p className="mt-7 font-mono text-[0.55rem] uppercase tracking-[0.15em] text-ash">
          Disponibilidade confirmada pelo WhatsApp
        </p>
      </div>
    </article>
  );
}
