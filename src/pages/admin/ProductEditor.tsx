import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Field, FormSection, Select, TextArea, TextInput, Toggle } from '@/components/admin/Field';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { useStore } from '@/contexts/StoreContext';
import { createProduct, updateProduct } from '@/services/products.service';
import {
  GENDER_LABEL,
  INTENSITY_LABEL,
  PRODUCT_KIND_LABEL,
  type Gender,
  type Intensity,
  type ProductInput,
  type ProductKind,
  type ProductVariant,
} from '@/types';
import { randomId, slugify } from '@/utils/slug';

const EMPTY: ProductInput = {
  slug: '',
  name: '',
  brand: '',
  brandSlug: '',
  categorySlug: 'perfumes-importados',
  kind: 'importado',
  gender: 'unissex',
  description: '',
  story: '',
  price: 0,
  promoPrice: undefined,
  volumeMl: 100,
  variants: [],
  olfactoryFamily: '',
  pyramid: { top: [], heart: [], base: [] },
  longevity: 'moderada',
  projection: 'moderada',
  occasions: [],
  images: [],
  featured: false,
  dailyOffer: false,
  bestSeller: false,
  isNew: true,
  exclusive: false,
  active: true,
};

const toList = (value: string): string[] =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export default function ProductEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'novo';
  const navigate = useNavigate();

  const { products, categories, brands, refresh } = useStore();

  const existing = useMemo(() => products.find((product) => product.id === id), [products, id]);
  const [form, setForm] = useState<ProductInput>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!existing) return;
    const {
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      sku: _sku,
      code: _code,
      video: _video,
      stock: _stock,
      ...rest
    } = existing as typeof existing & { sku?: string; code?: string; video?: string; stock?: number };
    setForm(rest);
  }, [existing]);

  const set = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const patchVariant = (index: number, changes: Partial<ProductVariant>) =>
    setForm((current) => ({
      ...current,
      variants: (current.variants ?? []).map((variant, position) =>
        position === index ? { ...variant, ...changes } : variant,
      ),
    }));

  const addVariant = () =>
    setForm((current) => {
      const last = current.variants?.at(-1);
      return {
        ...current,
        variants: [
          ...(current.variants ?? []),
          {
            id: randomId('var'),
            // Sugere o próximo tamanho a partir do último preenchido.
            volumeMl: last ? last.volumeMl * 2 : Math.max(1, Math.round(current.volumeMl / 2)),
            price: last ? last.price * 2 : Math.round(current.price / 2),
          },
        ],
      };
    });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (form.images.length === 0) {
      setError('Adicione ao menos uma imagem — ela vira a capa do produto no catálogo.');
      return;
    }

    // Linhas em branco ou repetindo o volume padrão só confundiriam o seletor.
    const variants = (form.variants ?? []).filter(
      (variant) =>
        variant.volumeMl > 0 && variant.price > 0 && variant.volumeMl !== form.volumeMl,
    );

    if (new Set(variants.map((variant) => variant.volumeMl)).size !== variants.length) {
      setError('Há dois tamanhos com o mesmo volume. Ajuste antes de salvar.');
      return;
    }

    setSaving(true);
    try {
      const brand = brands.find((item) => item.name === form.brand);
      const payload: ProductInput = {
        ...form,
        slug: form.slug || slugify(`${form.brand}-${form.name}`),
        brandSlug: brand?.slug ?? slugify(form.brand),
        promoPrice: form.promoPrice && form.promoPrice > 0 ? form.promoPrice : undefined,
        variants,
      };

      if (isNew || !id) await createProduct(payload);
      else await updateProduct(id, payload);

      await refresh();
      navigate('/admin/produtos');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar o produto.');
    } finally {
      setSaving(false);
    }
  };

  if (!isNew && !existing && products.length > 0) {
    return (
      <div className="rounded-2xl bg-chalk p-10 text-center ring-1 ring-salt">
        <p className="text-sm text-stone">Produto não encontrado.</p>
        <Link to="/admin/produtos" className="mt-4 inline-block text-sm text-aegean hover:underline">
          Voltar para a lista
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="space-y-6 pb-16">
      <Link
        to="/admin/produtos"
        className="inline-flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-stone transition-colors hover:text-aegean"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        Produtos
      </Link>

      <AdminHeader
        title={isNew ? 'Novo produto' : form.name || 'Editar produto'}
        description={isNew ? 'Cadastre um item para aparecer no catálogo.' : 'Atualize as informações do produto.'}
        action={
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-aegean text-chalk px-6 font-mono text-[0.62rem] uppercase tracking-[0.14em] disabled:opacity-50"
          >
            {saving && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
            {isNew ? 'Cadastrar' : 'Salvar alterações'}
          </button>
        }
      />

      {error && (
        <p role="alert" className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <FormSection title="Identificação" description="O que aparece no card e na página do produto.">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Nome" className="md:col-span-2">
            <TextInput
              required
              value={form.name}
              onChange={(event) => set('name', event.target.value)}
              placeholder="Sauvage Elixir"
            />
          </Field>

          <Field label="Marca">
            <TextInput
              required
              list="brands-datalist"
              value={form.brand}
              onChange={(event) => set('brand', event.target.value)}
              placeholder="Dior"
            />
            <datalist id="brands-datalist">
              {brands.map((brand) => (
                <option key={brand.id} value={brand.name} />
              ))}
            </datalist>
          </Field>

          <Field label="Categoria">
            <Select
              value={form.categorySlug}
              onChange={(event) => set('categorySlug', event.target.value)}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Tipo">
            <Select
              value={form.kind}
              onChange={(event) => set('kind', event.target.value as ProductKind)}
            >
              {Object.entries(PRODUCT_KIND_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Gênero">
            <Select value={form.gender} onChange={(event) => set('gender', event.target.value as Gender)}>
              {Object.entries(GENDER_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Descrição curta" className="md:col-span-2" hint="Duas linhas no máximo — aparece no card e na busca.">
            <TextArea
              required
              value={form.description}
              onChange={(event) => set('description', event.target.value)}
            />
          </Field>

          <Field label="Texto longo" className="md:col-span-2" hint="Opcional. Exibido ao lado da pirâmide olfativa.">
            <TextArea value={form.story ?? ''} onChange={(event) => set('story', event.target.value)} />
          </Field>
        </div>
      </FormSection>

      <FormSection
        title="Preço e apresentação padrão"
        description="É a apresentação principal do perfume. Outros tamanhos entram na seção abaixo."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Preço (R$)">
            <TextInput
              type="number"
              min={0}
              step="0.01"
              required
              value={form.price || ''}
              onChange={(event) => set('price', Number(event.target.value))}
            />
          </Field>

          <Field label="Preço promocional (R$)" hint="Deixe vazio para não ter promoção.">
            <TextInput
              type="number"
              min={0}
              step="0.01"
              value={form.promoPrice ?? ''}
              onChange={(event) =>
                set('promoPrice', event.target.value ? Number(event.target.value) : undefined)
              }
            />
          </Field>

          <Field label="Volume (ml)">
            <TextInput
              type="number"
              min={1}
              value={form.volumeMl}
              onChange={(event) => set('volumeMl', Number(event.target.value))}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection
        title="Outros tamanhos"
        description="Para o mesmo perfume em 50, 100, 200 ml. Nome, fotos, descrição e notas são compartilhados — muda só o volume e o preço, e o cliente escolhe na página do produto."
      >
        <div className="space-y-4">
          {(form.variants ?? []).map((variant, index) => (
            <div
              key={variant.id}
              className="grid items-end gap-4 rounded-xl border border-salt p-4 sm:grid-cols-[repeat(3,minmax(0,1fr))_auto]"
            >
              <Field label="Volume (ml)">
                <TextInput
                  type="number"
                  min={1}
                  value={variant.volumeMl}
                  onChange={(event) =>
                    patchVariant(index, { volumeMl: Number(event.target.value) })
                  }
                />
              </Field>

              <Field label="Preço (R$)">
                <TextInput
                  type="number"
                  min={0}
                  step="0.01"
                  value={variant.price || ''}
                  onChange={(event) => patchVariant(index, { price: Number(event.target.value) })}
                />
              </Field>

              <Field label="Promocional (R$)">
                <TextInput
                  type="number"
                  min={0}
                  step="0.01"
                  value={variant.promoPrice ?? ''}
                  onChange={(event) =>
                    patchVariant(index, {
                      promoPrice: event.target.value ? Number(event.target.value) : undefined,
                    })
                  }
                />
              </Field>

              <div className="flex items-center gap-2 pb-1">
                <Toggle
                  label="Esgotado"
                  checked={variant.soldOut ?? false}
                  onChange={(value) => patchVariant(index, { soldOut: value })}
                />
                <button
                  type="button"
                  onClick={() =>
                    set('variants', (form.variants ?? []).filter((_, i) => i !== index))
                  }
                  aria-label={`Remover tamanho ${variant.volumeMl} ml`}
                  className="grid size-11 shrink-0 place-items-center rounded-lg border border-salt text-stone transition-colors hover:border-red-400/50 hover:text-red-500"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addVariant}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-salt px-5 text-sm text-stone transition-colors hover:border-aegean hover:text-aegean"
          >
            <Plus className="size-3.5" aria-hidden />
            Adicionar tamanho
          </button>
        </div>
      </FormSection>

      <FormSection title="Imagens" description="A primeira imagem é a capa do card.">
        <ImageUploader images={form.images} onChange={(images) => set('images', images)} />
      </FormSection>

      <FormSection
        title="Perfil olfativo"
        description="Separe as notas por vírgula. Deixe vazio para produtos que não são perfume."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Família olfativa">
            <TextInput
              value={form.olfactoryFamily ?? ''}
              onChange={(event) => set('olfactoryFamily', event.target.value)}
              placeholder="Amadeirado especiado"
            />
          </Field>

          <Field label="Ocasiões" hint="Ex.: Noite, Trabalho, Encontro">
            <TextInput
              value={(form.occasions ?? []).join(', ')}
              onChange={(event) => set('occasions', toList(event.target.value))}
            />
          </Field>

          <Field label="Notas de saída" className="md:col-span-2">
            <TextInput
              value={(form.pyramid?.top ?? []).join(', ')}
              onChange={(event) =>
                set('pyramid', { ...(form.pyramid ?? EMPTY.pyramid!), top: toList(event.target.value) })
              }
              placeholder="Canela, Cardamomo, Bergamota"
            />
          </Field>

          <Field label="Notas de coração" className="md:col-span-2">
            <TextInput
              value={(form.pyramid?.heart ?? []).join(', ')}
              onChange={(event) =>
                set('pyramid', { ...(form.pyramid ?? EMPTY.pyramid!), heart: toList(event.target.value) })
              }
              placeholder="Lavanda, Jasmim"
            />
          </Field>

          <Field label="Notas de fundo" className="md:col-span-2">
            <TextInput
              value={(form.pyramid?.base ?? []).join(', ')}
              onChange={(event) =>
                set('pyramid', { ...(form.pyramid ?? EMPTY.pyramid!), base: toList(event.target.value) })
              }
              placeholder="Âmbar, Sândalo, Baunilha"
            />
          </Field>

          <Field label="Fixação">
            <Select
              value={form.longevity ?? 'moderada'}
              onChange={(event) => set('longevity', event.target.value as Intensity)}
            >
              {Object.entries(INTENSITY_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Projeção">
            <Select
              value={form.projection ?? 'moderada'}
              onChange={(event) => set('projection', event.target.value as Intensity)}
            >
              {Object.entries(INTENSITY_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </FormSection>

    </form>
  );
}
