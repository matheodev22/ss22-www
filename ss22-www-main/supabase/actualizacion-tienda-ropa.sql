-- SS22.WWW: ejecutar una sola vez en Supabase > SQL Editor.
-- Cambios aditivos para prendas con fotos/videos y cotización manual de envíos.
alter table public.products
  add column if not exists media_urls text[] not null default '{}',
  add column if not exists video_url text;

alter table public.orders
  add column if not exists shipping_postal_code text,
  add column if not exists shipping_method text not null default 'home',
  add column if not exists shipping_amount numeric(12,2);

alter table public.orders
  drop constraint if exists orders_status_check;

alter table public.orders
  add constraint orders_status_check
  check (status in ('pending_payment','shipping_quoted','paid','ordered','in_transit','arrived','ready','completed','cancelled'));

-- Crear el bucket público para fotos y videos de productos.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-media', 'product-media', true, 83886080, array['image/jpeg','image/png','image/webp','image/avif','video/mp4','video/webm','video/quicktime'])
on conflict (id) do update set public = true, file_size_limit = 83886080;

drop policy if exists "Public can view SS22 product media" on storage.objects;
create policy "Public can view SS22 product media" on storage.objects
for select using (bucket_id = 'product-media');

drop policy if exists "Admins can upload SS22 product media" on storage.objects;
create policy "Admins can upload SS22 product media" on storage.objects
for insert to authenticated with check (bucket_id = 'product-media' and public.is_admin());

drop policy if exists "Admins can update SS22 product media" on storage.objects;
create policy "Admins can update SS22 product media" on storage.objects
for update to authenticated using (bucket_id = 'product-media' and public.is_admin())
with check (bucket_id = 'product-media' and public.is_admin());

drop policy if exists "Admins can delete SS22 product media" on storage.objects;
create policy "Admins can delete SS22 product media" on storage.objects
for delete to authenticated using (bucket_id = 'product-media' and public.is_admin());


-- Disponibilidad comercial: permite marcar una prenda como agotada sin borrarla.
alter table public.products
  add column if not exists stock_status text not null default 'available';
alter table public.products drop constraint if exists products_stock_status_check;
alter table public.products add constraint products_stock_status_check
  check (stock_status in ('available','sold_out'));

alter table public.orders add column if not exists tracking_number text;
