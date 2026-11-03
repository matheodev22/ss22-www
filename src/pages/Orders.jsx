import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { money } from "../lib/format";

const labels = { pending_payment: "Pendiente de pago", paid: "Seña pagada", ordered: "Encargo realizado", in_transit: "En camino", arrived: "Llegó a Argentina", ready: "Listo para entregar", completed: "Entregado", cancelled: "Cancelado" };
export default function Orders() {
  const { user } = useAuth(); const [orders, setOrders] = useState([]); const [error, setError] = useState("");
  useEffect(() => { if (!user || !supabase) return; supabase.from("orders").select("*, order_items(*)").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data, error }) => { if (error) setError(error.message); else setOrders(data || []); }); }, [user]);
  return <main className="page container"><div className="page-title"><p className="eyebrow">ORDER TRACKING</p><h1>Mis pedidos<span>.</span></h1></div>{error && <p className="notice">{error}</p>}{!orders.length && <div className="empty-state">Todavía no tenés pedidos registrados. <Link to="/tienda">Explorar tienda</Link></div>}{orders.map(order => <article className="order-card" key={order.id}><div><p className="eyebrow">PEDIDO #{order.id.slice(0,8).toUpperCase()}</p><h3>{labels[order.status] || order.status}</h3><p>{new Date(order.created_at).toLocaleDateString("es-AR")}</p></div><div><span>Total {money(order.total_amount)}</span><span>Seña abonada: {money(order.deposit_paid || 0)}</span><strong>Saldo pendiente: {money(order.balance_due)}</strong></div></article>)}</main>;
}
