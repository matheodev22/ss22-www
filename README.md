# SS22.WWW

Tienda online de indumentaria desarrollada con React, Vite, Supabase y funciones serverless de Vercel.

## Estado actual

- Catálogo, búsqueda, filtros y detalle de productos.
- Carrito con selección de talle, color y cantidad.
- Registro e inicio de sesión con Supabase Auth.
- Checkout con datos del comprador.
- Pago por transferencia bancaria del 100% del importe de los productos.
- Pedidos creados como pendientes de pago; el vendedor verifica manualmente la transferencia y actualiza el estado desde Administración.
- Envíos coordinados manualmente. La integración con Correo Argentino todavía no está conectada.
- Panel de administración para productos y estados de pedidos.
- Seguimiento de estado de pedidos desde la cuenta del comprador.

## Requisitos

- Node.js 20 o superior.
- Proyecto de Supabase.
- Proyecto de Vercel para publicar las funciones de backend.

## Instalación local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Completá `.env.local` con las variables de entorno indicadas abajo. Nunca subas `.env.local` al repositorio.

## Variables de entorno

### Frontend

- `VITE_SUPABASE_URL`: URL del proyecto Supabase.
- `VITE_SUPABASE_ANON_KEY`: clave pública Publishable/anon de Supabase.
- `VITE_TRANSFER_ALIAS`: alias bancario donde se reciben las transferencias.
- `VITE_TRANSFER_HOLDER`: nombre del titular de la cuenta.

### Backend (Vercel)

- `SUPABASE_URL`: URL del proyecto Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: clave secreta de servidor de Supabase. No debe tener prefijo `VITE_` ni exponerse al navegador.
- `PUBLIC_SITE_URL`: URL pública de la tienda.

## Base de datos

Ejecutá `supabase/schema.sql` en el SQL Editor de Supabase. Si ya ejecutaste una versión anterior del esquema, aplicá los cambios necesarios antes de vender; no ejecutes cambios destructivos sobre datos existentes sin respaldo.

Para habilitar la administración, registrá primero tu usuario y luego asignale el rol desde SQL Editor:

```sql
update public.profiles
set role = 'admin'
where email = 'TU_EMAIL';
```

## Flujo de compra actual

1. El cliente inicia sesión y agrega productos reales publicados en Supabase al carrito.
2. Completa sus datos de entrega y confirma el pedido.
3. El backend valida la sesión, vuelve a consultar los productos y precios en Supabase y crea el pedido por el total completo de los productos.
4. El cliente recibe el número de pedido. No debe transferir todavía: primero se confirma manualmente el costo de envío y se comunica el total final (productos + envío).
5. El vendedor verifica el ingreso real del dinero en su cuenta bancaria y cambia el estado a `paid` desde Administración.
6. El costo y la modalidad del envío se coordinan manualmente por ahora.

**Importante:** el costo del envío no está incluido en el importe mostrado por el checkout hasta que se confirme manualmente. Antes de pedir una transferencia, comunicá al comprador el total final incluyendo el envío. No marques un pedido como pagado solamente por recibir una captura del comprobante.

## Publicación en Vercel

- Framework: Vite.
- Root Directory: `./`.
- Build Command: `npm run build`.
- Output Directory: `dist`.
- Install Command: `npm install`.

Configurá en Vercel las variables frontend y backend indicadas arriba y volvé a desplegar después de modificarlas.

## Verificación

```bash
npm install
npm run build
npm run preview
```

Antes de vender, probá registro, inicio de sesión, catálogo con productos reales, creación de pedido, visualización en Mis pedidos y actualización manual de estado en Administración.
