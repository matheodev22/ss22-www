import { Instagram, MessageCircle } from "lucide-react";

const whatsapp = "https://wa.me/5491154154628?text=Hola%20SS22%2C%20quiero%20consultar%20por%20una%20prenda.";
const instagram = "https://www.instagram.com/ss22.www/";

export default function Info() {
  return <main className="page container info-page">
    <p className="eyebrow">SS22.WWW · AYUDA</p>
    <h1>Preguntas frecuentes<span>.</span></h1>

    <section><h3>¿Cómo compro?</h3><p>Elegí la prenda, seleccioná talle y color, agregala al carrito y completá tus datos para registrar el pedido. Después podés seguir el estado desde “Mis pedidos”.</p></section>
    <section><h3>¿Cómo son las prendas?</h3><p>Todas las prendas que ofrecemos son nuevas, sin uso y se entregan con su bolsa. Cuidamos que recibas el producto en las condiciones informadas en su publicación.</p></section>
    <section><h3>¿Puedo ver más fotos o videos antes de comprar?</h3><p>¡Sí! Si querés consultar la calidad, las terminaciones, la tela, los detalles o ver más imágenes de una prenda, escribinos por Instagram o WhatsApp. También podés ver nuestros videos y contenidos promocionales en las redes de SS22.</p>
      <div className="info-contact-links"><a className="button button-outline" href={instagram} target="_blank" rel="noreferrer"><Instagram size={16}/> Instagram @ss22.www</a><a className="button button-dark" href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={16}/> Consultar por WhatsApp</a></div>
    </section>
    <section id="devoluciones"><h3>¿Hay devoluciones o cambios?</h3><p>Las prendas se entregan nuevas, sin uso y con su bolsa. En compras realizadas por internet, la normativa argentina reconoce el derecho de arrepentimiento dentro de los 10 días corridos desde la entrega del producto o la celebración del contrato, lo que ocurra último. Para ejercerlo, la prenda debe mantenerse sin uso y en las condiciones en que fue recibida. Fuera de ese derecho legal, SS22 no ofrece devoluciones por cambio de opinión o elección de talle. Los reclamos por productos con fallas se atienden conforme a la normativa de defensa del consumidor.</p>
      <a className="button button-outline" href="https://wa.me/5491154154628?text=Hola%20SS22%2C%20quiero%20ejercer%20mi%20derecho%20de%20arrepentimiento%20sobre%20mi%20compra." target="_blank" rel="noreferrer">Solicitar arrepentimiento / hacer un reclamo</a>
    </section>
    <section><h3>¿Los productos tienen stock?</h3><p>En cada publicación vas a encontrar el estado de disponibilidad. “Stock disponible” significa que podés comprar la prenda. Si figura “Sin stock”, no vas a poder agregarla al carrito hasta que vuelva a estar disponible.</p></section>
    <section><h3>¿Cómo funcionan los descuentos?</h3><p>Las promociones vigentes aparecen en los productos alcanzados. Pueden aplicarse a toda la tienda, a una categoría o a prendas puntuales. Si hay envío gratis, se indicará en el producto y en el resumen de compra. Revisá siempre las condiciones y vigencia de cada promoción.</p></section>
    <section><h3>¿Cómo calculo el envío?</h3><p>Ingresá los 4 números de tu código postal. El sistema estima automáticamente la zona y muestra las opciones disponibles: retiro en sucursal o entrega a domicilio. No necesitás seleccionar una localidad o zona manualmente. La sucursal habilitada se confirma según el destino y la disponibilidad de Correo Argentino.</p></section>
    <section><h3>¿Cuáles son los valores estimados?</h3><p>Las tarifas de SS22 varían según la zona y la modalidad. A sucursal: AMBA $9.300, Buenos Aires interior $9.550, Centro $9.850, Norte $9.950 y Patagonia $10.100. A domicilio: AMBA $14.800, Buenos Aires interior $15.100, Centro $15.450, Norte $15.600 y Patagonia $15.800.</p></section>
    <section><h3>¿Cuánto tarda en llegar?</h3><p>El plazo estimado es de 2 a 5 días hábiles desde que el pedido es despachado. El tiempo de preparación previo al despacho no está incluido. Es un plazo estimado y puede variar por demoras operativas del correo.</p></section>
    <section><h3>¿Qué pasa los fines de semana y feriados?</h3><p>Los plazos de entrega se cuentan en días hábiles: sábados, domingos y feriados no se contabilizan. La distribución y los movimientos del correo pueden no realizarse esos días, por lo que el seguimiento puede permanecer sin actualizaciones hasta el siguiente día hábil.</p></section>
    <section><h3>¿Hay envío gratis?</h3><p>Cuando una promoción de envío gratis esté activa y tu compra cumpla sus condiciones, lo vas a ver indicado en el sitio y en el resumen del checkout.</p></section>
    <section><h3>¿Cómo se paga?</h3><p>El pago se realiza por transferencia bancaria. Una vez registrado el pedido, vas a ver el alias y los datos para transferir. El pedido queda pendiente hasta que verifiquemos el comprobante.</p></section>
    <section><h3>¿Cómo sigo mi compra?</h3><p>Desde “Mis pedidos” podés consultar el estado. Cuando se despache, se agrega el número de seguimiento para que puedas consultar el envío.</p></section>
    <section><h3>¿Necesitás ayuda?</h3><p>Escribinos por Instagram o WhatsApp y te ayudamos con tu compra.</p><div className="info-contact-links"><a className="button button-outline" href={instagram} target="_blank" rel="noreferrer"><Instagram size={16}/> Instagram</a><a className="button button-dark" href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={16}/> WhatsApp · 11 5415-4628</a></div></section>
  </main>;
}
