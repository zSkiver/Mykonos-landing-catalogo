import { useEffect, useRef, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import {
  GENDER_LABEL,
  PRODUCT_KIND_LABEL,
  SORT_LABEL,
  type Brand,
  type CatalogFilters,
  type Gender,
  type ProductKind,
  type SortKey,
} from '@/types';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { formatPrice } from '@/utils/format';
import { cn } from '@/utils/cn';

interface Props {
  filters: CatalogFilters;
  setFilter: <K extends keyof CatalogFilters>(key: K, value: CatalogFilters[K]) => void;
  clear: () => void;
  activeCount: number;
  brands: Brand[];
  bounds: { min: number; max: number };
  resultCount: number;
  /** Quando a categoria vem da rota, o filtro correspondente é ocultado. */
  lockedCategory?: boolean;
  categories: { slug: string; name: string }[];
}

export function ProductFilters(props: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mb-8 flex items-center gap-3 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-11 items-center gap-2.5 rounded-full border border-ink/20 px-5 text-sm transition-colors hover:border-aegean hover:text-aegean"
        >
          <SlidersHorizontal className="size-3.5" aria-hidden />
          Filtros
          {props.activeCount > 0 && (
            <span className="numeric rounded-full bg-aegean px-2 py-0.5 text-[0.62rem] text-chalk">
              {props.activeCount}
            </span>
          )}
        </button>
        <SortSelect value={props.filters.sort} onChange={(value) => props.setFilter('sort', value)} />
      </div>

      {/* Painel fixo no desktop. */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100dvh-8rem)] overflow-y-auto pr-4">
          <FilterFields {...props} />
        </div>
      </aside>

      {/* Gaveta no mobile. */}
      {open && (
        <div className="fixed inset-0 z-70 lg:hidden">
          <button
            type="button"
            aria-label="Fechar filtros"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/45"
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(22rem,90vw)] flex-col bg-chalk">
            <div className="flex items-center justify-between border-b border-salt px-6 py-5">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-ash">Filtros</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar filtros"
                className="grid size-9 place-items-center rounded-full text-stone hover:text-ink"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-7">
              <FilterFields {...props} />
            </div>

            <div className="border-t border-salt px-6 py-5">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn-primary h-12 w-full rounded-full bg-aegean text-sm font-medium text-chalk"
              >
                Ver {props.resultCount} {props.resultCount === 1 ? 'produto' : 'produtos'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FilterFields({
  filters,
  setFilter,
  clear,
  activeCount,
  brands,
  bounds,
  lockedCategory,
  categories,
}: Props) {
  return (
    <div className="space-y-9">
      <SearchField value={filters.search} onChange={(value) => setFilter('search', value)} />

      {!lockedCategory && (
        <Field label="Categoria">
          <NativeSelect
            value={filters.category ?? ''}
            onChange={(value) => setFilter('category', value || null)}
            aria-label="Filtrar por categoria"
          >
            <option value="">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </NativeSelect>
        </Field>
      )}

      <Field label="Marca">
        <NativeSelect
          value={filters.brand ?? ''}
          onChange={(value) => setFilter('brand', value || null)}
          aria-label="Filtrar por marca"
        >
          <option value="">Todas as marcas</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.slug}>
              {brand.name}
            </option>
          ))}
        </NativeSelect>
      </Field>

      {/* O tipo vem da categoria: dentro de "Perfumes importados" oferecer
          "Nacional" só produz uma lista vazia. Só faz sentido no acervo todo. */}
      {!filters.category && (
        <Field label="Tipo">
          <ChipRow
            options={Object.entries(PRODUCT_KIND_LABEL) as [ProductKind, string][]}
            selected={filters.kind}
            onSelect={(value) => setFilter('kind', value)}
          />
        </Field>
      )}

      <Field label="Gênero">
        <ChipRow
          options={Object.entries(GENDER_LABEL) as [Gender, string][]}
          selected={filters.gender}
          onSelect={(value) => setFilter('gender', value)}
        />
      </Field>

      <Field label="Faixa de preço">
        <PriceRange
          min={bounds.min}
          max={bounds.max}
          value={filters.maxPrice}
          onChange={(value) => setFilter('maxPrice', value)}
        />
      </Field>

      <Field label="Ordenar por">
        <SortSelect value={filters.sort} onChange={(value) => setFilter('sort', value)} />
      </Field>

      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={filters.onlyOffers}
          onChange={(event) => setFilter('onlyOffers', event.target.checked)}
          className="size-4 accent-aegean"
        />
        <span className="text-sm text-ink">Somente em oferta</span>
      </label>

      {activeCount > 0 && (
        <button type="button" onClick={clear} className="link-underline text-sm text-aegean">
          Limpar filtros ({activeCount})
        </button>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3.5 font-mono text-[0.58rem] uppercase tracking-[0.22em] text-ash">{label}</p>
      {children}
    </div>
  );
}

function SearchField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [local, setLocal] = useState(value);
  const debounced = useDebouncedValue(local, 300);
  const emit = useRef(onChange);
  emit.current = onChange;

  useEffect(() => setLocal(value), [value]);
  useEffect(() => {
    emit.current(debounced);
  }, [debounced]);

  return (
    <div className="flex items-center gap-3 border-b border-salt pb-3 focus-within:border-aegean">
      <Search className="size-4 shrink-0 text-aegean" aria-hidden />
      <input
        type="search"
        value={local}
        onChange={(event) => setLocal(event.target.value)}
        placeholder="Nome, marca ou nota"
        aria-label="Buscar no catálogo"
        className="w-full bg-transparent text-sm text-ink placeholder:text-ash focus:outline-none"
      />
    </div>
  );
}

function NativeSelect({
  value,
  onChange,
  children,
  ...rest
}: Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'> & {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full appearance-none border border-ink/15 bg-chalk px-4 py-3 text-sm text-ink transition-colors hover:border-ink/30 focus:border-aegean focus:outline-none"
      {...rest}
    >
      {children}
    </select>
  );
}

function SortSelect({ value, onChange }: { value: SortKey; onChange: (value: SortKey) => void }) {
  return (
    <NativeSelect
      value={value}
      onChange={(next) => onChange(next as SortKey)}
      aria-label="Ordenar resultados"
    >
      {Object.entries(SORT_LABEL).map(([key, label]) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </NativeSelect>
  );
}

function ChipRow<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: [T, string][];
  selected: T | null;
  onSelect: (value: T | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(([value, label]) => {
        const active = selected === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(active ? null : value)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-[0.8rem] transition-colors duration-400',
              active
                ? 'border-aegean bg-aegean text-chalk'
                : 'border-ink/15 text-stone hover:border-ink/35 hover:text-ink',
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function PriceRange({
  min,
  max,
  value,
  onChange,
}: {
  min: number;
  max: number;
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  const current = value ?? max;

  return (
    <div>
      <input
        type="range"
        min={min}
        max={max}
        step={10}
        value={current}
        onChange={(event) => {
          const next = Number(event.target.value);
          onChange(next >= max ? null : next);
        }}
        aria-label="Preço máximo"
        className="w-full accent-aegean"
      />
      <div className="mt-2 flex justify-between font-mono text-[0.65rem] text-ash">
        <span>{formatPrice(min)}</span>
        <span className="text-ink">até {formatPrice(current)}</span>
      </div>
    </div>
  );
}
