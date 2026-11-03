import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { money } from '../lib/format';
import { supabase } from '../lib/supabase';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', notes: '' });
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const alias = import.meta.env.VITE_TRANSFER_ALIAS || 'CONFIGURAR_ALIAS';
  const holder = import.meta.env.VITE_TRANSFER_HOLDER || 'CONFIGURAR_TITULAR';

  function change(event) {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setMessage('');
    if (!user) { setMessage('Para continuar, primero iniciá sesión o creá una cuenta.'); return; }
    if (!items.length) { setMessage('Tu carrito está vacío.'); return; }
    setBusy(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session?.access_token) throw new Error('No pudimos validar tu sesión. Volvé a iniciar sesión.');
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionData.session.access_token}` },
        body: JSON.stringify({
          items: items.map(item => ({ product_id: item.product.id, quantity: item.quantity, size: item.size, color: item.color })),
          customer: form,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudo crear el pedido.');
      setCreatedOrder(data.order);
      clearCart();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  if (!items.length && !createdOrder) return <main className="page container empty-state"><h1>No hay productos para comprar.</h1><Link to="/tienda" className="button button-dark">Volver a la tienda</Link></main>;

  if (createdOrder) return <main className="page container transfer-confirmation">
    <div className="page-title"><p className="eyebrow">PEDIDO REGISTRADO</p><h1>Un paso más<span>.</span></h1></div>
    <section className="transfer-card">
      <p>Tu pedido <strong>#{createdOrder.id.slice(0, 8).toUpperCase()}</strong> quedó registrado y está pendiente de pago.</p>
      <h2>Estamos confirmando tu envío</h2>
      <div className="transfer-detail"><span>Subtotal de productos (sin envío)</span><strong>{money(createdOrder.total)}</strong></div>
      <div className="transfer-detail"><span>Alias</span><strong>{alias}</strong></div>
      <div className="transfer-detail"><span>Titular</span><strong>{holder}</strong></div>
      <p className="fine-print">No transfieras todavía. El costo y la modalidad de envío se coordinarán manualmente. SS22.WWW te confirmará el importe final (productos + envío) y recién entonces podrás transferir el 100%. El pedido no se considera pagado hasta que verifiquemos el ingreso del dinero.</p>
      <p className="notice">Esperá la confirmación del importe final antes de transferir. Cuando realices el pago, enviá el comprobante al canal de contacto de la tienda e indicá tu número de pedido.</p>
      <Link to="/pedidos" className="button button-dark full-button">Ver mis pedidos</Link>
    </section>
  </main>;

  return <main className="page container">
    <div className="page-title"><p className="eyebrow">CHECKOUT</p><h1>Finalizar compra<span>.</span></h1></div>
    <div className="cart-layout">
      <form className="form-stack checkout-form" onSubmit={submit}>
        <h2>Datos de entrega</h2>
        <label>Nombre y apellido<input name="name" autoComplete="name" required value={form.name} onChange={change}/></label>
        <label>Teléfono<input name="phone" autoComplete="tel" required value={form.phone} onChange={change}/></label>
        <label>Dirección<input name="address" autoComplete="street-address" required value={form.address} onChange={change}/></label>
        <label>Localidad / provincia<input name="city" autoComplete="address-level2" required value={form.city} onChange={change}/></label>
        <label>Notas (opcional)<textarea name="notes" value={form.notes} onChange={change}/></label>
        <div className="payment-method-note"><strong>Medio de pago: transferencia bancaria</strong><span>Se abona el 100% del importe de los productos. La compra queda pendiente hasta que verifiquemos la transferencia.</span></div>
        <div className="shipping-manual-note"><strong>Envío coordinado manualmente</strong><span>Por ahora no hay cotización automática. Nos comunicaremos para confirmar el costo y la modalidad de entrega.</span></div>
        {message && <p className="notice" role="alert">{message}</p>}
        <button className="button button-dark full-button" disabled={busy}>{busy ? 'Registrando pedido...' : 'Registrar pedido'}</button>
      </form>
      <aside className="summary-card"><p className="eyebrow">RESUMEN</p>
        {items.map(item => <div key={item.key}><span>{item.product.name} × {item.quantity}</span><strong>{money(item.product.price * item.quantity)}</strong></div>)}
        <hr/><div><span>Productos</span><strong>{money(total)}</strong></div><div><span>Envío</span><strong>A coordinar</strong></div><div><span>Subtotal productos</span><strong>{money(total)}</strong></div>
        <small>El costo de envío se confirmará manualmente antes de cerrar la compra.</small>
      </aside>
    </div>
  </main>;
}
