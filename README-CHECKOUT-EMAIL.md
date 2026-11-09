# SS22 · Checkout, transferencia y correos

## Correos automáticos
El servidor intenta enviar:
1. Al crear el pedido: aviso al administrador y confirmación al cliente con alias, titular y total.
2. Al aprobar el pago (`paid`): confirmación al cliente.
3. Al marcar el pedido en camino (`in_transit`) o guardar el seguimiento: aviso con código y enlace de Correo Argentino.
4. Al marcarlo listo para retirar / llegado a sucursal: actualización al cliente.

Un fallo del proveedor de correo no borra ni invalida el pedido. La respuesta del checkout distingue si se pudo enviar el aviso al administrador y al comprador. En el panel también se muestra si la actualización por email fue rechazada.

## Variables de entorno de Vercel
Configurar en **Vercel → Project → Settings → Environment Variables** (Production y Preview, si se usan):
- `SUPABASE_URL`: URL del proyecto Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: clave secreta service role; solo servidor, nunca `VITE_`.
- `PUBLIC_SITE_URL`: URL de la tienda publicada.
- `RESEND_API_KEY`: clave privada de Resend.
- `EMAIL_FROM`: remitente autorizado en Resend.
- `ADMIN_NOTIFICATION_EMAIL`: email de la cuenta administradora.

Después de cambiar variables, hacer un nuevo deploy. No incluir `.env.local` ni claves en el ZIP o en GitHub.

## Limitación de Resend sin dominio propio verificado
Con `EMAIL_FROM=SS22 <onboarding@resend.dev>`, Resend está en modo de prueba: permite enviar al email dueño de la cuenta de Resend, pero no a los correos de compradores. Por eso, sin verificar un dominio propio, el aviso al administrador puede probarse si `ADMIN_NOTIFICATION_EMAIL` es exactamente el email de la cuenta Resend, pero las confirmaciones reales a clientes serán rechazadas (normalmente HTTP 403). Para enviar a compradores se necesita verificar un dominio que controles y usar un remitente de ese dominio. No sirve usar una dirección Gmail como remitente ni verificar un dominio ajeno.

## Base de datos
Si todavía no se ejecutó, abrir Supabase → SQL Editor y ejecutar `supabase/ss22-checkout-email-y-promociones.sql`. Crea `store_promotions`, agrega `customer_email` y los campos de envío/seguimiento que usa el checkout, y recarga el schema cache. Ejecutar una sola vez es seguro por los `IF NOT EXISTS` incluidos.

## Prueba
1. Hacer un pedido de prueba con una cuenta de cliente y un email válido.
2. Confirmar que el pedido se guarde y aparezca en `/admin`.
3. Confirmar que llegue el aviso al email administrador.
4. Aprobar el pago y luego marcar `in_transit` / cargar seguimiento para comprobar las notificaciones.
5. Revisar los resultados de envío en la pantalla y los logs de Vercel si Resend rechaza el mensaje.

## Promoción automática
Al comprar dos prendas o más se aplica automáticamente un 10% adicional sobre el subtotal de prendas, después de las promociones individuales activas. El servidor vuelve a calcularlo antes de guardar el pedido; no depende del navegador.
