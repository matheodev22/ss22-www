# SS22.WWW — tienda de ropa por encargo

Tienda online desarrollada con React + Vite, Supabase y funciones serverless de Vercel. Los clientes pueden crear una cuenta, elegir productos, pagar la seña mediante Mercado Pago Checkout Pro y seguir el estado de sus pedidos.

## Qué incluye

- Inicio, catálogo, detalle de producto, carrito, registro e inicio de sesión.
- Cuenta de cliente y seguimiento de pedidos.
- Panel administrativo para cargar productos y actualizar estados.
- Supabase Auth, base de datos y políticas RLS.
- Mercado Pago Checkout Pro (flujo de Preferencias API): creación de preferencia desde el backend y redirección segura al checkout.
- Webhook con validación de firma oficial de Mercado Pago y consulta del pago a la API antes de actualizar el pedido.
- Diseño responsive negro, blanco y gris.

## Requisitos

- Node.js 20 o superior.
- Cuenta de Supabase.
- Cuenta de vendedor de Mercado Pago y una aplicación creada en Mercado Pago Developers.
- Cuenta de GitHub y Vercel.

## Ejecutar localmente

1. Descomprimí el proyecto y abrí una terminal dentro de `ss22-www`.
2. Ejecutá `npm install`.
3. Copiá `.env.example` como `.env.local`.
4. Completá `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` para el frontend.
5. Ejecutá `npm run dev`.

Sin credenciales de Supabase se muestra un catálogo de demostración. Los pagos reales requieren productos cargados en Supabase, una URL HTTPS publicada y credenciales válidas de Mercado Pago.

## Configurar Supabase

1. Creá un proyecto en Supabase.
2. Entrá en SQL Editor y ejecutá todo `supabase/schema.sql`.
3. En Authentication > URL Configuration, agregá la URL local y la URL de Vercel como Redirect URL.
4. Copiá Project URL y anon/public key a `.env.local`.
5. Registrá tu usuario en la tienda y asignale el rol administrador desde SQL Editor:

```sql
update public.profiles
set role = 'admin'
where email = 'TU_EMAIL';
```

La clave `SUPABASE_SERVICE_ROLE_KEY` es privada: solo se configura en Vercel para las funciones del servidor. Nunca debe tener prefijo `VITE_`, publicarse en GitHub ni colocarse en código del navegador.

## Configurar Mercado Pago para recibir el dinero

### 1. Preparar tu cuenta y aplicación

