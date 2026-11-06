-- SS22.WWW: insertar 3 productos de prueba.
-- Ejecutar UNA SOLA VEZ en Supabase > SQL Editor.
-- Son productos ficticios para probar catálogo, carrito y pedidos. Editalos o desactivalos luego.

insert into public.products
  (name, category, description, price, deposit_percent, image_url, sizes, colors, featured, active)
values
  (
    'Essential Boxy Tee', 'Remeras',
    'Remera de corte boxy, silueta relajada y estética minimalista.',
    32000, 100,
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=85',
    array['S','M','L','XL'], array['Negro','Blanco'], true, true
  ),
  (
    'Studio Zip Hoodie', 'Buzos',
    'Hoodie con cierre y calce amplio para todos los días.',
    78000, 100,
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1000&q=85',
    array['S','M','L','XL'], array['Negro','Gris'], true, true
  ),
  (
    'Daily Cargo Pant', 'Pantalones',
    'Pantalón cargo de inspiración utilitaria y calce relajado.',
    69000, 100,
    'https://images.unsplash.com/photo-1511196044526-5cb3bcb7071b?auto=format&fit=crop&w=1000&q=85',
    array['38','40','42','44'], array['Negro','Gris'], true, true
  );
