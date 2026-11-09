# SS22.WWW · Ajustes de catálogo y carrito

## Cambios
- En `/tienda` está disponible el filtro **Solo disponibles**.
- El selector de orden permite ordenar por **Precio: de mayor a menor**, **Precio: de menor a mayor** y más recientes. El catálogo abre por defecto con precio de mayor a menor.
- Se corrigió un error en el carrito: se utilizaba `pricing` sin declararlo, lo que provocaba que React fallara al abrir `/carrito`.
- El carrito calcula y muestra el descuento automático del 10% cuando hay dos o más prendas.
- El botón de cantidad en la ficha ahora agrega al carrito la cantidad seleccionada (antes siempre agregaba una unidad).
- Se endureció la lectura del carrito guardado para descartar datos locales dañados o antiguos y evitar que un dato inválido deje la pantalla en blanco.

## Antes de publicar
La compilación no pudo completarse en este entorno porque la instalación de dependencias quedó incompleta y `vite` no llegó a estar disponible. Ejecutar en la carpeta del proyecto:

```bash
npm install
npm run build
```

Luego probar en el sitio desplegado:
1. Abrir `/tienda`, activar **Solo disponibles** y elegir **Precio: de mayor a menor**.
2. Abrir una prenda disponible, elegir cantidad 2 y agregarla.
3. Confirmar que `/carrito` abre, muestra las dos unidades y descuenta el 10%.
4. Quitar una unidad y confirmar que el descuento se retira al quedar una sola.
5. Probar una prenda agotada y confirmar que no permite agregarla.
6. Completar una compra de prueba y verificar que el total coincida con el pedido registrado.

No se incluyó `.env.local` ni ninguna clave privada en el ZIP.