1. Usá tu propia cuenta de Mercado Pago con perfil de vendedor. Es la cuenta asociada a las credenciales con las que se crean los cobros y donde se acreditarán las operaciones, según las condiciones y plazos de Mercado Pago.
2. Entrá a [Mercado Pago Developers](https://www.mercadopago.com.ar/developers/es) y abrí **Tus integraciones**.
3. Creá una aplicación para tu tienda SS22.WWW.
4. Primero obtené las credenciales de prueba para hacer las pruebas. Más adelante, cuando todo esté verificado, usá las credenciales de producción.

### 2. Cargar variables privadas en Vercel

En Vercel abrí el proyecto > **Settings > Environment Variables** y agregá:

| Variable | Valor |
|---|---|
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave `service_role` de Supabase |
| `MERCADOPAGO_ACCESS_TOKEN` | Access Token de la aplicación de Mercado Pago |
| `MERCADOPAGO_WEBHOOK_SECRET` | Firma secreta que genera la configuración de Webhooks |
| `PUBLIC_SITE_URL` | URL pública HTTPS de tu tienda, por ejemplo `https://ss22-www.vercel.app` |

En Vercel, las variables deben estar disponibles en los entornos que vayas a probar (Preview y/o Production). Después de guardarlas, hacé un nuevo deploy para que las funciones las reciban.

**No compartas tu Access Token, la firma secreta ni la clave `service_role` por chat, capturas o repositorios.** No hace falta darle a nadie tu contraseña de Mercado Pago.

### 3. Configurar el webhook

1. En Mercado Pago Developers, abrí tu aplicación > **Webhooks / Configuración de Webhooks**.
2. En modo prueba, cargá la URL `https://TU-DOMINIO.vercel.app/api/mercadopago-webhook`.
3. Activá el evento **Pagos (Payments)** para esta integración de Checkout Pro por Preferencias.
4. Guardá la configuración y copiá la **Firma secreta** generada.
5. Pegá esa firma en Vercel como `MERCADOPAGO_WEBHOOK_SECRET`.
6. Repetí la configuración en Producción cuando pases a cobrar realmente y usá la firma secreta de ese entorno.

El servidor valida `x-signature` y `x-request-id` con el validador oficial del SDK. Después consulta el pago directamente a Mercado Pago y comprueba que esté aprobado, que corresponda al pedido y que el importe y la moneda sean los esperados. Solo entonces registra la seña como pagada. Las notificaciones repetidas no deberían duplicar el registro.

### 4. Cómo funciona el cobro

1. El cliente inicia sesión, agrega productos y completa sus datos de entrega.
2. Al tocar **Pagar seña**, el navegador envía los IDs y cantidades al backend junto con su sesión autenticada.
3. El backend vuelve a consultar los productos, precios y porcentajes de seña en Supabase. No acepta como válidos los importes calculados por el navegador.
4. Se crea el pedido y una preferencia de Mercado Pago por el importe de la seña.
5. El cliente es redirigido a Mercado Pago y paga allí con los medios disponibles para su cuenta.
6. Mercado Pago envía una notificación al webhook. El backend valida la firma y consulta el pago a Mercado Pago.
7. Si el pago está aprobado y coincide con el pedido, el pedido pasa a **Seña pagada**. El cliente puede ver el estado y el saldo pendiente en **Mis pedidos**.

La página de retorno solo informa que estamos verificando el pago: no confirma una operación por sí misma.

### 5. Probar antes de vender

- Probá primero con credenciales y usuarios de prueba de Mercado Pago.
- Verificá un pago aprobado y comprobá que el pedido cambie a **Seña pagada** en Supabase y en la tienda.
- Probá también un pago pendiente o rechazado: no debe marcarse como pagado.
- En el panel de Webhooks, usá la opción de simulación y revisá la respuesta del servidor.
- Recién después de completar las pruebas, cambiá a credenciales y webhook de producción.

## Seña y saldo restante

El porcentaje de seña inicial es 30% por producto y se puede ajustar en `products.deposit_percent` desde Supabase. El sistema registra el total, la seña y el saldo restante. Esta versión cobra la seña online; el saldo se refleja en el seguimiento del pedido y su cobro posterior deberá coordinarse/activarse según la política comercial que definas.

## Publicar en Vercel

1. Subí el proyecto a GitHub.
2. En Vercel, importá el repositorio.
3. Framework preset: Vite.
4. Build command: `npm run build`; output: `dist`.
5. Configurá las variables de entorno indicadas arriba.
6. Deploy y comprobá que la tienda cargue con HTTPS.
7. Configurá la URL del webhook usando el dominio real asignado por Vercel.

## Estructura

```text
api/                    funciones serverless de Vercel
src/
  components/            componentes reutilizables
  context/               carrito y autenticación
  data/                  catálogo de demostración
  lib/                   Supabase y utilidades
  pages/                 páginas
  styles/                CSS global
supabase/schema.sql      tablas, índices y políticas RLS
```

## Estado y advertencias

La integración de código queda preparada, pero no se puede activar el cobro real hasta que el dueño de la tienda configure sus credenciales, cuenta de vendedor, proyecto Supabase, dominio HTTPS y webhook. Antes de publicar, ejecutá `npm install`, `npm run build` y las pruebas de pago de punta a punta con las credenciales de prueba.

La tienda debe publicar claramente plazos estimados, condiciones de seña y saldo, costos de envío, demoras, cancelaciones, cambios y devoluciones, y cumplir la normativa argentina de defensa del consumidor.
