-- ---------------------------------------------------------------------------
-- Catálogo de demonstração da Mykonos Parfum
--
-- Rode no SQL Editor do Supabase DEPOIS da migração 20260808_product_variants.
-- É idempotente: pode rodar de novo sem duplicar nada.
--
-- ATENÇÃO ÀS FOTOS: os produtos apontam para as imagens de ambientação da
-- marca, não para fotos dos frascos reais. Servem para a demonstração; antes
-- de ir ao ar, troque pelas fotos do estoque em Painel › Produtos.
-- ---------------------------------------------------------------------------

begin;

-- Categoria quebrada criada nos primeiros testes: slug no singular e sem
-- imagem. É ela que aparece como card preto na home. Remova esta linha se
-- quiser mantê-la.
delete from public.categories where slug = 'perfume-importado';

-- --------------------------------------------------------------- categorias
--
-- Apagamos por id OU slug antes de inserir. `on conflict (id)` sozinho não
-- resolveria: quando o painel já criou a linha com id próprio e o mesmo slug,
-- quem estoura é o UNIQUE(slug), que o on conflict da chave primária não pega.

delete from public.categories
where id in ('cat-importados','cat-nacionais','cat-arabes','cat-body-splash','cat-kits','cat-cosmeticos','cat-skincare','cat-novidades')
   or slug in ('perfumes-importados','perfumes-nacionais','perfumes-arabes','body-splash','kit-perfumes','cosmeticos','skincare','novidades');

insert into public.categories (id, slug, name, tagline, icon, image, "order", active) values
  ('cat-importados',   'perfumes-importados', 'Perfumes Importados', 'As maisons europeias que definiram o perfume moderno.',           'Sparkles', '/img/cat-perfumes-importados-1280.webp', 1, true),
  ('cat-nacionais',    'perfumes-nacionais',  'Perfumes Nacionais',  'As casas brasileiras que a gente usa todo dia, com preço de gente.', 'Leaf',   '/img/cat-perfumes-nacionais-1280.webp',  2, true),
  ('cat-arabes',       'perfumes-arabes',     'Perfumes Árabes',     'Oud, âmbar e baunilha em concentrações que duram o dia inteiro.',  'Flame',    '/img/cat-perfumes-arabes-1280.webp',     3, true),
  ('cat-body-splash',  'body-splash',         'Body Splash',         'Fragrância leve para borrifar à vontade, no calor e depois do banho.', 'Droplet', '/img/cat-body-splash-1280.webp',        4, true),
  ('cat-kits',         'kit-perfumes',        'Kit Perfumes',        'Combinações prontas para presentear ou experimentar sem errar.',   'Gift',     '/img/cat-kit-perfumes-1280.webp',        5, true),
  ('cat-cosmeticos',   'cosmeticos',          'Cosméticos',          'Base, batom e fixador com pigmentação de alta cobertura.',         'Gem',      '/img/cat-cosmeticos-1280.webp',          6, true),
  ('cat-skincare',     'skincare',            'Skincare',            'Séruns e hidratantes com ativos em concentração clínica.',         'Sparkles', '/img/cat-skincare-1280.webp',            7, true),
  ('cat-novidades',    'novidades',           'Novidades',           'O que chegou nas últimas semanas, antes de esgotar.',              'Star',     '/img/cat-novidades-1280.webp',           8, true)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, tagline = excluded.tagline,
  icon = excluded.icon, image = excluded.image, "order" = excluded."order", active = excluded.active;

-- ------------------------------------------------------------------- marcas
--
-- `brandSlug` dos produtos é texto solto, sem chave estrangeira, então trocar
-- a linha da marca não quebra nenhum produto que já aponte para o slug.

delete from public.brands
where id in ('b-dior','b-chanel','b-ysl','b-paco','b-armani','b-versace','b-ch','b-lattafa','b-armaf','b-afnan','b-boticario','b-natura','b-mykonos')
   or slug in ('dior','chanel','yves-saint-laurent','paco-rabanne','giorgio-armani','versace','carolina-herrera','lattafa','armaf','afnan','o-boticario','natura','mykonos');

