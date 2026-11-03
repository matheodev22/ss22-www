import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { money, depositFor } from "../lib/format";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Checkout() {
  const { items, total } = useCart(); const { user } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "", notes: "" });
  const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  const deposit = items.reduce((sum, item) => sum + depositFor(item.product.price * item.quantity, item.product.deposit_percent || 30), 0);
  function change(e) { setForm({ ...form, [e.target.name]: e.target.value }); }
  async function submit(e) {
    e.preventDefault(); setMessage("");
    if (!user) { setMessage("Para continuar, primero iniciá sesión o creá una cuenta."); return; }
    if (!items.length) { setMessage("Tu carrito está vacío."); return; }
    setBusy(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session?.access_token) throw new Error("No pudimos validar tu sesión. Volvé a iniciar sesión.");
      const response = await fetch("/api/create-payment", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionData.session.access_token}` }, body: JSON.stringify({ items: items.map(i => ({ product_id: i.product.id, quantity: i.quantity, size: i.size, color: i.color })), customer: form }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo iniciar el pago.");
      window.location.href = data.init_point;
    } catch (err) { setMessage(err.message); setBusy(false); }
  }
  if (!items.length) return <main className="page container empty-state"><h1>No hay productos para pagar.</h1><Link to="/tienda" className="button button-dark">Volver a la tienda</Link></main>;
  return <main className="page container"><div className="page-title"><p className="eyebrow">CHECKOUT</p><h1>Finalizar compra<span>.</span></h1></div><div className="cart-layout"><form className="form-stack checkout-form" onSubmit={submit}><h2>Datos de entrega</h2><label>Nombre y apellido<input name="name" required value={form.name} onChange={change}/></label><label>Teléfono<input name="phone" required value={form.phone} onChange={change}/></label><label>Dirección<input name="address" required value={form.address} onChange={change}/></label><label>Localidad / provincia<input name="city" required value={form.city} onChange={change}/></label><label>Notas (opcional)<textarea name="notes" value={form.notes} onChange={change}/></label><p className="fine-print">Al continuar, serás redirigido a Mercado Pago para abonar la seña. El pedido se considera pagado únicamente cuando Mercado Pago confirme la operación.</p>{message && <p className="notice">{message}</p>}<button className="button button-dark full-button" disabled={busy}>{busy ? "Preparando pago..." : `Pagar seña · ${money(deposit)}`}</button></form><aside className="summary-card"><p className="eyebrow">RESUMEN</p>{items.map(i => <div key={i.key}><span>{i.product.name} × {i.quantity}</span><strong>{money(i.product.price * i.quantity)}</strong></div>)}<hr/><div><span>Total</span><strong>{money(total)}</strong></div><div><span>Seña ahora</span><strong>{money(deposit)}</strong></div><div><span>Saldo restante</span><strong>{money(total - deposit)}</strong></div><small>Plazo estimado: aproximadamente 30 días. El envío puede tener un costo adicional.</small></aside></div></main>;
}
