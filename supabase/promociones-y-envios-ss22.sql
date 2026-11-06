-- SS22.WWW · promociones y zonas de envío
-- Ejecutar una sola vez en Supabase > SQL Editor.

alter table public.orders
  add column if not exists shipping_zone text not null default 'amba';

create table if not exists public.store_promotions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  target_type text not null default 'all' check (target_type in ('all','category','product')),
  target_value text not null default '',
  discount_percent integer not null default 0 check (discount_percent between 0 and 90),
  free_shipping boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.store_promotions enable row level security;

drop policy if exists "public reads active SS22 promotions" on public.store_promotions;
create policy "public reads active SS22 promotions"
  on public.store_promotions for select
  using (active = true or public.is_admin());

drop policy if exists "admins manage SS22 promotions" on public.store_promotions;
create policy "admins manage SS22 promotions"
  on public.store_promotions for all
  using (public.is_admin())
  with check (public.is_admin());

create index if not exists store_promotions_active_idx
  on public.store_promotions(active);