insert into public.brands (id, slug, name, origin, featured) values
  ('b-dior',      'dior',                 'Dior',                 'França',           true),
  ('b-chanel',    'chanel',               'Chanel',               'França',           true),
  ('b-ysl',       'yves-saint-laurent',   'Yves Saint Laurent',   'França',           true),
  ('b-paco',      'paco-rabanne',         'Paco Rabanne',         'França',           false),
  ('b-armani',    'giorgio-armani',       'Giorgio Armani',       'Itália',           false),
  ('b-versace',   'versace',              'Versace',              'Itália',           false),
  ('b-ch',        'carolina-herrera',     'Carolina Herrera',     'Espanha',          true),
  ('b-lattafa',   'lattafa',              'Lattafa',              'Emirados Árabes',  true),
  ('b-armaf',     'armaf',                'Armaf',                'Emirados Árabes',  false),
  ('b-afnan',     'afnan',                'Afnan',                'Emirados Árabes',  false),
  ('b-boticario', 'o-boticario',          'O Boticário',          'Brasil',           true),
  ('b-natura',    'natura',               'Natura',               'Brasil',           true),
  ('b-mykonos',   'mykonos',              'Mykonos Seleção',      'Brasil',           false)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, origin = excluded.origin, featured = excluded.featured;

-- ----------------------------------------------------------------- produtos
--
-- Só remove os produtos deste script. Os seus dois cadastros de teste
-- ("Myself EDP 100ml" e "sauvage") têm outros slugs e ficam intactos —
-- se quiser tirá-los antes da demonstração, apague pelo painel.
-- Apagar produto leva junto as ofertas dele, por causa do on delete cascade.

delete from public.products
where id in ('p-sauvage-edp','p-1-million','p-eros','p-good-girl','p-libre','p-coco-mademoiselle','p-acqua-di-gio',
             'p-khamrah','p-yara','p-asad','p-club-de-nuit','p-9pm',
             'p-malbec','p-floratta-blue','p-essencial-exclusivo','p-kaiak','p-egeo-dolce',
             'p-egeo-body-spray','p-nativa-ameixa','p-kit-arabe','p-kit-malbec')
   or slug in ('dior-sauvage-edp','paco-rabanne-1-million','versace-eros-edt','carolina-herrera-good-girl','ysl-libre-edp','chanel-coco-mademoiselle','armani-acqua-di-gio',
               'lattafa-khamrah','lattafa-yara','lattafa-asad','armaf-club-de-nuit-intense-man','afnan-9pm',
               'boticario-malbec','boticario-floratta-blue','natura-essencial-exclusivo','natura-kaiak-classico','boticario-egeo-dolce',
               'boticario-egeo-body-spray-choc','boticario-nativa-spa-ameixa-body-splash','kit-descoberta-arabe','kit-malbec-presente');

insert into public.products (
  id, slug, name, brand, "brandSlug", "categorySlug", kind, gender,
  description, story, price, "promoPrice", "volumeMl", variants,
  "olfactoryFamily", pyramid, longevity, projection, occasions, images,
  featured, "dailyOffer", "bestSeller", "isNew", exclusive, active,
  "createdAt", "updatedAt"
) values

-- IMPORTADOS -----------------------------------------------------------------
('p-sauvage-edp', 'dior-sauvage-edp', 'Sauvage Eau de Parfum', 'Dior', 'dior', 'perfumes-importados', 'importado', 'masculino',
 'Bergamota da Calábria e ambroxan sobre baunilha. O masculino mais vendido do mundo, e o que mais sai daqui.',
 'O Sauvage EDP é a versão mais redonda da família: mantém a abertura cítrica explosiva do EDT, mas troca a secagem seca por uma base de baunilha e ambroxan que segura o dia inteiro. É o perfume que a pessoa compra sem cheirar e não se arrepende.',
 899, 799, 100,
 '[{"id":"var-sauvage-60","volumeMl":60,"price":649}]'::jsonb,
 'Amadeirado ambarado',
 '{"top":["Bergamota da Calábria","Pimenta-do-reino"],"heart":["Lavanda","Noz-moscada","Sichuan"],"base":["Ambroxan","Baunilha","Cedro"]}'::jsonb,
 'extrema', 'intensa', '["Noite","Trabalho","Encontro"]'::jsonb,
 '["/img/cat-perfumes-importados-1280.webp","/img/band-loja-1920.webp"]'::jsonb,
 true, true, true, false, false, true,
 (extract(epoch from now()) * 1000)::bigint - 120 * 86400000::bigint, (extract(epoch from now()) * 1000)::bigint),

