-- SS22.WWW — ejecutar en Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Otros',
  description text not null default '',
  price numeric(12,2) not null check (price >= 0),
  deposit_percent integer not null default 100 check (deposit_percent between 1 and 100),
  image_url text,
  media_urls text[] not null default '{}',
  video_url text,
  stock_status text not null default 'available' check (stock_status in ('available','sold_out')),
  sizes text[] not null default '{}',
  colors text[] not null default '{}',
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  status text not null default 'pending_payment' check (status in ('pending_payment','paid','ordered','in_transit','arrived','ready','completed','cancelled')),
  total_amount numeric(12,2) not null,
  deposit_amount numeric(12,2) not null,
  deposit_paid numeric(12,2) not null default 0,
  balance_due numeric(12,2) not null,
  customer_name text not null,
  customer_phone text not null,
  shipping_address text not null,
  shipping_city text not null,
  shipping_postal_code text,
  shipping_method text not null default 'home',
  shipping_amount numeric(12,2),
  tracking_number text,
  customer_notes text default '',
  mp_preference_id text,
  payment_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null,
  deposit_amount numeric(12,2) not null,
  size text default '',
  color text default ''
);

create index if not exists products_active_idx on public.products(active);
create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists order_items_order_id_idx on public.order_items(order_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name',''))
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

drop policy if exists "profiles read own or admin" on public.profiles;
create policy "profiles read own or admin" on public.profiles for select using (auth.uid() = id or public.is_admin());
-- Los clientes no pueden actualizar perfiles directamente: así no pueden elevar su rol a admin.
-- Los cambios de perfil/rol se realizan desde funciones administrativas confiables.

drop policy if exists "active products public" on public.products;
create policy "active products public" on public.products for select using (active = true or public.is_admin());
drop policy if exists "admin manage products" on public.products;
create policy "admin manage products" on public.products for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "customer reads own orders" on public.orders;
create policy "customer reads own orders" on public.orders for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "admin updates orders" on public.orders;
create policy "admin updates orders" on public.orders for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "customer reads own order items" on public.order_items;
create policy "customer reads own order items" on public.order_items for select using (
  exists(select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
);
drop policy if exists "admin manages order items" on public.order_items;
create policy "admin manages order items" on public.order_items for all using (public.is_admin()) with check (public.is_admin());

-- IMPORTANTE: los pedidos se crean desde el backend con service_role, no desde el navegador.
-- Asignar administrador manualmente después de registrarse:
-- update public.profiles set role = 'admin' where email = 'tu@email.com';
