-- Mykonos Parfum: execute este arquivo no SQL Editor do Supabase.
-- Ele cria o banco, o bucket de imagens e regras de acesso para o painel.

create table if not exists public.profiles (
  uid text primary key,
  email text not null,
  name text not null,
  role text not null default 'staff' check (role in ('admin', 'staff')),
  active boolean not null default true,
  "createdAt" bigint not null,
  "lastLoginAt" bigint
);

create table if not exists public.products (
  id text primary key,
  slug text not null unique,
  name text not null,
  brand text not null,
  "brandSlug" text not null,
  "categorySlug" text not null,
  kind text not null,
  gender text not null,
  description text not null,
  story text,
  price double precision not null,
  "promoPrice" double precision,
  "volumeMl" integer not null,
  "olfactoryFamily" text,
  pyramid jsonb,
  longevity text,
  projection text,
  occasions jsonb,
  images jsonb not null default '[]'::jsonb,
  featured boolean not null default false,
  "dailyOffer" boolean not null default false,
  "bestSeller" boolean not null default false,
  "isNew" boolean not null default false,
  exclusive boolean not null default false,
  active boolean not null default true,
  "createdAt" bigint not null,
  "updatedAt" bigint not null
);

alter table public.products drop column if exists stock;

create table if not exists public.categories (
  id text primary key,
  slug text not null unique,
  name text not null,
  tagline text not null,
  icon text not null,
  image text not null,
  "order" integer not null,
  active boolean not null default true
);

create table if not exists public.brands (
  id text primary key,
  slug text not null unique,
  name text not null,
  origin text,
  logo text,
  featured boolean not null default false
);

create table if not exists public.offers (
  id text primary key,
  "productId" text not null references public.products(id) on delete cascade,
  headline text not null,
  "promoPrice" double precision not null,
  "endsAt" bigint not null,
  active boolean not null default true
);

create table if not exists public.settings (
  id text primary key,
  "storeName" text not null,
  "whatsappNumber" text not null,
  instagram text not null,
  email text not null,
  address text not null,
  "mapsQuery" text not null,
  "openingHours" jsonb not null default '[]'::jsonb,
  "aboutTitle" text not null,
  "aboutText" jsonb not null default '[]'::jsonb,
  announcement text not null,
  testimonials jsonb not null default '[]'::jsonb,
  faq jsonb not null default '[]'::jsonb
);

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.offers enable row level security;
alter table public.settings enable row level security;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where uid = auth.uid()::text and active = true and role in ('admin', 'staff')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where uid = auth.uid()::text and active = true and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (uid, email, name, role, active, "createdAt")
  values (
    new.id::text,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, 'Usuário'), '@', 1)),
    case when not exists (select 1 from public.profiles) then 'admin' else 'staff' end,
    true,
    floor(extract(epoch from now()) * 1000)::bigint
  )
  on conflict (uid) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create policy "Public catalog read" on public.products for select using (true);
create policy "Staff product writes" on public.products for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "Public category read" on public.categories for select using (true);
create policy "Admin category writes" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Public brand read" on public.brands for select using (true);
create policy "Admin brand writes" on public.brands for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Public settings read" on public.settings for select using (true);
create policy "Admin settings writes" on public.settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Public offer read" on public.offers for select using (true);
create policy "Admin offer writes" on public.offers for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Users read own profile" on public.profiles for select to authenticated using (uid = auth.uid()::text or public.is_admin());
create policy "Admins manage profiles" on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

create policy "Public product images" on storage.objects for select using (bucket_id = 'product-images');
create policy "Staff uploads product images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.is_staff());
create policy "Staff updates product images" on storage.objects for update to authenticated using (bucket_id = 'product-images' and public.is_staff()) with check (bucket_id = 'product-images' and public.is_staff());
create policy "Staff deletes product images" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.is_staff());
