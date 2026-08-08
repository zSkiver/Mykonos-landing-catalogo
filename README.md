# Mykonos Parfum

Landing page e painel da Mykonos Parfum, em Rio Verde, GO. O painel cadastra produtos,
envia imagens ao Supabase Storage e publica o catálogo na landing page.

## Desenvolvimento

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Sem as variáveis do Supabase, a vitrine permanece funcional em modo local: os dados de
demonstração ficam somente no navegador. O painel administrativo exige Supabase
configurado.

## Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com/).
2. No **SQL Editor**, execute [`supabase/schema.sql`](supabase/schema.sql). Ele cria as
   tabelas, as regras de segurança, o bucket público `product-images` e os perfis de acesso.
3. Em **Project Settings > API**, copie a URL do projeto e a **Publishable key** para `.env`:

```env
VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sua-chave-publica"
```

Nunca use a chave `service_role` no frontend.

4. Em **Authentication > Providers**, deixe o provedor **Email** ativado e crie o primeiro
   acesso em **Authentication > Users**. A primeira conta recebe o papel de administrador;
   as próximas entram como funcionários e podem ser promovidas no painel.
5. Faça login em `/admin`. Em um banco vazio, o botão **Importar catálogo** copia os dados
   iniciais. A partir daí, cada produto novo e sua imagem ficam no Supabase.

## Publicar com segurança

Antes de subir ao GitHub:

```powershell
git status --short
git check-ignore -v .env .env.example .dev.vars .wrangler .vite-server.out.log
```

Confirme que `.env` está ignorado e que somente `.env.example` entra no repositório.
Não commite chaves reais, dumps do banco, arquivos `.dev.vars`, logs, `.wrangler/` ou
qualquer chave `service_role`.

No Cloudflare Pages, configure:

- Build command: `npm run build`
- Build output directory: `dist`
- Node.js version: `22` ou superior
- Variáveis de ambiente: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`,
  `VITE_SITE_URL`, `VITE_WHATSAPP_NUMBER` e demais dados públicos da loja

As variáveis `VITE_*` são embutidas no JavaScript do navegador. Use nelas apenas dados
publicáveis, como a URL do Supabase e a publishable/anon key protegida por RLS.

## Dados no Supabase

- `products`: catálogo publicado na landing page.
- `product-images`: arquivos das imagens dos produtos. A URL pública é salva em `products.images`.
- `categories`, `brands` e `settings`: informações usadas pelo catálogo e pela loja.
- `profiles`: papéis e status de quem acessa o painel.

As regras permitem leitura pública somente do que a landing page precisa. Escritas no catálogo
e upload de imagens exigem uma conta autorizada.

## Comandos

| Comando | Função |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Checagem de tipos e build de produção |
| `npm run preview` | Servir o build gerado |
| `npm run typecheck` | Checagem de tipos |
| `npm run lint` | Lint do código |
