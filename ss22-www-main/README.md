# SS22.WWW

Tienda online de indumentaria con React, Vite, Supabase y Vercel.

## Qué incluye

- Catálogo de prendas, filtros y detalle.
- Carrito con talle, color y cantidad.
- Cuenta de cliente y seguimiento de pedidos.
- Panel privado para publicar, editar, ocultar y destacar prendas.
- Carga múltiple de fotos y videos desde el panel.
- Compra por transferencia del 100%.
- Cotizador propio de tarifas estimadas por zona, sin API externa.
- Gestión del costo del envío y estado de cada pedido.

## Antes de publicar

1. Instalá dependencias con `npm install`.
2. Copiá `.env.example` a `.env.local` y completá las variables.
3. Ejecutá `supabase/actualizacion-tienda-ropa.sql` y después `supabase/promociones-y-envios-ss22.sql` en el SQL Editor de Supabase.
4. En Vercel cargá las mismas variables de entorno. `VITE_*` son públicas; `SUPABASE_SERVICE_ROLE_KEY` debe quedar privada.
5. Volvé a desplegar la tienda.

## Configurar el alias

Completá:
- `VITE_TRANSFER_ALIAS`: alias que recibe las transferencias.
- `VITE_TRANSFER_HOLDER`: nombre del titular de la cuenta.

Estos datos se muestran al cliente cuando el pedido ya tiene el costo de envío confirmado. No publiques claves bancarias ni datos privados.

## Publicar fotos y videos

El administrador permite elegir varios archivos desde la computadora. Los archivos se guardan en el bucket público `product-media`, que crea el SQL de actualización. Se admiten imágenes y videos de hasta 80 MB por archivo.

Para mostrar un video en la portada, subilo al bucket `product-media`, copiá su URL pública y pegala en `VITE_HOME_VIDEO_URL` en Vercel. Después hacé un nuevo despliegue.

## Cómo funciona el cotizador sin API externa

1. El comprador ingresa su código postal en la página del producto y elige una zona de destino para ver las tarifas estimadas a sucursal y domicilio.
2. En el checkout elige la zona y modalidad; el precio de envío se suma al subtotal con descuentos.
3. Si una promoción aplicable incluye envío gratis, el envío se bonifica automáticamente.
4. El backend vuelve a consultar stock y promociones y calcula los importes antes de crear el pedido.
5. El pedido queda con el total calculado. Desde administración podés ajustar manualmente el envío si necesitás corregirlo y guardar el seguimiento al despachar.

## Administrador

Registrá tu cuenta en la tienda. Después asignale el rol de administrador desde Supabase SQL Editor:

```sql
update public.profiles
set role = 'admin'
where email = 'TU_EMAIL';
```

## Comprobación

```bash
npm install
npm run build
npm run preview
```

Antes de vender, probá el alta de una prenda, la carga de medios, una compra de prueba, los descuentos, el envío gratis, las tarifas por zona y el cambio de estado.

## Actualización de SS22.WWW (tienda de ropa)

1. En Supabase abrí **SQL Editor** y ejecutá `supabase/actualizacion-tienda-ropa.sql` una sola vez. Esto agrega fotos/videos, disponibilidad, datos de envío y seguimiento sin borrar productos ni pedidos existentes.
2. En Vercel configurá las variables públicas `VITE_TRANSFER_ALIAS=ss22.www` y `VITE_TRANSFER_HOLDER=Matheo Martinez`. También conservá las variables de Supabase que ya usa el proyecto.
3. Para el video principal, subí un MP4 liviano al almacenamiento público de Supabase (bucket `product-media`) y configurá `VITE_HOME_VIDEO_URL` con su URL pública. Si queda vacío, se muestra la portada estática.
4. En el panel de administración publicá prendas, elegí varias fotos/videos, editá productos y usá los controles de disponibilidad.
5. Para los envíos, revisá la tarifa estimada que se calculó automáticamente. Si necesitás corregirla, podés ajustar el importe desde el panel y guardar el seguimiento cuando tengas la etiqueta.

### Envíos sin API externa

El sitio utiliza las tarifas estimadas de SS22 que se detallan más abajo. El cliente puede verlas desde el producto y el checkout calcula el total final con la modalidad y zona elegidas. El administrador puede ajustar el importe si una operación puntual requiere una corrección y cargar el seguimiento cuando se despacha.

**Importante:** estas tarifas son estimaciones comerciales definidas por SS22, no cotizaciones oficiales de Correo Argentino. El plazo de 2 a 5 días hábiles se cuenta desde el despacho.


## Promociones y cotizador de envío SS22

Ejecutá también `supabase/promociones-y-envios-ss22.sql` en Supabase SQL Editor. Crea la tabla de promociones con lectura pública solo de promociones activas y escritura exclusiva de administradores, además de guardar la zona de envío en los pedidos.

Desde `/admin` podés crear promociones para toda la tienda, una categoría o un producto. Cada promoción admite porcentaje de descuento, envío gratis o ambos. El backend vuelve a validar el stock y las promociones antes de registrar la compra.

### Tarifas estimadas de SS22

| Zona | Sucursal | Domicilio |
|---|---:|---:|
| AMBA | $9.300 | $14.800 |
| Buenos Aires interior | $9.550 | $15.100 |
| Centro | $9.850 | $15.450 |
| Norte | $9.950 | $15.600 |
| Patagonia | $10.100 | $15.800 |

Plazo estimado: 2 a 5 días hábiles desde el despacho. Son valores comerciales estimados de SS22, no una cotización oficial de Correo Argentino. Se muestran en el detalle del producto y se calculan nuevamente en checkout.
