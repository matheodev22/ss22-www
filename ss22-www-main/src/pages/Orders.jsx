import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { money } from "../lib/format";

const labels = { pending_payment: "Envío pendiente de cotización", shipping_quoted: "Esperando comprobante / pago", paid: "Pago confirmado", ordered: "Preparando pedido", in_transit: "En camino", arrived: "En sucursal", ready: "Listo para retirar", completed: "Entregado", cancelled: "Cancelado" };
export default function Orders() {
  const { user } = useAuth(); const [orders, setOrders] = useState([]); const [error, setError] = useState("");
  const alias = import.meta.env.VITE_TRANSFER_ALIAS || "ss22.www";
  const holder = import.meta.env.VITE_TRANSFER_HOLDER || "Matheo Martinez";
  useEffect(() => {
    if (!user || !supabase) return;
    supabase.from("orders").select("*, order_items(*)").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data, error }) => { if (error) setError(error.message); else setOrders(data || []); });
  }, [user]);
  return <main className="page container"><div className="page-title"><p className="eyebrow">TU CUENTA</p><h1>Mis pedidos<span>.</span></h1><p>Consultá el estado de tus compras y envíos.</p></div>
    {error && <p className="notice">{error}</p>}
    {!orders.length && <div className="empty-state">Todavía no tenés pedidos. <Link to="/tienda">Ver prendas</Link></div>}
    {orders.map(order => {
      const shipping = Number(order.shipping_amount || 0);
      const total = Number(order.total_amount || 0) + shipping;
      return <article className="customer-order-card" key={order.id}>
        <div className="customer-order-head"><div><p className="eyebrow">PEDIDO #{order.id.slice(0,8).toUpperCase()}</p><h3>{labels[order.status] || order.status}</h3><small>{new Date(order.created_at).toLocaleDateString("es-AR")}</small></div><strong>{money(total)}</strong></div>
        <div className="order-costs"><span>Prendas <b>{money(order.total_amount)}</b></span><span>Envío <b>{order.shipping_amount == null ? "A cotizar" : shipping === 0 ? "GRATIS" : money(shipping)}</b></span></div>
        {order.status === "shipping_quoted" && <div className="transfer-card-mini"><b>Envío confirmado. Ya podés realizar la transferencia del total.</b><span>Total a transferir: <strong>{money(total)}</strong></span>{alias && <span>Alias: <strong>{alias}</strong></span>}{holder && <span>Titular: <strong>{holder}</strong></span>}{(!alias || !holder) && <small>Los datos de transferencia serán informados por la tienda.</small>}</div>}
        <p className="fine-print">Entrega: {order.shipping_method === "branch" ? "Sucursal Correo Argentino" : "A domicilio"} · {order.shipping_zone || "—"} · CP {order.shipping_postal_code || "—"} · 2 a 5 días hábiles desde el despacho</p>{order.tracking_number && <p className="tracking-info">Seguimiento: <strong>{order.tracking_number}</strong> · <a href={`https://www.correoargentino.com.ar/formularios/e-commerce?id=${encodeURIComponent(order.tracking_number)}`} target="_blank" rel="noreferrer">Consultar envío</a></p>}
      </article>;
    })}
  </main>;
}
