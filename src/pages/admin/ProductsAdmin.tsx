import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Search, Trash2 } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { TextInput } from '@/components/admin/Field';
import { useStore } from '@/contexts/StoreContext';
import { useAuth } from '@/contexts/AuthContext';
import { deleteProduct } from '@/services/products.service';
import { effectivePrice, formatPrice } from '@/utils/format';
import { PRODUCT_KIND_LABEL } from '@/types';
import { cn } from '@/utils/cn';

export default function ProductsAdmin() {
  const { products, refresh, loading } = useStore();
  const { permissions } = useAuth();
  const [term, setTerm] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = term.trim().toLowerCase();
    if (!query) return products;
    return products.filter((product) =>
      `${product.name} ${product.brand}`.toLowerCase().includes(query),
    );
  }, [products, term]);

  const run = async (id: string, action: () => Promise<void>) => {
    setBusyId(id);
    try {
      await action();
      await refresh();
    } finally {
      setBusyId(null);
    }
  };

  const remove = (id: string, name: string) => {
    if (!window.confirm(`Excluir "${name}"? Essa ação não pode ser desfeita.`)) return;
    void run(id, () => deleteProduct(id));
  };

  return (
    <div className="space-y-7">
      <AdminHeader
        title="Produtos"
        description={`${products.length} itens no catálogo.`}
        action={
          permissions.canCreateProduct && (
            <Link
              to="/admin/produtos/novo"
              className="inline-flex h-10 items-center rounded-full bg-aegean text-chalk px-5 font-mono text-[0.62rem] uppercase tracking-[0.14em]"
            >
              Novo produto
            </Link>
          )
        }
      />

      <div className="flex items-center gap-3 rounded-lg border border-salt bg-chalk px-4 focus-within:border-aegean">
        <Search className="size-4 shrink-0 text-aegean" aria-hidden />
        <TextInput
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Buscar por nome ou marca"
          aria-label="Buscar produtos"
          className="border-0 bg-transparent px-0 hover:border-0 focus:border-0"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl ring-1 ring-salt">
        <table className="w-full min-w-[44rem] border-collapse text-left">
          <thead>
            <tr className="bg-limewash">
              {['Produto', 'Tipo', 'Preço', ''].map((header) => (
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
            {filtered.map((product) => (
              <tr
                key={product.id}
                className={cn('transition-colors hover:bg-limewash', busyId === product.id && 'opacity-50')}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.images[0]}
                      alt=""
                      loading="lazy"
                      className="size-11 shrink-0 rounded-md object-cover"
                    />
                    <div className="min-w-0">
                      <Link
                        to={`/admin/produtos/${product.id}`}
                        className="block truncate text-sm text-ink transition-colors hover:text-aegean"
                      >
                        {product.name}
                      </Link>
                      <p className="truncate text-xs text-ash">
                        {product.brand}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3 text-xs text-stone">{PRODUCT_KIND_LABEL[product.kind]}</td>

                <td className="numeric px-4 py-3 text-sm text-ink">
                  {formatPrice(effectivePrice(product.price, product.promoPrice))}
                  {product.promoPrice && (
                    <span className="ml-2 text-[0.65rem] text-aegean">promo</span>
                  )}
                </td>

                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Link
                      to={`/admin/produtos/${product.id}`}
                      aria-label={`Editar ${product.name}`}
                      className="grid size-8 place-items-center rounded-md text-stone transition-colors hover:bg-limewash hover:text-aegean"
                    >
                      <Pencil className="size-3.5" aria-hidden />
                    </Link>

                    {permissions.canDeleteProduct && (
                      <button
                        type="button"
                        onClick={() => remove(product.id, product.name)}
                        aria-label={`Excluir ${product.name}`}
                        className="grid size-8 place-items-center rounded-md text-stone transition-colors hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 className="size-3.5" aria-hidden />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="px-6 py-14 text-center text-sm text-ash">
            {loading ? 'Carregando produtos…' : 'Nenhum produto encontrado com esse termo.'}
          </p>
        )}
      </div>
    </div>
  );
}
