# SS22.WWW – Mejora visual adaptable

Se ajustó la portada para que el video conserve su proporción y no se corte.
En pantallas pequeñas, el contenido se apila en una sola columna, con el texto
primero y el video debajo. También se ajustaron navegación, títulos, catálogo,
fichas de producto y espaciados para celulares.

## Video de portada

Colocá el archivo en `public/media/portada.mp4` y configurá esta variable
tanto en el `.env` local como en Vercel:

`VITE_HOME_VIDEO_URL=/media/portada.mp4`

Después de modificar variables en Vercel, generá un nuevo despliegue.
El video usa reproducción automática silenciada, repetición y reproducción
integrada en móviles (`playsInline`).
