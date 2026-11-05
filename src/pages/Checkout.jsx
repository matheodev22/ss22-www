import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { money } from "../lib/format";
import { supabase } from "../lib/supabase";

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "", postal_code: "", shipping_method: "home", notes: "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  function change(e) { setForm(current => ({ ...current, [e.target.name]: e.target.value })); }

  async function submit(e) {
    e.preventDefault(); setMessage("");
    if (!user) { setMessage("Para continuar, iniciá sesión o creá tu cuenta."); return; }
    if (!items.length) { setMessage("Tu carrito está vacío."); return; }
    setBusy(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session?.access_token) throw new Error("Tu sesión venció. Volvé a ingresar.");
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionData.session.access_token}` },
        body: JSON.stringify({
          items: items.map(item => ({ product_id: item.product.id, quantity: item.quantity, size: item.size, color: item.color })),
          customer: { ...form, postal_code: form.postal_code, shipping_method: form.shipping_method }
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
      <h2>Estamos cotizando tu envío</h2>
      <p>Vamos a verificar el costo en Correo Argentino con el código postal y la modalidad que elegiste. No transfieras todavía: te confirmaremos el total final desde el estado de tu pedido.</p>
      <div className="transfer-detail"><span>Productos</span><strong>{money(createdOrder.total)}</strong></div>
      <div className="transfer-detail"><span>Envío</span><strong>A cotizar</strong></div>
      <p className="fine-print">Cuando el envío esté cotizado vas a poder consultar el total y los datos de transferencia en “Mis pedidos”.</p>
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
        <fieldset className="shipping-choice"><legend>¿Cómo querés recibirlo?</legend>
          <label><input type="radio" name="shipping_method" value="home" checked={form.shipping_method === "home"} onChange={change}/> Envío a domicilio</label>
          <label><input type="radio" name="shipping_method" value="branch" checked={form.shipping_method === "branch"} onChange={change}/> Retiro en sucursal de Correo Argentino</label>
        </fieldset>
        <label>Indicaciones (opcional)<textarea name="notes" value={form.notes} onChange={change} placeholder="Piso, departamento u otra información útil"/></label>
        <div className="payment-method-note"><strong>Pago por transferencia</strong><span>Te compartimos los datos y el total cuando confirmemos el envío. No pagás hasta conocer el importe final.</span></div>
        {message && <p className="notice" role="alert">{message}</p>}
        <button className="button button-dark full-button" disabled={busy}>{busy ? "Registrando pedido..." : "Confirmar pedido"}</button>
      </form>
      <aside className="summary-card"><p className="eyebrow">TU COMPRA</p>
        {items.map(item => <div key={item.key}><span>{item.product.name} × {item.quantity}</span><strong>{money(item.product.price * item.quantity)}</strong></div>)}
        <hr/><div><span>Productos</span><strong>{money(total)}</strong></div><div><span>Envío</span><strong>A cotizar</strong></div><small>El costo se confirma según tu código postal y la modalidad de entrega.</small>
      </aside>
    </div>
  </main>;
}
