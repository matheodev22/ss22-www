import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { money } from "../lib/format";
import { supabase } from "../lib/supabase";
import { getActivePromotions, getProductOffer, cartHasFreeShipping } from "../lib/promotions";
import { SHIPPING_RATES, shippingPrice } from "../lib/shipping";

export default function Checkout() {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const [promotions, setPromotions] = useState([]);
  const [promotionsLoaded, setPromotionsLoaded] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "", postal_code: "", shipping_method: "home", shipping_zone: "amba", notes: "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  useEffect(() => { getActivePromotions().then(setPromotions).catch(() => setPromotions([])).finally(() => setPromotionsLoaded(true)); }, []);
  function change(e) { setForm(current => ({ ...current, [e.target.name]: e.target.value })); }

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + getProductOffer(item.product, promotions).price * item.quantity, 0), [items, promotions]);
  const freeShipping = useMemo(() => cartHasFreeShipping(items, promotions), [items, promotions]);
  const shipping = shippingPrice(form.shipping_zone, form.shipping_method, freeShipping);
  const grandTotal = subtotal + Number(shipping || 0);

  async function submit(e) {
    e.preventDefault(); setMessage("");
    if (!user) { setMessage("Para continuar, iniciá sesión o creá tu cuenta."); return; }
    if (!items.length) { setMessage("Tu carrito está vacío."); return; }
    if (shipping == null) { setMessage("Elegí una zona de envío válida."); return; }
    setBusy(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session?.access_token) throw new Error("Tu sesión venció. Volvé a ingresar.");
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionData.session.access_token}` },
        body: JSON.stringify({
          items: items.map(item => ({ product_id: item.product.id, quantity: item.quantity, size: item.size, color: item.color })),
          customer: { ...form }
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
        <label>Teléfono<input name="phone" autoComplete="tel" required value={form.phone} onChange={change}/></label>
        <label>Dirección y número<input name="address" autoComplete="street-address" required value={form.address} onChange={change}/></label>
        <label>Localidad y provincia<input name="city" autoComplete="address-level2" required value={form.city} onChange={change}/></label>
        <label>Código postal<input name="postal_code" autoComplete="postal-code" required value={form.postal_code} onChange={change} placeholder="Ej. 1704"/></label>
        <label>Zona de destino<select name="shipping_zone" value={form.shipping_zone} onChange={change}>{Object.entries(SHIPPING_RATES).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select></label>
        <fieldset className="shipping-choice"><legend>¿Cómo querés recibirlo?</legend>
          <label><input type="radio" name="shipping_method" value="home" checked={form.shipping_method === "home"} onChange={change}/> Envío a domicilio</label>
          <label><input type="radio" name="shipping_method" value="branch" checked={form.shipping_method === "branch"} onChange={change}/> Retiro en sucursal de Correo Argentino</label>
        </fieldset>
        <p className="shipping-delivery-note">Plazo estimado: 2 a 5 días hábiles desde el despacho.</p>
        <label>Indicaciones (opcional)<textarea name="notes" value={form.notes} onChange={change} placeholder="Piso, departamento u otra información útil"/></label>
        <div className="payment-method-note"><strong>Pago por transferencia</strong><span>El pedido se registra con el total de prendas y envío. Encontrarás los datos de pago en Mis pedidos.</span></div>
        {message && <p className="notice" role="alert">{message}</p>}
        <button className="button button-dark full-button" disabled={busy || !promotionsLoaded}>{busy ? "Registrando pedido..." : !promotionsLoaded ? "Preparando total..." : "Confirmar pedido"}</button>
      </form>
      <aside className="summary-card"><p className="eyebrow">TU COMPRA</p>
        {items.map(item => { const offer = getProductOffer(item.product, promotions); return <div key={item.key}><span>{item.product.name} × {item.quantity}{offer.discount ? ` · -${offer.discount}%` : ""}</span><strong>{money(offer.price * item.quantity)}</strong></div>; })}
        <hr/><div><span>Subtotal con descuentos</span><strong>{money(subtotal)}</strong></div>
        <div><span>Envío {freeShipping ? "(promoción)" : `· ${SHIPPING_RATES[form.shipping_zone].label}`}</span><strong>{freeShipping ? "GRATIS" : money(shipping)}</strong></div>
        <div className="checkout-grand-total"><span>Total</span><strong>{money(grandTotal)}</strong></div>
        {freeShipping && <small className="offer-note">¡Tu carrito tiene envío gratis!</small>}
        <small>Precios de envío estimados de SS22. Entrega de 2 a 5 días hábiles desde el despacho.</small>
      </aside>
    </div>
  </main>;
}
