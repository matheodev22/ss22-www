# SS22.WWW — corrección de configuración y catálogo de prueba

## 1. Corregir el error "Invalid path specified in request URL"

En la raíz del proyecto (donde está `package.json`) creá o editá `.env.local`:

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_CLAVE_PUBLICA
VITE_TRANSFER_ALIAS=TU_ALIAS
VITE_TRANSFER_HOLDER=TU_TITULAR
```

Copiá la URL desde Supabase > Project Settings > API > Project URL. Tiene que ser solamente la URL base `https://....supabase.co`. No pegues la URL del dashboard, ni agregues `/rest/v1`, `/auth/v1`, `/project/...`, ni comillas.

La clave debe ser la Publishable key (o anon key legacy), nunca `service_role` en el frontend.

Después de guardar `.env.local`, detené Vite con Ctrl+C y volvé a ejecutar `npm run dev`. Vite no relee variables de entorno hasta reiniciar.

## 2. Cargar los 3 productos ficticios

En Supabase > SQL Editor, abrí y ejecutá `supabase/demo-products.sql`. Esto inserta 3 productos reales en la tabla `products`, con UUID de Supabase, para que puedas probar ficha, carrito y creación de pedidos. Ejecutalo una sola vez.

Productos incluidos:
- Essential Boxy Tee — $32.000
- Studio Zip Hoodie — $78.000
- Daily Cargo Pant — $69.000

Son datos de prueba. Desactivalos o reemplazalos antes de vender.

## 3. Probar

1. Reiniciá el servidor local.
2. Probá crear una cuenta con un email tuyo válido.
3. Si Supabase exige confirmación de email, revisá tu bandeja y confirmá la cuenta.
4. Entrá a La tienda: deberían aparecer los 3 productos.
5. Agregá uno al carrito.

Nota: las rutas `/api/*` son funciones serverless de Vercel y no las ejecuta el servidor simple de Vite. Para probar el alta de pedidos localmente hay que usar `vercel dev` con las variables de servidor configuradas, o desplegar en Vercel.
