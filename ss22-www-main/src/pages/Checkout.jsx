import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { money } from "../lib/format";
import { supabase } from "../lib/supabase";
import { getActivePromotions, getProductOffer, cartHasFreeShipping } from "../lib/promotions";
import { SHIPPING_RATES, shippingPrice, validatePostalCode } from "../lib/shipping";

export default function Checkout() {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const [promotions, setPromotions] = useState([]);
  const [promotionsLoaded, setPromotionsLoaded] = useState(false);
  const [form, setForm] = useState({ name: "", email: user?.email || "", phone: "", address: "", city: "", postal_code: "", shipping_method: "home", notes: "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  useEffect(() => { getActivePromotions().then(setPromotions).catch(() => setPromotions([])).finally(() => setPromotionsLoaded(true)); }, []);
  useEffect(() => { if (user?.email) setForm(current => ({ ...current, email: current.email || user.email })); }, [user?.email]);
  function change(e) { setForm(current => ({ ...current, [e.target.name]: e.target.value })); }

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + getProductOffer(item.product, promotions).price * item.quantity, 0), [items, promotions]);
  const freeShipping = useMemo(() => cartHasFreeShipping(items, promotions), [items, promotions]);
  const postal = validatePostalCode(form.postal_code);
  const shippingZone = postal.valid ? postal.zone : null;
  const shipping = shippingPrice(shippingZone, form.shipping_method, freeShipping);
  const grandTotal = subtotal + Number(shipping || 0);

  async function submit(e) {
    e.preventDefault(); setMessage("");
    if (!user) { setMessage("Para continuar, iniciá sesión o creá tu cuenta."); return; }
    if (!items.length) { setMessage("Tu carrito está vacío."); return; }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setMessage("Ingresá un correo electrónico válido para recibir las novedades del pedido."); return; }
    if (!postal.valid) { setMessage(postal.message || "Ingresá un código postal válido."); return; }
    if (shipping == null) { setMessage("No pudimos calcular el envío para ese código postal."); return; }
    setBusy(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session?.access_token) throw new Error("Tu sesión venció. Volvé a ingresar.");
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionData.session.access_token}` },
        body: JSON.stringify({
          items: items.map(item => ({ product_id: item.product.id, quantity: item.quantity, size: item.size, color: item.color })),
          customer: { ...form, shipping_zone: shippingZone, postal_code: postal.normalized }
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo registrar el pedido.");
      setCreatedOrder(data.order); clearCart();
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }

  if (!items.length && !createdOrder) return <main className="page container empty-state"><h1>Tu carrito está vacío.</h1><Link to="/tienda" className="button button-dark">Volver a la tienda</Link></main>;
  if (createdOrder) return <main className="page container transfer-confirmation">
    <div className="page-title"><p className="eyebrow">PEDIDO REGISTRADO</p><h1>¡Listo!<span>.</span></h1></div>
    <section className="transfer-card">
      <p>Registramos tu pedido <strong>#{createdOrder.id.slice(0,8).toUpperCase()}</strong>.</p>
      <p>Te enviaremos las novedades a <strong>{form.email}</strong>.</p>
      <h2>Transferencia bancaria</h2>
      <div className="transfer-detail"><span>Alias</span><strong>ss22.www</strong><button type="button" className="button button-outline small" onClick={() => navigator.clipboard?.writeText("ss22.www")}>Copiar alias</button></div>
      <div className="transfer-detail"><span>Titular</span><strong>Matheo Martinez</strong></div>
      <p className="fine-print">Enviá el comprobante por WhatsApp al 11 5415-4628 o por Instagram @ss22.www. El pedido queda pendiente hasta que verifiquemos el pago.</p>
      <a className="button button-outline full-button" href={`https://wa.me/5491154154628?text=${encodeURIComponent(`Hola SS22, envío el comprobante del pedido ${createdOrder.id.slice(0,8).toUpperCase()}`)}`} target="_blank" rel="noreferrer">Enviar comprobante por WhatsApp</a>
      <a className="text-button" href="https://www.instagram.com/ss22.www/" target="_blank" rel="noreferrer">Abrir Instagram @ss22.www</a>
      <h2>Tu total ya está calculado</h2>
      <div className="transfer-detail"><span>Prendas con descuentos aplicados</span><strong>{money(createdOrder.subtotal)}</strong></div>
      <div className="transfer-detail"><span>Envío</span><strong>{createdOrder.shipping_amount === 0 ? "GRATIS" : money(createdOrder.shipping_amount)}</strong></div>
      <div className="transfer-detail"><span>Total del pedido</span><strong>{money(createdOrder.total)}</strong></div>
      <p className="fine-print">Podés consultar el pedido y los datos de transferencia en “Mis pedidos”.</p>
      <Link to="/pedidos" className="button button-dark full-button">Ver mis pedidos</Link>
    </section>
  </main>;

  return <main className="page container">
    <div className="page-title"><p className="eyebrow">ÚLTIMO PASO</p><h1>Finalizar compra<span>.</span></h1></div>
    <div className="cart-layout">
      <form className="form-stack checkout-form" onSubmit={submit}>
        <h2>Datos de entrega</h2>
        <label>Nombre y apellido<input name="name" autoComplete="name" required value={form.name} onChange={change}/></label>
        <label>Correo electrónico<input type="email" name="email" autoComplete="email" required value={form.email} onChange={change} placeholder="tu@email.com"/><small>Te enviaremos la confirmación, el estado del pago y los datos del envío.</small></label>
        <label>Teléfono<input name="phone" autoComplete="tel" required value={form.phone} onChange={change}/></label>
        <label>Dirección y número<input name="address" autoComplete="street-address" required value={form.address} onChange={change}/></label>
        <label>Localidad y provincia<input name="city" autoComplete="address-level2" required value={form.city} onChange={change}/></label>
        <label>Código postal argentino (CPA)<input name="postal_code" autoComplete="postal-code" required maxLength={8} value={form.postal_code} onChange={change} placeholder="Ej. B1704ABC"/><small>Ingresá el CPA completo. La zona se calcula automáticamente. <a href="https://www.correoargentino.com.ar/formularios/cpa" target="_blank" rel="noreferrer">Verificar CPA oficial</a>.</small>{form.postal_code && <small className={postal.valid ? "postal-valid" : "postal-invalid"}>{postal.valid ? `Destino detectado: ${SHIPPING_RATES[postal.zone].label}` : postal.message}</small>}</label>
        <fieldset className="shipping-choice"><legend>¿Cómo querés recibirlo?</legend>
          <label><input type="radio" name="shipping_method" value="home" checked={form.shipping_method === "home"} onChange={change}/> Envío a domicilio</label>
          <label><input type="radio" name="shipping_method" value="branch" checked={form.shipping_method === "branch"} onChange={change}/> Retiro en sucursal de Correo Argentino</label>
        </fieldset>
        <p className="shipping-delivery-note">Plazo estimado: 2 a 5 días hábiles desde el despacho.</p>
        <label>Indicaciones (opcional)<textarea name="notes" value={form.notes} onChange={change} placeholder="Piso, departamento u otra información útil"/></label>
        <div className="payment-method-note"><strong>Pago por transferencia</strong><span>El pedido se registra con el total de prendas y envío. Encontrarás los datos de pago en Mis pedidos.</span></div>
        {message && <p className="notice" role="alert">{message}</p>}
        <button className="button button-dark full-button" disabled={busy || !promotionsLoaded || !postal.valid}>{busy ? "Registrando pedido..." : !promotionsLoaded ? "Preparando total..." : "Confirmar pedido"}</button>
      </form>
      <aside className="summary-card"><p className="eyebrow">TU COMPRA</p>
        {items.map(item => { const offer = getProductOffer(item.product, promotions); return <div key={item.key}><span>{item.product.name} × {item.quantity}{offer.discount ? ` · -${offer.discount}%` : ""}</span><strong>{money(offer.price * item.quantity)}</strong></div>; })}
        <hr/><div><span>Subtotal con descuentos</span><strong>{money(subtotal)}</strong></div>
        <div><span>Envío {freeShipping ? "(promoción)" : shippingZone ? `· ${SHIPPING_RATES[shippingZone].label}` : "· ingresá tu CPA"}</span><strong>{freeShipping ? "GRATIS" : shipping == null ? "A calcular" : money(shipping)}</strong></div>
        <div className="checkout-grand-total"><span>Total</span><strong>{money(grandTotal)}</strong></div>
        {freeShipping && <small className="offer-note">¡Tu carrito tiene envío gratis!</small>}
        <small>Precios estimados de SS22. El CPA debe coincidir con un formato y rango postal argentino reconocido. Entrega estimada: 2 a 5 días hábiles desde el despacho.</small>
      </aside>
    </div>
  </main>;
}
