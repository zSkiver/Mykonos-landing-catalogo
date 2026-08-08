-- Apresentações do mesmo perfume (50 ml, 100 ml, 200 ml…).
--
-- Fica em jsonb porque a lista é curta, sempre lida junto com o produto e
-- nunca consultada isoladamente — uma tabela à parte só acrescentaria um join
-- em toda listagem do catálogo.
--
-- Formato de cada item:
--   { "id": "var_ab12", "volumeMl": 100, "price": 899, "promoPrice": 799, "soldOut": false }
--
-- A apresentação padrão continua em products.price / products."volumeMl";
-- esta coluna guarda apenas os tamanhos adicionais.

alter table public.products
  add column if not exists variants jsonb not null default '[]'::jsonb;

comment on column public.products.variants is
  'Tamanhos adicionais do mesmo perfume. O tamanho padrão vive em price/volumeMl.';