('p-1-million', 'paco-rabanne-1-million', '1 Million Eau de Toilette', 'Paco Rabanne', 'paco-rabanne', 'perfumes-importados', 'importado', 'masculino',
 'Canela, couro e âmbar em um frasco de lingote. Doce, quente e impossível de confundir.',
 null, 639, null, 100,
 '[{"id":"var-million-50","volumeMl":50,"price":449}]'::jsonb,
 'Amadeirado especiado',
 '{"top":["Toranja","Hortelã","Mandarina"],"heart":["Canela","Rosa","Especiarias"],"base":["Couro","Madeira branca","Âmbar"]}'::jsonb,
 'intensa', 'intensa', '["Noite","Festa"]'::jsonb,
 '["/img/cat-perfumes-importados-1280.webp","/img/cat-kit-perfumes-1280.webp"]'::jsonb,
 true, false, true, false, false, true,
 (extract(epoch from now()) * 1000)::bigint - 100 * 86400000::bigint, (extract(epoch from now()) * 1000)::bigint),

('p-eros', 'versace-eros-edt', 'Eros Eau de Toilette', 'Versace', 'versace', 'perfumes-importados', 'importado', 'masculino',
 'Menta, maçã verde e baunilha. Assinatura reconhecível a metros de distância.',
 null, 529, 469, 100,
 '[{"id":"var-eros-50","volumeMl":50,"price":379}]'::jsonb,
 'Aromático fougère',
 '{"top":["Menta","Maçã verde","Limão"],"heart":["Fava tonka","Gerânio","Flor de laranjeira"],"base":["Baunilha","Cedro","Vetiver","Musgo de carvalho"]}'::jsonb,
 'intensa', 'extrema', '["Noite","Festa","Encontro"]'::jsonb,
 '["/img/cat-perfumes-importados-1280.webp","/img/band-loja-1920.webp"]'::jsonb,
 false, true, true, false, false, true,
 (extract(epoch from now()) * 1000)::bigint - 180 * 86400000::bigint, (extract(epoch from now()) * 1000)::bigint),

('p-good-girl', 'carolina-herrera-good-girl', 'Good Girl Eau de Parfum', 'Carolina Herrera', 'carolina-herrera', 'perfumes-importados', 'importado', 'feminino',
 'Jasmim sambac e fava tonka sobre cacau. O salto que virou ícone da perfumaria feminina.',
 null, 879, null, 80,
 '[{"id":"var-goodgirl-50","volumeMl":50,"price":659}]'::jsonb,
 'Floral oriental',
 '{"top":["Amêndoa","Café","Bergamota"],"heart":["Jasmim sambac","Tuberosa","Flor de laranjeira"],"base":["Cacau","Fava tonka","Sândalo","Baunilha"]}'::jsonb,
 'extrema', 'intensa', '["Noite","Festa"]'::jsonb,
 '["/img/cat-perfumes-importados-1280.webp","/img/cat-perfumes-nacionais-1280.webp"]'::jsonb,
 true, false, true, false, false, true,
 (extract(epoch from now()) * 1000)::bigint - 90 * 86400000::bigint, (extract(epoch from now()) * 1000)::bigint),

