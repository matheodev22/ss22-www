import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { money } from "../lib/format";

const statuses = ["pending_payment", "paid", "ordered", "in_transit", "arrived", "ready", "completed", "cancelled"];
const statusLabels = { pending_payment: "Pendiente de pago", paid: "Pago verificado", ordered: "Pedido realizado", in_transit: "En tránsito", arrived: "Llegó", ready: "Listo para entregar", completed: "Entregado", cancelled: "Cancelado" };
export default function Admin() {
  const [products, setProducts] = useState([]); const [orders, setOrders] = useState([]); const [error, setError] = useState("");
  const [product, setProduct] = useState({ name: "", category: "Remeras", price: "", description: "", image_url: "", sizes: "S,M,L,XL", colors: "Negro,Blanco", deposit_percent: 30 });
  async function refresh() {
    const [p, o] = await Promise.all([supabase.from("products").select("*").order("created_at", { ascending: false }), supabase.from("orders").select("*").order("created_at", { ascending: false })]);
    if (p.error || o.error) setError(p.error?.message || o.error?.message);
    setProducts(p.data || []); setOrders(o.data || []);
  }
  useEffect(() => { refresh(); }, []);
  async function createProduct(e) {
    e.preventDefault(); setError("");
    const payload = { ...product, price: Number(product.price), sizes: product.sizes.split(",").map(s => s.trim()).filter(Boolean), colors: product.colors.split(",").map(s => s.trim()).filter(Boolean), active: true };
    const { error } = await supabase.from("products").insert(payload);
    if (error) setError(error.message); else { setProduct({ ...product, name: "", price: "", description: "", image_url: "" }); refresh(); }
  }
  async function updateStatus(id, status) { const { error } = await supabase.from("orders").update({ status }).eq("id", id); if (error) setError(error.message); else refresh(); }
  async function toggleProduct(id, active) { const { error } = await supabase.from("products").update({ active: !active }).eq("id", id); if (error) setError(error.message); else refresh(); }
  return <main className="page container admin-page"><div className="page-title"><p className="eyebrow">PRIVATE AREA</p><h1>Administración<span>.</span></h1></div>{error && <p className="notice">{error}</p>}
    <section className="admin-section"><h2>Agregar producto</h2><form className="admin-form" onSubmit={createProduct}>{[["name","Nombre"],["category","Categoría"],["price","Precio en ARS"],["image_url","URL de imagen"],["description","Descripción"],["sizes","Talles separados por coma"],["colors","Colores separados por coma"]].map(([key,label]) => <label key={key}>{label}<input required={["name","price"].includes(key)} type={key === "price" ? "number" : "text"} value={product[key]} onChange={e => setProduct({ ...product, [key]: e.target.value })}/></label>)}<button className="button button-dark">Guardar producto</button></form></section>
    <section className="admin-section"><h2>Productos ({products.length})</h2>{products.map(p => <div className="admin-row" key={p.id}><span>{p.name} · {money(p.price)}</span><button className="button button-outline small" onClick={() => toggleProduct(p.id, p.active)}>{p.active ? "Desactivar" : "Activar"}</button></div>)}</section>
    <section className="admin-section"><h2>Pedidos ({orders.length})</h2>{orders.map(o => <div className="admin-row order-admin" key={o.id}><div><b>#{o.id.slice(0,8)}</b><span>{money(o.total_amount)} · {statusLabels[o.status] || o.status}</span></div><select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}>{statuses.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}</select></div>)}</section>
  </main>;
}
