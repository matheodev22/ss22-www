# Arreglo de acceso al panel /admin

Se corrigió la carga del perfil de usuario para que la ruta protegida espere a que termine la consulta a `public.profiles`. Antes, el evento de autenticación podía marcar `loading` como falso antes de recibir el perfil y la web redirigía al inicio.

También se agregó un mensaje de diagnóstico en `/admin` si la consulta falla, si no existe el perfil o si la web recibe un rol distinto de `admin`. El panel de administración sigue bloqueado para cuentas que no tienen rol `admin`.

## Pasos manuales

1. Descargá y descomprimí este ZIP.
2. Abrí la carpeta `ss22-www-main` en Visual Studio Code.
3. En una terminal ubicada en esa carpeta, ejecutá `npm ci` y después `npm run dev`.
4. Probá iniciar sesión con tu cuenta existente y entrá a `/admin`. El registro y el inicio de sesión se mantienen usando Supabase.
5. Si usás Vercel, abrí **Settings → Environment Variables** y verificá que `VITE_SUPABASE_URL` sea exactamente la URL del mismo proyecto Supabase donde comprobaste `role = admin`. Verificá también que `VITE_SUPABASE_ANON_KEY` sea la clave pública/anon de ese mismo proyecto. No pegues claves secretas en el chat ni uses una `service_role` en el frontend.
6. Si cambiaste variables en Vercel, hacé un nuevo deploy (Redeploy) para que Vite las incorpore.
7. En la web publicada, cerrá sesión, volvé a iniciar sesión y probá `/admin`.

## Cómo interpretar el resultado

- Si `/admin` muestra un rol distinto de `admin`, lo más probable es que Vercel esté apuntando a otro proyecto o que la sesión sea de otra cuenta.
- Si muestra un error de permisos/RLS, revisá las políticas de lectura de `public.profiles` para que cada usuario autenticado pueda leer su propio perfil.
- Si carga el panel, probá agregar un producto de prueba y luego desactivarlo para confirmar que las políticas de `products` permiten las acciones administrativas.

No se modificó el esquema SQL ni se cambiaron los permisos de Supabase.
