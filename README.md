# SS22.WWW

Tienda online de indumentaria con React, Vite, Supabase y Vercel.

## Qué incluye

- Catálogo de prendas, filtros y detalle.
- Carrito con talle, color y cantidad.
- Cuenta de cliente y seguimiento de pedidos.
- Panel privado para publicar, editar, ocultar y destacar prendas.
- Carga múltiple de fotos y videos desde el panel.
- Compra por transferencia del 100%.
- Cotización manual de Correo Argentino por código postal, sin API.
- Gestión del costo del envío y estado de cada pedido.

## Antes de publicar

1. Instalá dependencias con `npm install`.
2. Copiá `.env.example` a `.env.local` y completá las variables.
3. Ejecutá `supabase/actualizacion-tienda-ropa.sql` en el SQL Editor de Supabase.
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

## Cómo funciona el envío sin API

1. El comprador carga dirección, código postal y elige domicilio o sucursal.
2. El pedido aparece en Administración como pendiente de cotización.
3. La tienda consulta el costo en MiCorreo y carga el importe en el pedido.
4. El estado pasa a “Envío cotizado” y el comprador ve el total más el alias.
5. Una vez verificada la transferencia, se actualiza el estado a “Pago confirmado” y se prepara el despacho.

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

Antes de vender, probá el alta de una prenda, la carga de medios, una compra de prueba, la cotización del envío y el cambio de estado.

## Actualización de SS22.WWW (tienda de ropa)

1. En Supabase abrí **SQL Editor** y ejecutá `supabase/actualizacion-tienda-ropa.sql` una sola vez. Esto agrega fotos/videos, disponibilidad, datos de envío y seguimiento sin borrar productos ni pedidos existentes.
2. En Vercel configurá las variables públicas `VITE_TRANSFER_ALIAS=ss22.www` y `VITE_TRANSFER_HOLDER=Matheo Martinez`. También conservá las variables de Supabase que ya usa el proyecto.
3. Para el video principal, subí un MP4 liviano al almacenamiento público de Supabase (bucket `product-media`) y configurá `VITE_HOME_VIDEO_URL` con su URL pública. Si queda vacío, se muestra la portada estática.
4. En el panel de administración publicá prendas, elegí varias fotos/videos, editá productos y usá los controles de disponibilidad.
5. Para los envíos, abrí MiCorreo desde cada pedido, cotizá el paquete con su peso y medidas reales, cargá el importe en el pedido y guardá el número de seguimiento cuando tengas la etiqueta.

### Envíos sin API

La tienda no calcula ni cobra automáticamente el envío. El cliente indica código postal y modalidad; desde administración se abre MiCorreo para cotizar manualmente. Cuando ingresás el costo, el pedido pasa a **Envío cotizado · pendiente de pago** y el cliente ve el total y el alias `ss22.www` a nombre de Matheo Martinez en **Mis pedidos**. Después de confirmar la transferencia, actualizá el estado y, cuando tengas el código, guardá el seguimiento.

**Importante:** para cotizar en MiCorreo necesitás las medidas y el peso del paquete ya preparado. No se estiman automáticamente porque dependen del embalaje real.