('p-libre', 'ysl-libre-edp', 'Libre Eau de Parfum', 'Yves Saint Laurent', 'yves-saint-laurent', 'perfumes-importados', 'importado', 'feminino',
 'Lavanda francesa e flor de laranjeira marroquina com baunilha bourbon. Sofisticado sem ser discreto.',
 null, 919, null, 90,
 '[{"id":"var-libre-50","volumeMl":50,"price":689}]'::jsonb,
 'Floral amadeirado',
 '{"top":["Bergamota","Mandarina","Groselha preta"],"heart":["Lavanda","Flor de laranjeira","Jasmim"],"base":["Baunilha bourbon","Fava tonka","Cedro","Almíscar"]}'::jsonb,
 'intensa', 'moderada', '["Noite","Trabalho"]'::jsonb,
 '["/img/cat-perfumes-importados-1280.webp","/img/cat-body-splash-1280.webp"]'::jsonb,
 false, false, false, true, false, true,
 (extract(epoch from now()) * 1000)::bigint - 12 * 86400000::bigint, (extract(epoch from now()) * 1000)::bigint),

('p-coco-mademoiselle', 'chanel-coco-mademoiselle', 'Coco Mademoiselle Eau de Parfum', 'Chanel', 'chanel', 'perfumes-importados', 'importado', 'feminino',
 'Patchouli e laranja sobre rosa de maio. O oriental fresco que nunca saiu de moda.',
 null, 1249, null, 100,
 '[{"id":"var-coco-50","volumeMl":50,"price":899}]'::jsonb,
 'Oriental fresco',
 '{"top":["Laranja","Bergamota","Toranja"],"heart":["Rosa de maio","Jasmim","Lichia"],"base":["Patchouli","Vetiver","Baunilha","Almíscar branco"]}'::jsonb,
 'intensa', 'moderada', '["Trabalho","Dia a dia","Noite"]'::jsonb,
 '["/img/cat-perfumes-importados-1280.webp","/img/band-loja-1920.webp"]'::jsonb,
 true, false, true, false, true, true,
 (extract(epoch from now()) * 1000)::bigint - 200 * 86400000::bigint, (extract(epoch from now()) * 1000)::bigint),

('p-acqua-di-gio', 'armani-acqua-di-gio', 'Acqua di Giò Eau de Toilette', 'Giorgio Armani', 'giorgio-armani', 'perfumes-importados', 'importado', 'masculino',
 'Notas marinhas, bergamota e alecrim. O aquático que definiu o gênero e continua funcionando no calor.',
 null, 619, null, 100,
 '[{"id":"var-adg-50","volumeMl":50,"price":449}]'::jsonb,
 'Aquático aromático',
 '{"top":["Notas marinhas","Bergamota","Limão","Laranja"],"heart":["Alecrim","Jasmim","Pêssego"],"base":["Almíscar branco","Cedro","Patchouli"]}'::jsonb,
 'moderada', 'moderada', '["Dia a dia","Trabalho","Verão"]'::jsonb,
 '["/img/cat-perfumes-importados-1280.webp","/img/cat-skincare-1280.webp"]'::jsonb,
 false, false, false, false, false, true,
 (extract(epoch from now()) * 1000)::bigint - 150 * 86400000::bigint, (extract(epoch from now()) * 1000)::bigint),

-- ÁRABES ---------------------------------------------------------------------
('p-khamrah', 'lattafa-khamrah', 'Khamrah Eau de Parfum', 'Lattafa', 'lattafa', 'perfumes-arabes', 'arabe', 'unissex',
 'Canela, tâmara e baunilha bourbon. O árabe mais pedido da loja — doce, quente e impossível de ignorar.',
 'Khamrah virou fenômeno porque entrega em 100 ml uma sensação que perfumes cinco vezes mais caros cobram por 50. A abertura de canela e noz-moscada dura pouco; o que fica é a tâmara com praliné e baunilha, colada na pele por horas.',
 289, 249, 100, '[]'::jsonb,
 'Oriental gourmand',
 '{"top":["Canela","Noz-moscada","Bergamota"],"heart":["Praliné","Tâmara","Tuberosa"],"base":["Baunilha bourbon","Fava tonka","Âmbar","Benjoim"]}'::jsonb,
 'extrema', 'extrema', '["Noite","Inverno","Festa"]'::jsonb,
 '["/img/cat-perfumes-arabes-1280.webp","/img/cat-kit-perfumes-1280.webp"]'::jsonb,
 true, true, true, false, false, true,
 (extract(epoch from now()) * 1000)::bigint - 80 * 86400000::bigint, (extract(epoch from now()) * 1000)::bigint),

