-- ---------------------------------------------------------------------------
-- Vitrine do dia — complemento do seed-catalogo.sql
--
-- O seed anterior marcou `dailyOffer = true` em oito produtos mas não criou
-- nenhuma linha em `offers`. Para o painel (Ofertas do dia) essa combinação é
-- resíduo: produto na vitrine sem janela promocional que o sustente. Ele
-- oferece limpar, e a limpeza chama setDailyOffer(id, false) — foi assim que
-- os oito voltaram a false.
--
-- Aqui os dois lados andam juntos: a flag e a janela com prazo. Idempotente.
-- ---------------------------------------------------------------------------

begin;

-- Janelas promocionais válidas por 7 dias, com o preço que já está no produto.
delete from public.offers where id like 'off-%';

insert into public.offers (id, "productId", headline, "promoPrice", "endsAt", active)
select
  'off-' || p.id,
  p.id,
  case
    when p."promoPrice" is not null then 'Preço especial por tempo limitado'
    else 'Destaque da vitrine'
  end,
  coalesce(p."promoPrice", p.price),
  (extract(epoch from now()) * 1000)::bigint + 7 * 86400000::bigint,
  true
from public.products p
where p.id in (
  'p-sauvage-edp',      -- 799 (de 899)
  'p-eros',             -- 469 (de 529)
  'p-khamrah',          -- 249 (de 289)
  'p-yara',             -- destaque sem desconto
  'p-club-de-nuit',     -- 239 (de 279)
  'p-floratta-blue',    -- 119 (de 139)
  'p-egeo-body-spray',  -- 64,90 (de 79,90)
  'p-kit-arabe'         -- destaque sem desconto
);

-- Reativa a flag nos mesmos oito, agora com janela por trás.
update public.products
set "dailyOffer" = true
where id in (
  'p-sauvage-edp','p-eros','p-khamrah','p-yara',
  'p-club-de-nuit','p-floratta-blue','p-egeo-body-spray','p-kit-arabe'
);

commit;
