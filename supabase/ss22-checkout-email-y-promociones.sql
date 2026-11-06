-- SS22.WWW · Ejecutar en Supabase SQL Editor una sola vez.
-- Corrige el error store_promotions, agrega correo del comprador y estados del flujo de pago/envío.

create extension if not exists pgcrypto;

alter table public.orders add column if not exists customer_email text;
alter table public.orders add column if not exists shipping_zone text not null default 'amba';
alter table public.orders add column if not exists shipping_method text not null default 'home';
alter table public.orders add column if not exists shipping_postal_code text;
alter table public.orders add column if not exists shipping_amount numeric(12,2);
alter table public.orders add column if not exists tracking_number text;

-- El esquema anterior no contemplaba shipping_quoted aunque la tienda lo utilizaba.
do $$ declare c record; begin
  for c in select conname from pg_constraint where conrelid = 'public.orders'::regclass and contype = 'c' and pg_get_constraintdef(oid) ilike '%status%' loop
    execute format('alter table public.orders drop constraint %I', c.conname);
  end loop;
end $$;
alter table public.orders add constraint orders_status_check check (status in ('pending_payment','shipping_quoted','paid','ordered','in_transit','arrived','ready','completed','cancelled'));

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
create policy "public reads active SS22 promotions" on public.store_promotions for select using (active = true or public.is_admin());
drop policy if exists "admins manage SS22 promotions" on public.store_promotions;
create policy "admins manage SS22 promotions" on public.store_promotions for all using (public.is_admin()) with check (public.is_admin());
create index if not exists store_promotions_active_idx on public.store_promotions(active);
create index if not exists orders_customer_email_idx on public.orders(customer_email);

-- Permite que el cliente vea sus pedidos y que el administrador los gestione.
notify pgrst, 'reload schema';
