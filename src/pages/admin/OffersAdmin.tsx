import { useMemo, useState } from 'react';
import { CalendarClock, Loader2, Pause, Play, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Field, FormSection, Select, TextInput, Toggle } from '@/components/admin/Field';
import { useStore } from '@/contexts/StoreContext';
import { offersService } from '@/services/content.service';
import { setDailyOffer } from '@/services/products.service';
import type { Offer, Product } from '@/types';
import { endOfToday, formatPrice } from '@/utils/format';
import { activeOfferForProduct } from '@/utils/offers';

function toDateTimeInput(timestamp: number): string {
  const date = new Date(timestamp);
  const local = new Date(timestamp - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function formatDeadline(timestamp: number): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(timestamp);
}

export default function OffersAdmin() {
  const { products, offers, refresh } = useStore();
  const [productId, setProductId] = useState('');
  const [headline, setHeadline] = useState('Oferta especial de hoje');
  const [promoPrice, setPromoPrice] = useState<number | undefined>();
  const [endsAt, setEndsAt] = useState(toDateTimeInput(endOfToday()));
  const [active, setActive] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableProducts = useMemo(
    () => products.filter((product) => product.active).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    [products],
  );
  const selectedProduct = products.find((product) => product.id === productId);
  const deadline = new Date(endsAt).getTime();
  const invalidPrice = Boolean(
    selectedProduct && promoPrice && promoPrice >= selectedProduct.price,
  );
  const canCreate = Boolean(
    selectedProduct &&
      headline.trim() &&
      promoPrice &&
      promoPrice > 0 &&
      !invalidPrice &&
      Number.isFinite(deadline) &&
      deadline > Date.now(),
  );

  const createOffer = async () => {
    if (!selectedProduct || !promoPrice || !canCreate) return;
    setBusy(true);
    setError(null);

    try {
      const reusable = offers.find(
        (offer) => offer.productId === selectedProduct.id && offer.endsAt > Date.now(),
      );
      const payload = {
        productId: selectedProduct.id,
        headline: headline.trim(),
        promoPrice,
        endsAt: deadline,
        active,
      };

      if (reusable) await offersService.update(reusable.id, payload);
      else await offersService.create(payload);

      setProductId('');
      setHeadline('Oferta especial de hoje');
      setPromoPrice(undefined);
      setEndsAt(toDateTimeInput(endOfToday()));
      setActive(true);
      await refresh();
    } catch (cause) {
      console.error('[offers-admin] falha ao salvar oferta', cause);
      setError('Não foi possível salvar a oferta. Confira os dados e tente novamente.');
    } finally {
      setBusy(false);
    }
  };

  const toggleOffer = async (offer: Offer) => {
    setBusy(true);
    setError(null);
    try {
      await offersService.update(offer.id, { active: !offer.active });
      await refresh();
    } catch (cause) {
      console.error('[offers-admin] falha ao alterar oferta', cause);
      setError('Não foi possível alterar essa oferta.');
    } finally {
      setBusy(false);
    }
  };

  const removeOffer = async (offer: Offer) => {
    const product = products.find((item) => item.id === offer.productId);
    if (!window.confirm(`Excluir a oferta de "${product?.name ?? 'produto'}"?`)) return;
    setBusy(true);
    setError(null);
    try {
      await offersService.remove(offer.id);
      await refresh();
    } catch (cause) {
      console.error('[offers-admin] falha ao excluir oferta', cause);
      setError('Não foi possível excluir essa oferta.');
    } finally {
      setBusy(false);
    }
  };

  const removeLegacyOffer = async (product: Product) => {
    setBusy(true);
    setError(null);
    try {
      await setDailyOffer(product.id, false);
      await refresh();
    } catch (cause) {
      console.error('[offers-admin] falha ao remover oferta antiga', cause);
      setError('Não foi possível remover o produto da vitrine.');
    } finally {
      setBusy(false);
    }
  };

  const legacyOffers = products.filter(
    (product) => product.dailyOffer && !activeOfferForProduct(product.id, offers),
  );

  return (
    <div className="space-y-6 pb-16">
      <AdminHeader
        title="Ofertas do dia"
        description="Crie e organize os produtos que ganham destaque na vitrine principal da loja."
      />

      {error && (
        <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/6 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <FormSection
        title="Nova oferta"
        description="O preço promocional vale até o prazo definido e aparece automaticamente em toda a loja."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Produto" className="md:col-span-2">
            <Select
              value={productId}
              onChange={(event) => {
                const nextProduct = products.find((product) => product.id === event.target.value);
                setProductId(event.target.value);
                setPromoPrice(nextProduct?.promoPrice);
              }}
            >
              <option value="">Selecione um produto</option>
              {availableProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} — {product.brand} · {formatPrice(product.price)}
                </option>
              ))}
            </Select>
            {availableProducts.length === 0 && (
              <span className="mt-2 block text-xs text-stone">
                Não há produtos ativos. <Link to="/admin" className="text-aegean underline">Importe ou cadastre o catálogo primeiro.</Link>
              </span>
            )}
          </Field>

          <Field label="Chamada da vitrine" className="md:col-span-2" hint="Uma frase curta para vender o desejo, não apenas o desconto.">
            <TextInput
              value={headline}
              maxLength={90}
              onChange={(event) => setHeadline(event.target.value)}
              placeholder="A assinatura que todo mundo reconhece"
            />
          </Field>

          <Field
            label="Preço da oferta (R$)"
            hint={invalidPrice ? 'O preço da oferta deve ser menor que o preço normal.' : selectedProduct ? `Preço normal: ${formatPrice(selectedProduct.price)}` : undefined}
          >
            <TextInput
              type="number"
              min={0.01}
              step="0.01"
              value={promoPrice ?? ''}
              onChange={(event) => setPromoPrice(event.target.value ? Number(event.target.value) : undefined)}
              aria-invalid={invalidPrice}
            />
          </Field>

          <Field label="Termina em">
            <TextInput
              type="datetime-local"
              min={toDateTimeInput(Date.now())}
              value={endsAt}
              onChange={(event) => setEndsAt(event.target.value)}
            />
          </Field>

          <Toggle label="Publicar imediatamente" checked={active} onChange={setActive} />
        </div>

        <button
          type="button"
          onClick={() => void createOffer()}
          disabled={busy || !canCreate}
          className="mt-7 inline-flex h-11 items-center gap-2 rounded-full bg-aegean px-6 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-chalk disabled:opacity-40"
        >
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Plus className="size-4" aria-hidden />}
          Publicar oferta
        </button>
      </FormSection>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-xl text-ink">Campanhas programadas</h2>
            <p className="mt-1 text-sm text-stone">Ative, pause ou exclua uma oferta sem alterar o cadastro do produto.</p>
          </div>
          <span className="numeric text-sm text-aegean">{offers.length}</span>
        </div>

        {offers.length === 0 ? (
          <div className="border border-dashed border-salt px-6 py-12 text-center text-sm text-stone">
            Nenhuma campanha criada ainda.
          </div>
        ) : (
          <div className="grid gap-3 xl:grid-cols-2">
            {offers.map((offer) => {
              const product = products.find((item) => item.id === offer.productId);
              const expired = offer.endsAt <= Date.now();
              const status = expired ? 'Encerrada' : offer.active ? 'No ar' : 'Pausada';

              return (
                <article key={offer.id} className="grid grid-cols-[5.5rem_minmax(0,1fr)] overflow-hidden rounded-lg bg-chalk ring-1 ring-salt">
                  <div className="aspect-4/5 bg-limewash">
                    {product?.images[0] && <img src={product.images[0]} alt="" className="size-full object-cover" />}
                  </div>
                  <div className="min-w-0 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono text-[0.55rem] uppercase tracking-[0.16em] text-aegean">{status}</p>
                        <h3 className="mt-1 truncate font-display text-lg text-ink">{product?.name ?? 'Produto removido'}</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => void removeOffer(offer)}
                        disabled={busy}
                        aria-label={`Excluir oferta de ${product?.name ?? 'produto'}`}
                        title="Excluir oferta"
                        className="grid size-9 shrink-0 place-items-center rounded-md text-stone hover:bg-red-500/10 hover:text-red-500"
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    </div>

                    <p className="mt-2 line-clamp-1 text-xs text-stone">{offer.headline}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                      <strong className="numeric text-base text-ink">{formatPrice(offer.promoPrice)}</strong>
                      <span className="inline-flex items-center gap-1.5 text-stone">
                        <CalendarClock className="size-3.5" aria-hidden />
                        {formatDeadline(offer.endsAt)}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      {!expired && (
                        <button
                          type="button"
                          onClick={() => void toggleOffer(offer)}
                          disabled={busy}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-aegean"
                        >
                          {offer.active ? <Pause className="size-3.5" aria-hidden /> : <Play className="size-3.5" aria-hidden />}
                          {offer.active ? 'Pausar' : 'Ativar'}
                        </button>
                      )}
                      {product && (
                        <Link to={`/admin/produtos/${product.id}`} className="text-xs text-stone hover:text-ink">
                          Editar produto
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {legacyOffers.length > 0 && (
        <section className="rounded-lg border border-aegean/25 bg-aegean/5 p-5">
          <h2 className="font-display text-lg text-ink">Ofertas antigas do cadastro</h2>
          <p className="mt-1 text-sm text-stone">Estes produtos continuam na vitrine porque foram marcados diretamente no cadastro.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {legacyOffers.map((product) => (
              <div key={product.id} className="flex items-center gap-2 rounded-lg bg-chalk px-3 py-2 ring-1 ring-salt">
                <Link to={`/admin/produtos/${product.id}`} className="text-sm text-ink hover:text-aegean">
                  {product.name}
                </Link>
                <button
                  type="button"
                  onClick={() => void removeLegacyOffer(product)}
                  disabled={busy}
                  className="text-xs text-stone hover:text-red-500"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