('p-yara', 'lattafa-yara', 'Yara Eau de Parfum', 'Lattafa', 'lattafa', 'perfumes-arabes', 'arabe', 'feminino',
 'Orquídea, heliotrópio e tâmara. Doce cremoso com rastro que atravessa o ambiente.',
 null, 219, null, 100, '[]'::jsonb,
 'Floral gourmand',
 '{"top":["Orquídea","Tâmara","Tangerina"],"heart":["Heliotrópio","Gardênia"],"base":["Baunilha","Sândalo","Almíscar"]}'::jsonb,
 'extrema', 'intensa', '["Dia a dia","Festa"]'::jsonb,
 '["/img/cat-perfumes-arabes-1280.webp","/img/cat-perfumes-nacionais-1280.webp"]'::jsonb,
 true, true, true, false, false, true,
 (extract(epoch from now()) * 1000)::bigint - 70 * 86400000::bigint, (extract(epoch from now()) * 1000)::bigint),

('p-asad', 'lattafa-asad', 'Asad Eau de Parfum', 'Lattafa', 'lattafa', 'perfumes-arabes', 'arabe', 'masculino',
 'Pimenta preta, café e tabaco. Amadeirado escuro para quem cansou de baunilha.',
 null, 249, null, 100, '[]'::jsonb,
 'Amadeirado especiado',
 '{"top":["Pimenta preta","Bergamota","Abacaxi"],"heart":["Café","Lavanda","Cominho"],"base":["Tabaco","Patchouli","Baunilha","Âmbar"]}'::jsonb,
 'intensa', 'intensa', '["Noite","Trabalho"]'::jsonb,
 '["/img/cat-perfumes-arabes-1280.webp","/img/band-loja-1920.webp"]'::jsonb,
 false, false, false, false, false, true,
 (extract(epoch from now()) * 1000)::bigint - 100 * 86400000::bigint, (extract(epoch from now()) * 1000)::bigint),

('p-club-de-nuit', 'armaf-club-de-nuit-intense-man', 'Club de Nuit Intense Man', 'Armaf', 'armaf', 'perfumes-arabes', 'arabe', 'masculino',
 'Abacaxi, bétula e almíscar. O amadeirado frutado que consolidou a perfumaria árabe no Brasil.',
 null, 279, 239, 105, '[]'::jsonb,
 'Amadeirado frutado',
 '{"top":["Abacaxi","Limão","Bergamota","Groselha preta"],"heart":["Bétula","Jasmim","Rosa"],"base":["Almíscar","Baunilha","Âmbar","Patchouli"]}'::jsonb,
 'intensa', 'extrema', '["Trabalho","Dia a dia","Noite"]'::jsonb,
 '["/img/cat-perfumes-arabes-1280.webp","/img/cat-perfumes-importados-1280.webp"]'::jsonb,
 true, true, true, false, false, true,
 (extract(epoch from now()) * 1000)::bigint - 140 * 86400000::bigint, (extract(epoch from now()) * 1000)::bigint),

('p-9pm', 'afnan-9pm', '9 PM Eau de Parfum', 'Afnan', 'afnan', 'perfumes-arabes', 'arabe', 'masculino',
 'Maçã, lavanda e baunilha. Doce na medida, feito para as horas em que o dia já acabou.',
 null, 259, null, 100, '[]'::jsonb,
 'Oriental amadeirado',
 '{"top":["Maçã","Canela","Lavanda"],"heart":["Âmbar","Baunilha","Flor de laranjeira"],"base":["Fava tonka","Madeira de cashmere","Almíscar"]}'::jsonb,
 'intensa', 'intensa', '["Noite","Encontro"]'::jsonb,
 '["/img/cat-perfumes-arabes-1280.webp","/img/cat-kit-perfumes-1280.webp"]'::jsonb,
 false, false, false, true, false, true,
 (extract(epoch from now()) * 1000)::bigint - 15 * 86400000::bigint, (extract(epoch from now()) * 1000)::bigint),

