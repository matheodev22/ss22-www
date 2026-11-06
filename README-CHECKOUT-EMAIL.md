# SS22 · Checkout, transferencia y correos

## Flujo de compra
1. El comprador completa nombre, email, teléfono y dirección.
2. Ingresa su CPA argentino completo (formato `B1704ABC`). La zona se determina en el navegador y se vuelve a validar en el servidor; no hay selector manual de localidad o zona.
3. Se crea el pedido como `shipping_quoted`, pendiente de comprobante/verificación.
4. El comprador recibe el alias `ss22.www`, titular Matheo Martinez y vías de contacto.
5. Administración recibe el aviso de nuevo pedido y puede cambiar su estado. Al aprobar el pago, despachar o cargar seguimiento, se envía una actualización al comprador.

## Requisitos de base de datos
Ejecutar `supabase/ss22-checkout-email-y-promociones.sql` en Supabase → SQL Editor. Esto crea `store_promotions`, corrige el constraint de estados y agrega el email del comprador. No elimina productos ni pedidos.

## Correos automáticos (Resend)
Crear una cuenta en Resend, verificar el dominio remitente y agregar estas variables en Vercel → Settings → Environment Variables:
- `RESEND_API_KEY`: clave privada de Resend.
- `EMAIL_FROM`: remitente verificado, por ejemplo `SS22.WWW <pedidos@tudominio.com>`.
- `ADMIN_NOTIFICATION_EMAIL`: correo donde querés recibir avisos de pedidos.

Las variables de Supabase privadas ya requeridas por el backend deben seguir configuradas. Después de agregarlas, redeploy en Vercel. Si no se configuran, los pedidos igualmente se registran, pero los emails no se envían.

## Validación de CPA
Se exige el formato CPA de 8 caracteres (letra provincial + cuatro dígitos + tres letras) y se rechazan provincias/rangos numéricos manifiestamente incompatibles. Sin una base postal oficial completa o consulta de Correo Argentino no es técnicamente posible garantizar que las tres letras finales existan y correspondan a la dirección exacta. Por eso el administrador debe verificar dirección/CPA antes de despachar. No presentar esta validación como verificación oficial de domicilio. Correo Argentino confirma que no publica una base masiva de CPA y que la consulta oficial se realiza por dirección; ver https://www.correoargentino.com.ar/formularios/cpa.

## Prueba antes de publicar
Hacer una compra de prueba con una cuenta cliente, comprobar que se guarde `customer_email`, que el pedido aparezca en administración y que lleguen ambos correos. Cambiar estado a `paid`, luego a `in_transit` y guardar seguimiento para verificar las notificaciones al cliente.
