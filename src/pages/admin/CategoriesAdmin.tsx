import { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Field, FormSection, Select, TextInput, Toggle } from '@/components/admin/Field';
import { useStore } from '@/contexts/StoreContext';
import { categoriesService } from '@/services/content.service';
import { ICON_NAMES, resolveIcon } from '@/utils/icons';
import { slugify } from '@/utils/slug';
import type { Category } from '@/types';

type Draft = Omit<Category, 'id'>;

const BLANK: Draft = {
  slug: '',
  name: '',
  tagline: '',
  icon: 'Sparkles',
  image: '',
  order: 99,
  active: true,
};

export default function CategoriesAdmin() {
  const { categories, refresh } = useStore();
  const [drafts, setDrafts] = useState<Category[]>(categories);
  const [creating, setCreating] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => setDrafts(categories), [categories]);

  const patch = (id: string, changes: Partial<Draft>) =>
    setDrafts((current) => current.map((item) => (item.id === id ? { ...item, ...changes } : item)));

  const save = async () => {
    setBusy(true);
    try {
      await Promise.all(
        drafts.map(({ id, ...rest }) => categoriesService.update(id, rest)),
      );
      if (creating && creating.name) {
        await categoriesService.create({ ...creating, slug: creating.slug || slugify(creating.name) });
        setCreating(null);
      }
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const remove = async (category: Category) => {
    if (!window.confirm(`Excluir a categoria "${category.name}"? Os produtos nela ficam sem vitrine.`))
      return;
    setBusy(true);
    try {
      await categoriesService.remove(category.id);
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <AdminHeader
        title="Categorias"
        description="Definem as vitrines da home e as rotas do catálogo."
        action={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCreating(BLANK)}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-salt px-5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-stone transition-colors hover:border-aegean hover:text-aegean"
            >
              <Plus className="size-3.5" aria-hidden />
              Nova
            </button>
            <button
              type="button"
              onClick={() => void save()}
              disabled={busy}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-aegean text-chalk px-6 font-mono text-[0.62rem] uppercase tracking-[0.14em] disabled:opacity-50"
            >
              {busy && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
              Salvar
            </button>
          </div>
        }
      />

      {creating && (
        <FormSection title="Nova categoria">
          <CategoryFields draft={creating} onChange={(changes) => setCreating({ ...creating, ...changes })} />
          <button
            type="button"
            onClick={() => setCreating(null)}
            className="mt-5 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ash hover:text-stone"
          >
            Descartar
          </button>
        </FormSection>
      )}

      <div className="space-y-4">
        {drafts.map((category) => {
          const Icon = resolveIcon(category.icon);
          return (
            <FormSection key={category.id} title={category.name || 'Sem nome'}>
              <div className="mb-5 flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg border border-aegean/40">
                  <Icon className="size-4 text-aegean" aria-hidden />
                </span>
                <code className="font-mono text-xs text-ash">/catalogo/{category.slug}</code>
                <button
                  type="button"
                  onClick={() => void remove(category)}
                  aria-label={`Excluir ${category.name}`}
                  className="ml-auto grid size-9 place-items-center rounded-md text-stone transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>

              <CategoryFields draft={category} onChange={(changes) => patch(category.id, changes)} />
            </FormSection>
          );
        })}
      </div>
    </div>
  );
}

function CategoryFields({
  draft,
  onChange,
}: {
  draft: Draft;
  onChange: (changes: Partial<Draft>) => void;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Field label="Nome">
        <TextInput value={draft.name} onChange={(event) => onChange({ name: event.target.value })} />
      </Field>

      <Field label="Slug" hint="Endereço da vitrine no catálogo.">
        <TextInput
          value={draft.slug}
          onChange={(event) => onChange({ slug: slugify(event.target.value) })}
          placeholder={slugify(draft.name)}
        />
      </Field>

      <Field label="Chamada" className="md:col-span-2">
        <TextInput
          value={draft.tagline}
          onChange={(event) => onChange({ tagline: event.target.value })}
          placeholder="Uma linha que explica a seleção"
        />
      </Field>

      <Field label="Imagem (URL)" className="md:col-span-2">
        <TextInput
          type="url"
          value={draft.image}
          onChange={(event) => onChange({ image: event.target.value })}
        />
      </Field>

      <Field label="Ícone">
        <Select value={draft.icon} onChange={(event) => onChange({ icon: event.target.value })}>
          {ICON_NAMES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Ordem">
        <TextInput
          type="number"
          min={1}
          value={draft.order}
          onChange={(event) => onChange({ order: Number(event.target.value) })}
        />
      </Field>

      <Toggle
        label="Visível na loja"
        checked={draft.active}
        onChange={(value) => onChange({ active: value })}
      />
    </div>
  );
}