-- NACIONAIS ------------------------------------------------------------------
('p-malbec', 'boticario-malbec', 'Malbec Desodorante Colônia', 'O Boticário', 'o-boticario', 'perfumes-nacionais', 'nacional', 'masculino',
 'Amadeirado com notas de uva e madeiras nobres. O clássico brasileiro que atravessou gerações.',
 null, 189, null, 100, '[]'::jsonb,
 'Amadeirado',
 '{"top":["Uva","Bergamota","Pimenta"],"heart":["Madeiras","Especiarias"],"base":["Âmbar","Almíscar","Baunilha"]}'::jsonb,
 'moderada', 'moderada', '["Dia a dia","Trabalho"]'::jsonb,
 '["/img/cat-perfumes-nacionais-1280.webp","/img/band-loja-1920.webp"]'::jsonb,
 true, false, true, false, false, true,
 (extract(epoch from now()) * 1000)::bigint - 60 * 86400000::bigint, (extract(epoch from now()) * 1000)::bigint),

('p-floratta-blue', 'boticario-floratta-blue', 'Floratta Blue Desodorante Colônia', 'O Boticário', 'o-boticario', 'perfumes-nacionais', 'nacional', 'feminino',
 'Floral aquático leve, com jasmim e almíscar. O nacional mais pedido para o dia a dia no calor.',
 null, 139, 119, 75, '[]'::jsonb,
 'Floral aquático',
 '{"top":["Bergamota","Notas aquáticas"],"heart":["Jasmim","Flor de lótus"],"base":["Almíscar branco","Cedro"]}'::jsonb,
 'moderada', 'moderada', '["Dia a dia","Trabalho"]'::jsonb,
 '["/img/cat-perfumes-nacionais-1280.webp","/img/cat-body-splash-1280.webp"]'::jsonb,
 true, true, true, false, false, true,
 (extract(epoch from now()) * 1000)::bigint - 45 * 86400000::bigint, (extract(epoch from now()) * 1000)::bigint),

('p-essencial-exclusivo', 'natura-essencial-exclusivo', 'Essencial Exclusivo Masculino', 'Natura', 'natura', 'perfumes-nacionais', 'nacional', 'masculino',
 'Amadeirado brasileiro com priprioca e cumaru. Elegante, quente e reconhecível sem gritar.',
 null, 259, null, 100, '[]'::jsonb,
 'Amadeirado ambarado',
 '{"top":["Pimenta rosa","Bergamota"],"heart":["Priprioca","Violeta"],"base":["Cumaru","Âmbar","Sândalo"]}'::jsonb,
 'intensa', 'moderada', '["Noite","Trabalho"]'::jsonb,
 '["/img/cat-perfumes-nacionais-1280.webp","/img/cat-perfumes-importados-1280.webp"]'::jsonb,
 false, false, false, false, false, true,
 (extract(epoch from now()) * 1000)::bigint - 55 * 86400000::bigint, (extract(epoch from now()) * 1000)::bigint),

('p-kaiak', 'natura-kaiak-classico', 'Kaiak Clássico Masculino', 'Natura', 'natura', 'perfumes-nacionais', 'nacional', 'masculino',
 'Cítrico aromático e limpo. O perfume de banho tomado — leve, barato e sempre bem-vindo.',
 null, 129, null, 100, '[]'::jsonb,
 'Cítrico aromático',
 '{"top":["Limão","Bergamota","Alecrim"],"heart":["Lavanda","Gerânio"],"base":["Almíscar","Madeiras claras"]}'::jsonb,
 'leve', 'leve', '["Dia a dia","Academia","Verão"]'::jsonb,
 '["/img/cat-perfumes-nacionais-1280.webp","/img/cat-skincare-1280.webp"]'::jsonb,
 false, false, false, false, false, true,
 (extract(epoch from now()) * 1000)::bigint - 75 * 86400000::bigint, (extract(epoch from now()) * 1000)::bigint),

