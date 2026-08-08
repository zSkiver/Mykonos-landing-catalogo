# Mykonos Parfum

Loja de perfumes em Rio Verde, GO. Landing page + painel administrativo.
**Não há carrinho:** todo caminho de compra termina numa conversa no WhatsApp com
o produto e o tamanho já preenchidos na mensagem.

React 19 · TypeScript · Vite 8 · Tailwind 4 · Framer Motion · GSAP · Supabase

```powershell
npm run dev        # servidor
npm run build      # tsc -b && vite build
npm run typecheck  # só os tipos
npm run lint       # oxlint
npm run images     # gera os WebP de src/assets/ para public/img/
```

---

## A armadilha número um: o site lê do Supabase, não do seed

Com `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` preenchidos no `.env`,
`isSupabaseEnabled` fica `true` e **todo o conteúdo vem do banco**. O
`src/data/seed.ts` passa a ser apenas o fallback do modo local.

Isso já custou horas de depuração: mexer no `seed.ts` e recarregar não muda nada
na tela. Antes de investigar qualquer "sumiu da home", confira o banco:

```powershell
# Lê o .env e conta as linhas de cada tabela
$lines = Get-Content '.env'
$url = (($lines | Where-Object { $_ -like 'VITE_SUPABASE_URL=*' }) -replace '^VITE_SUPABASE_URL=','').Trim()
$key = (($lines | Where-Object { $_ -like 'VITE_SUPABASE_PUBLISHABLE_KEY=*' }) -replace '^VITE_SUPABASE_PUBLISHABLE_KEY=','').Trim()
$h = @{ apikey = $key; Authorization = "Bearer $key" }
foreach ($t in @('categories','products','brands','offers','settings')) {
  $r = Invoke-RestMethod -Uri ($url + '/rest/v1/' + $t + '?select=id') -Headers $h
  "{0,-12} {1}" -f $t, @($r).Count
}
```

A chave publicável só lê — o RLS bloqueia escrita anônima. Para popular o banco,
rode SQL no editor do Supabase; pelo REST não dá.

### Modo local (sem Supabase)

Cai no `seed.ts` e grava no `localStorage`. O prefixo das chaves carrega
`SEED_VERSION` (exportado pelo `seed.ts`) — **incremente esse número ao mudar o
seed**, senão o navegador continua servindo a cópia velha. Versões antigas são
apagadas sozinhas na primeira leitura.

---

## Banco

`supabase/schema.sql` é a fonte da verdade. Migrações em `supabase/migrations/`,
catálogo de demonstração em `supabase/seed-catalogo.sql`.

Colunas usam **camelCase entre aspas** (`"categorySlug"`, `"promoPrice"`). RLS
está ativo em tudo: leitura pública do catálogo, escrita restrita a
`is_staff()` / `is_admin()`.

Duas ciladas já enfrentadas ao escrever SQL de seed:

- **`on conflict (id)` não cobre `UNIQUE(slug)`.** Se o painel já criou a linha
  com id próprio e o mesmo slug, o insert estoura. Use `delete ... where id in
  (...) or slug in (...)` antes de inserir.
- **`120 * 86400000` estoura `int4`.** Datas em epoch ms precisam de
  `86400000::bigint`, senão a multiplicação acontece em 32 bits e dá
  `22003: integer out of range`.

---

## Variações de volume

Um perfume em 50 e 100 ml é **um cadastro só**. O tamanho padrão fica em
`price` / `volumeMl`; os extras vão em `variants` (jsonb).

Todo componente usa `src/utils/variants.ts`, que normaliza os dois casos —
`productVariants()` sempre devolve pelo menos uma variação, sintetizada a partir
do tamanho padrão. **Não trate tamanho único e múltiplo separadamente nos
componentes.**

- Listagens ancoram no mais barato (`startingPrice`) e escrevem "A partir de"
- A página do produto tem o seletor com o preço de cada tamanho visível
- A mensagem do WhatsApp leva o tamanho escolhido

---

## Identidade visual

Veio do logo: um **Θ branco sobre azul-marinho**, desenhado numa didone. Mykonos
é ilha grega — theta, azul egeu, cal branca das Cíclades. **Não há dourado.**

Tokens em `src/styles/index.css` (`@theme`). Superfície clara por padrão, blocos
marinhos como pontuação, rodapé branco sobre marinho.

O usuário já rejeitou uma versão anterior por parecer gerada por IA. O que foi
removido de propósito, e **não deve voltar sem ele pedir**: partículas, cursor
luminoso, tela de carregamento, barra de progresso de scroll, glassmorphism
espalhado e texto com gradiente.

Títulos de seção em **minúsculas**; nomes de produto mantêm a maiúscula, porque
são nomes próprios.

---

## Imagens

Originais em `src/assets/` (fora de `public/`, senão o build copia tudo).
`npm run images` gera os WebP em `public/img/` em várias larguras.

As capas de categoria e ambientação foram geradas por IA na direção da marca —
superfície marinho, parede de cal, luz dura, **terço inferior calmo** porque o
cartão sobrepõe texto branco ali.

**Fotos de produto não podem ser geradas por IA.** O catálogo tem marcas reais
(Dior, Chanel, YSL, Lattafa, O Boticário, Natura). Um frasco sintético com
rótulo dessas marcas engana o cliente, cria risco de marca e contradiz a
promessa de originalidade do próprio site. As atuais são placeholders de
ambientação, para trocar por fotos do estoque.

---

## Performance

Duas decisões que sustentam o número e são fáceis de desfazer sem querer:

- **Supabase e GSAP ficam fora do pacote inicial.** `loadSupabase()` e
  `loadGsap()` usam import dinâmico memoizado. Nunca importe o SDK no topo de um
  módulo carregado pela vitrine — `isSupabaseEnabled` é só a checagem do `.env` e
  pode ser lida na renderização.
- **A foto do hero é o LCP.** Fica em `public/img/`, com `srcset` e `preload` no
  `index.html`.

---

## Convenções

- Comentários explicam **porquê**, não o quê — e em português, como o resto do código
- Textos de interface em português do Brasil, com acentuação correta
- `cn()` de `src/utils/cn.ts` para classes condicionais
- Movimento respeita `prefers-reduced-motion`
- SEO sem dependência: o React 19 iça as tags do `<Seo>` para o `head` sozinho

## Ambiente

Windows + PowerShell. O glob `src\**\*.tsx` do `Select-String` **não recursa
fundo** — arquivos em `src/components/home/` ficam de fora e a busca mente. Use a
ferramenta Grep (ripgrep) para procurar no código.
