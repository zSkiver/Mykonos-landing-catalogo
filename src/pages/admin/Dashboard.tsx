import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DatabaseZap, Flame, Loader2, Package, RotateCcw, Wallet } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { resetLocal } from '@/services/local-db';
import { seedInitialStore } from '@/services/seed.service';
import { isSupabaseEnabled } from '@/supabase/client';
import { PRODUCT_KIND_LABEL } from '@/types';
import { formatPrice } from '@/utils/format';
import { resolveDailyOffers } from '@/utils/offers';
import { buildStats } from '@/utils/stats';

export default function Dashboard() {
  const { products, offers, loading, refresh } = useStore();
  const { user } = useAuth();
  const stats = useMemo(() => buildStats(products), [products]);
  const dailyOfferCount = useMemo(
    () => resolveDailyOffers(products, offers).length,
    [products, offers],
  );
  const [seeding, setSeeding] = useState(false);
  const maxKind = Math.max(1, ...stats.byKind.map((entry) => entry.count));

  return (
    <div className="space-y-8">
      <AdminHeader
        title={`Olá, ${user?.name.split(' ')[0] ?? 'equipe'}`}
        description="Panorama do catálogo em tempo real. A disponibilidade é sempre confirmada pelo WhatsApp."
        action={
          <Link
            to="/admin/produtos/novo"
            className="inline-flex h-10 items-center rounded-full bg-aegean px-5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-chalk"
          >
            Novo produto
          </Link>
        }
      />

      {!isSupabaseEnabled && <LocalModeNotice onReset={refresh} />}
      {isSupabaseEnabled && user?.role === 'admin' && stats.activeProducts === 0 && !loading && (
        <SeedCatalogNotice
          busy={seeding}
          onSeed={async () => {
            setSeeding(true);
            try {
              await seedInitialStore();
              await refresh();
            } finally {
              setSeeding(false);
            }
          }}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Package}
          label="Produtos ativos"
          value={String(stats.activeProducts)}
          hint={`${stats.totalProducts} cadastrados no total`}
        />
        <StatCard
          icon={Flame}
          label="Ofertas do dia"
          value={String(dailyOfferCount)}
          hint="Exibidas na vitrine da home"
        />
        <StatCard
          icon={Wallet}
          label="Preço médio"
          value={formatPrice(stats.averagePrice)}
          hint="Valor de referência do catálogo"
        />
      </div>

      <section className="rounded-2xl bg-chalk p-6 ring-1 ring-salt">
        <h2 className="font-display text-lg text-ink">Catálogo por tipo</h2>
        <dl className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {stats.byKind.map((entry) => (
            <div key={entry.kind}>
              <div className="flex items-baseline justify-between">
                <dt className="text-sm text-stone">{PRODUCT_KIND_LABEL[entry.kind]}</dt>
                <dd className="numeric text-sm text-ink">{entry.count}</dd>
              </div>
              <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-salt">
                <div
                  className="h-full rounded-full bg-aegean transition-[width] duration-700"
                  style={{ width: `${(entry.count / maxKind) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

function SeedCatalogNotice({ busy, onSeed }: { busy: boolean; onSeed: () => Promise<void> }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-aegean/40 bg-aegean/6 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <DatabaseZap className="mt-0.5 size-5 shrink-0 text-aegean" aria-hidden />
        <div>
          <h2 className="font-display text-lg text-ink">Banco pronto para receber o catálogo</h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-stone">
            Importe os itens iniciais para começar a editar no painel. Depois, os novos produtos e suas imagens serão gravados no Supabase.
          </p>
        </div>
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={() => void onSeed()}
        className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-aegean px-5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-chalk disabled:opacity-50"
      >
        {busy ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <DatabaseZap className="size-3.5" aria-hidden />}
        {busy ? 'Importando' : 'Importar catálogo'}
      </button>
    </section>
  );
}

function LocalModeNotice({ onReset }: { onReset: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);

  const reset = async () => {
    if (!window.confirm('Isso descarta as alterações deste navegador e recarrega o catálogo inicial. Continuar?')) return;
    setBusy(true);
    try {
      resetLocal();
      await onReset();
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-aegean/40 bg-aegean/6 p-6">
      <h2 className="font-display text-lg text-ink">Modo local</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone">
        O Supabase ainda não está configurado, então o catálogo e as edições ficam guardados apenas neste navegador.
      </p>
      <button
        type="button"
        onClick={() => void reset()}
        disabled={busy}
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-full border border-aegean px-5 text-sm text-aegean transition-colors hover:bg-aegean hover:text-chalk disabled:opacity-50"
      >
        <RotateCcw className="size-3.5" aria-hidden />
        Recarregar catálogo inicial
      </button>
    </section>
  );
}

function StatCard({ icon: Icon, label, value, hint }: { icon: React.ElementType; label: string; value: string; hint: string }) {
  return (
    <article className="rounded-2xl bg-chalk p-6 ring-1 ring-salt">
      <Icon className="size-5 text-aegean" aria-hidden />
      <p className="mt-5 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-ash">{label}</p>
      <p className="numeric mt-2 text-2xl text-ink">{value}</p>
      <p className="mt-1.5 text-xs text-stone">{hint}</p>
    </article>
  );
}