('p-egeo-dolce', 'boticario-egeo-dolce', 'Egeo Dolce Desodorante Colônia', 'O Boticário', 'o-boticario', 'perfumes-nacionais', 'nacional', 'feminino',
 'Gourmand com caramelo e frutas vermelhas. Doce, jovem e com boa fixação para o preço.',
 null, 149, null, 90, '[]'::jsonb,
 'Gourmand frutado',
 '{"top":["Framboesa","Pêssego"],"heart":["Caramelo","Flor de laranjeira"],"base":["Baunilha","Almíscar"]}'::jsonb,
 'moderada', 'moderada', '["Dia a dia","Festa"]'::jsonb,
 '["/img/cat-perfumes-nacionais-1280.webp","/img/cat-kit-perfumes-1280.webp"]'::jsonb,
 false, false, false, true, false, true,
 (extract(epoch from now()) * 1000)::bigint - 8 * 86400000::bigint, (extract(epoch from now()) * 1000)::bigint),

-- BODY SPLASH ----------------------------------------------------------------
('p-egeo-body-spray', 'boticario-egeo-body-spray-choc', 'Egeo Body Spray Choc', 'O Boticário', 'o-boticario', 'body-splash', 'body-splash', 'feminino',
 'Chocolate e frutas vermelhas em spray corporal. Refresca na hora e deixa rastro doce e discreto.',
 null, 79.90, 64.90, 200, '[]'::jsonb,
 'Gourmand frutado',
 null, 'leve', 'leve', '["Dia a dia","Verão"]'::jsonb,
 '["/img/cat-body-splash-1280.webp","/img/cat-perfumes-nacionais-1280.webp"]'::jsonb,
 true, true, true, false, false, true,
 (extract(epoch from now()) * 1000)::bigint - 25 * 86400000::bigint, (extract(epoch from now()) * 1000)::bigint),

('p-nativa-ameixa', 'boticario-nativa-spa-ameixa-body-splash', 'Nativa SPA Ameixa Body Splash', 'O Boticário', 'o-boticario', 'body-splash', 'body-splash', 'feminino',
 'Ameixa e baunilha. O body splash campeão de recompra, para usar depois do banho sem pesar.',
 null, 89.90, null, 200, '[]'::jsonb,
 'Frutado gourmand',
 null, 'leve', 'leve', '["Dia a dia","Verão"]'::jsonb,
 '["/img/cat-body-splash-1280.webp","/img/cat-skincare-1280.webp"]'::jsonb,
 false, false, true, false, false, true,
 (extract(epoch from now()) * 1000)::bigint - 35 * 86400000::bigint, (extract(epoch from now()) * 1000)::bigint),

-- KITS -----------------------------------------------------------------------
('p-kit-arabe', 'kit-descoberta-arabe', 'Kit Descoberta Árabe — 4 decants de 10 ml', 'Mykonos Seleção', 'mykonos', 'kit-perfumes', 'kit', 'unissex',
 'Khamrah, Yara, Asad e 9 PM em decants de 10 ml, na caixa com fita. Para presentear ou decidir sem errar.',
 'A dúvida mais comum no WhatsApp é qual árabe começar. Este kit responde: quatro fragrâncias que cobrem o espectro inteiro — do gourmand ao amadeirado seco — em frascos de 10 ml que duram cerca de três semanas cada.',
 249, null, 40, '[]'::jsonb,
 null, null, null, null, '["Presente","Experimentar"]'::jsonb,
 '["/img/cat-kit-perfumes-1280.webp","/img/cat-perfumes-arabes-1280.webp"]'::jsonb,
 true, true, true, false, true, true,
 (extract(epoch from now()) * 1000)::bigint - 30 * 86400000::bigint, (extract(epoch from now()) * 1000)::bigint),

('p-kit-malbec', 'kit-malbec-presente', 'Kit Malbec — colônia 100 ml + pós-barba', 'O Boticário', 'o-boticario', 'kit-perfumes', 'kit', 'masculino',
 'Malbec 100 ml com o pós-barba da linha, embalados juntos na caixa de presente.',
 null, 279, 239, 100, '[]'::jsonb,
 null, null, null, null, '["Presente","Dia dos Pais"]'::jsonb,
 '["/img/cat-kit-perfumes-1280.webp","/img/cat-perfumes-nacionais-1280.webp"]'::jsonb,
 false, false, false, true, false, true,
 (extract(epoch from now()) * 1000)::bigint - 5 * 86400000::bigint, (extract(epoch from now()) * 1000)::bigint)

