import { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { TextInput, Toggle } from '@/components/admin/Field';
import { useStore } from '@/contexts/StoreContext';
import { brandsService } from '@/services/content.service';
import { slugify } from '@/utils/slug';
import type { Brand } from '@/types';

export default function BrandsAdmin() {
  const { brands, products, refresh } = useStore();
  const [drafts, setDrafts] = useState<Brand[]>(brands);
  const [name, setName] = useState('');
  const [origin, setOrigin] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => setDrafts(brands), [brands]);

  const patch = (id: string, changes: Partial<Omit<Brand, 'id'>>) =>
    setDrafts((current) => current.map((item) => (item.id === id ? { ...item, ...changes } : item)));

  const save = async () => {
    setBusy(true);
    try {
      await Promise.all(drafts.map(({ id, ...rest }) => brandsService.update(id, rest)));
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const add = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setBusy(true);
    try {
      await brandsService.create({
        name: trimmed,
        slug: slugify(trimmed),
        origin: origin.trim() || undefined,
        featured: false,
      });
      setName('');
      setOrigin('');
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const remove = async (brand: Brand) => {
    const inUse = products.filter((product) => product.brandSlug === brand.slug).length;
    const message = inUse
      ? `${brand.name} está em ${inUse} produto(s). Excluir mesmo assim?`
      : `Excluir a marca "${brand.name}"?`;
    if (!window.confirm(message)) return;

    setBusy(true);
    try {
      await brandsService.remove(brand.id);
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <AdminHeader
        title="Marcas"
        description="Alimentam o filtro de marcas do catálogo."
        action={
          <button
            type="button"
            onClick={() => void save()}
            disabled={busy}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-aegean text-chalk px-6 font-mono text-[0.62rem] uppercase tracking-[0.14em] disabled:opacity-50"
          >
            {busy && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
            Salvar
          </button>
        }
      />

      <section className="rounded-2xl bg-chalk p-6 ring-1 ring-salt">
        <h2 className="mb-5 font-display text-lg text-ink">Adicionar marca</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <TextInput
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nome da marca"
            aria-label="Nome da marca"
          />
          <TextInput
            value={origin}
            onChange={(event) => setOrigin(event.target.value)}
            placeholder="País de origem"
            aria-label="País de origem"
          />
          <button
            type="button"
            onClick={() => void add()}
            disabled={busy || !name.trim()}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg border border-salt px-5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-stone transition-colors hover:border-aegean hover:text-aegean disabled:opacity-40"
          >
            <Plus className="size-3.5" aria-hidden />
            Incluir
          </button>
        </div>
      </section>

      <div className="overflow-x-auto rounded-2xl ring-1 ring-salt">
        <table className="w-full min-w-[40rem] border-collapse text-left">
          <thead>
            <tr className="bg-limewash">
              {['Marca', 'Origem', 'Produtos', 'Destaque', ''].map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="px-4 py-3.5 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-ash"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-salt">
            {drafts.map((brand) => (
              <tr key={brand.id}>
                <td className="px-4 py-3">
                  <TextInput
                    value={brand.name}
                    onChange={(event) => patch(brand.id, { name: event.target.value })}
                    aria-label={`Nome da marca ${brand.name}`}
                  />
                </td>
                <td className="px-4 py-3">
                  <TextInput
                    value={brand.origin ?? ''}
                    onChange={(event) => patch(brand.id, { origin: event.target.value })}
                    aria-label={`Origem da marca ${brand.name}`}
                  />
                </td>
                <td className="numeric px-4 py-3 text-sm text-stone">
                  {products.filter((product) => product.brandSlug === brand.slug).length}
                </td>
                <td className="px-4 py-3">
                  <Toggle
                    label="Destaque"
                    checked={brand.featured}
                    onChange={(value) => patch(brand.id, { featured: value })}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => void remove(brand)}
                    aria-label={`Excluir ${brand.name}`}
                    className="grid size-9 place-items-center rounded-md text-stone transition-colors hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
