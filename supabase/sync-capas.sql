-- ---------------------------------------------------------------------------
-- Sincroniza as capas de categoria com o que src/data/seed.ts define.
--
-- POR QUE ISTO EXISTE: com as variáveis do Supabase preenchidas, o site lê o
-- catálogo do banco e ignora o seed.ts. Editar o arquivo sozinho não muda nada
-- na tela — foi o que aconteceu com estas capas.
--
-- Quatro categorias passam a usar as fotos de produtos reais. Body Splash,
-- Kit Perfumes, Cosméticos e Novidades seguem com as ambientações da marca,
-- porque ainda não existe foto real delas no projeto.
-- ---------------------------------------------------------------------------

begin;

update public.categories as c
set image = v.image
from (values
  ('perfumes-importados', '/img/cat-perfumes-importados-v2-896.webp'),
  ('perfumes-nacionais',  '/img/cat-perfumes-nacionais-v2-896.webp'),
  ('perfumes-arabes',     '/img/cat-perfumes-arabes-v2-896.webp'),
  ('skincare',            '/img/cat-skincare-v2-896.webp'),
  -- Volta para a ambientação: o arquivo que estava aqui era, na verdade,
  -- a foto dos perfumes nacionais.
  ('body-splash',         '/img/cat-body-splash-1280.webp')
) as v(slug, image)
where c.slug = v.slug;

commit;

-- Conferência:
-- select slug, image from public.categories order by "order";