on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, brand = excluded.brand,
  "brandSlug" = excluded."brandSlug", "categorySlug" = excluded."categorySlug",
  kind = excluded.kind, gender = excluded.gender, description = excluded.description,
  story = excluded.story, price = excluded.price, "promoPrice" = excluded."promoPrice",
  "volumeMl" = excluded."volumeMl", variants = excluded.variants,
  "olfactoryFamily" = excluded."olfactoryFamily", pyramid = excluded.pyramid,
  longevity = excluded.longevity, projection = excluded.projection,
  occasions = excluded.occasions, images = excluded.images,
  featured = excluded.featured, "dailyOffer" = excluded."dailyOffer",
  "bestSeller" = excluded."bestSeller", "isNew" = excluded."isNew",
  exclusive = excluded.exclusive, active = excluded.active,
  "updatedAt" = excluded."updatedAt";

-- ------------------------------------------------------------- configurações

insert into public.settings (
  id, "storeName", "whatsappNumber", instagram, email, address, "mapsQuery",
  "openingHours", "aboutTitle", "aboutText", announcement, faq
) values (
  'store',
  'Mykonos Parfum',
  '5564992970843',
  'https://www.instagram.com/mykonos.parfum/',
  'contato@mykonosparfum.com.br',
  'Rio Verde, GO',
  'Mykonos Parfum, Rio Verde, GO',
  '[{"days":"Segunda a sexta","hours":"09h — 19h"},{"days":"Sábado","hours":"09h — 15h"},{"days":"Domingo","hours":"Somente WhatsApp"}]'::jsonb,
  'Perfume, maquiagem e cuidado na mesma prateleira',
  '["A Mykonos Parfum nasceu em Rio Verde com uma ideia simples: reunir perfume importado, nacional e árabe no mesmo lugar, com quem sabe explicar a diferença.","A seleção é feita para acompanhar a sua rotina, o seu estilo e os seus momentos especiais.","Venha nos visitar em Rio Verde, GO, ou fale com a equipe pelo WhatsApp para confirmar a disponibilidade."]'::jsonb,
  'Rio Verde, GO · Loja física · Atendimento pelo WhatsApp',
  '[{"id":"f1","question":"Os perfumes são originais?","answer":"Sim. Trabalhamos apenas com frascos lacrados, com lote visível. Antes de separar, mandamos foto do seu frasco pelo WhatsApp para você conferir."},{"id":"f2","question":"Qual a diferença entre perfume importado, nacional e árabe?","answer":"Importados costumam ser mais discretos e versáteis; árabes trabalham com concentração maior de óleo, o que resulta em mais fixação pelo mesmo preço; nacionais têm o melhor custo para o dia a dia. No WhatsApp indicamos com base no que você já gosta."},{"id":"f3","question":"Como funciona a compra?","answer":"Você escolhe o produto no site e clica em comprar — isso abre o WhatsApp com o item e o tamanho já preenchidos. A partir daí confirmamos disponibilidade, forma de pagamento e retirada ou entrega."},{"id":"f4","question":"Posso escolher entre 50 e 100 ml?","answer":"Sim. Nos perfumes com mais de um tamanho, a página do produto mostra as opções e o preço de cada uma. A escolha já vai junto na mensagem do WhatsApp."},{"id":"f5","question":"Vocês têm loja física?","answer":"Temos, em Rio Verde, GO. Confirme a disponibilidade pelo WhatsApp antes de vir, porque parte do estoque gira rápido."}]'::jsonb
)
on conflict (id) do update set
  "storeName" = excluded."storeName", "whatsappNumber" = excluded."whatsappNumber",
  instagram = excluded.instagram, email = excluded.email, address = excluded.address,
  "mapsQuery" = excluded."mapsQuery", "openingHours" = excluded."openingHours",
  "aboutTitle" = excluded."aboutTitle", "aboutText" = excluded."aboutText",
  announcement = excluded.announcement, faq = excluded.faq;

commit;
