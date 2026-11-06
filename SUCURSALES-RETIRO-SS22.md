# Sucursales de retiro de SS22

Las ubicaciones se configuran en `src/lib/shipping.js`, dentro de `BRANCH_PICKUP_POINTS`.

Por ahora las listas están vacías intencionalmente: no se inventaron sucursales ni se muestran puntos de retiro que SS22 no haya confirmado. Si un cliente elige retiro en sucursal, la tienda informa que SS22 confirmará por WhatsApp la sucursal habilitada para su zona.

Cuando tengas las sucursales confirmadas, completá cada lista con la dirección exacta, por ejemplo:

```js
export const BRANCH_PICKUP_POINTS = {
  amba: ["Correo Argentino · Av. Ejemplo 123 · Ramos Mejía"],
  buenos_aires_interior: ["Correo Argentino · Dirección confirmada · Localidad"],
  centro: [],
  norte: [],
  patagonia: [],
};
```

No publiques una sucursal hasta confirmar que recibe este tipo de envíos y que está habilitada para retiro. Las listas se muestran según la zona detectada automáticamente por el código postal.

## Importante sobre el código postal

El cotizador solicita los cuatro dígitos del CP argentino y asigna una zona comercial por rangos numéricos. Esto rechaza formatos incorrectos y números fuera de los rangos configurados, pero no comprueba la existencia exacta de cada CP ni la disponibilidad real de una sucursal. Para eso se necesita consultar el directorio actualizado de Correo Argentino o verificar el destino antes de despachar.
