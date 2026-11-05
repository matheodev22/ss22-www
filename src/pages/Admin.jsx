import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { money } from "../lib/format";

const statuses = ["pending_payment", "shipping_quoted", "paid", "ordered", "in_transit", "arrived", "ready", "completed", "cancelled"];
const statusLabels = { pending_payment: "Pendiente de cotización", shipping_quoted: "Envío cotizado · pendiente de pago", paid: "Pago confirmado", ordered: "Preparando pedido", in_transit: "En camino", arrived: "En sucursal", ready: "Listo para retirar", completed: "Entregado", cancelled: "Cancelado" };
const emptyProduct = { name: "", category: "Remeras", price: "", description: "", image_url: "", sizes: "S,M,L,XL", colors: "Negro,Blanco", featured: false, active: true, stock_status: "available", media_urls: [], video_url: "" };

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [product, setProduct] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  async function refresh() {
    const [p, o] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false })
    ]);
    if (p.error || o.error) setError(p.error?.message || o.error?.message);
    setProducts(p.data || []); setOrders(o.data || []);
  }
  useEffect(() => { refresh(); }, []);

  async function uploadMedia() {
    const urls = [];
    for (const file of files) {
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) throw new Error("Elegí solamente imágenes o videos.");
      if (file.size > 80 * 1024 * 1024) throw new Error("Cada archivo debe pesar menos de 80 MB.");
      const safeName = file.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `${crypto.randomUUID()}-${safeName}`;
      const { error } = await supabase.storage.from("product-media").upload(path, file, { upsert: false });
      if (error) throw new Error("No se pudo subir el archivo. Revisá que exista el espacio de almacenamiento product-media. " + error.message);
      const { data } = supabase.storage.from("product-media").getPublicUrl(path);
      urls.push({ url: data.publicUrl, type: file.type.startsWith("video/") ? "video" : "image" });
    }
    return urls;
  }

  async function saveProduct(e) {
    e.preventDefault(); setError(""); setNotice(""); setBusy(true);
    try {
      const uploaded = await uploadMedia();
      const images = [...(product.media_urls || []), ...uploaded.filter(x => x.type === "image").map(x => x.url)];
      const videos = uploaded.filter(x => x.type === "video").map(x => x.url);
      const payload = {
        name: product.name.trim(), category: product.category.trim() || "Otros",
        price: Number(product.price), description: product.description.trim(),
        image_url: images[0] || product.image_url || "",
        media_urls: images, video_url: videos[0] || product.video_url || "",
        sizes: product.sizes.split(",").map(s => s.trim()).filter(Boolean),
        colors: product.colors.split(",").map(s => s.trim()).filter(Boolean),
        featured: Boolean(product.featured), active: Boolean(product.active), stock_status: product.stock_status || "available"
      };
      const result = editingId
        ? await supabase.from("products").update(payload).eq("id", editingId)
        : await supabase.from("products").insert(payload);
      if (result.error) throw result.error;
      setProduct(emptyProduct); setFiles([]); setEditingId(null);
      setNotice(editingId ? "Prenda actualizada." : "Prenda publicada.");
      await refresh();
    } catch (err) { setError(err.message || "No se pudo guardar la prenda."); }
    finally { setBusy(false); }
  }

  function editProduct(p) {
    setEditingId(p.id);
    setProduct({ ...emptyProduct, ...p, sizes: (p.sizes || []).join(","), colors: (p.colors || []).join(","), media_urls: p.media_urls || (p.image_url ? [p.image_url] : []) });
    setFiles([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function updateStatus(id, status) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) setError(error.message); else refresh();
  }
  async function updateShipping(id, amount) {
    const value = amount === "" ? null : Number(amount);
    const { error } = await supabase.from("orders").update({ shipping_amount: value, status: value === null ? "pending_payment" : "shipping_quoted" }).eq("id", id);
    if (error) setError(error.message); else { setNotice("Costo de envío actualizado."); refresh(); }
  }
  async function toggleProduct(id, active) {
    const { error } = await supabase.from("products").update({ active: !active }).eq("id", id);
    if (error) setError(error.message); else refresh();
  }
  async function toggleStock(id, current) {
    const next = current === "sold_out" ? "available" : "sold_out";
    const { error } = await supabase.from("products").update({ stock_status: next }).eq("id", id);
    if (error) setError(error.message); else { setNotice(next === "sold_out" ? "Prenda marcada como agotada." : "Prenda nuevamente disponible."); refresh(); }
  }
  async function updateTracking(id, tracking) {
    const { error } = await supabase.from("orders").update({ tracking_number: tracking.trim() || null }).eq("id", id);
    if (error) setError(error.message); else setNotice("Seguimiento guardado.");
  }

  return <main className="page container admin-page">
    <div className="page-title"><p className="eyebrow">PANEL DE CONTROL</p><h1>Administración<span>.</span></h1><p>Gestioná prendas, ventas y envíos desde un solo lugar.</p></div>
    {error && <p className="notice" role="alert">{error}</p>}{notice && <p className="notice">{notice}</p>}
    <section className="admin-section">
      <h2>{editingId ? "Editar prenda" : "Publicar una prenda"}</h2>
      <form className="admin-form" onSubmit={saveProduct}>
        <label>Nombre<input required value={product.name} onChange={e => setProduct({ ...product, name: e.target.value })}/></label>
        <label>Categoría<input value={product.category} onChange={e => setProduct({ ...product, category: e.target.value })} placeholder="Remeras, pantalones..."/></label>
        <label>Precio (ARS)<input required min="1" type="number" value={product.price} onChange={e => setProduct({ ...product, price: e.target.value })}/></label>
        <label>Descripción<textarea value={product.description} onChange={e => setProduct({ ...product, description: e.target.value })}/></label>
        <label>Talles separados por coma<input value={product.sizes} onChange={e => setProduct({ ...product, sizes: e.target.value })}/></label>
        <label>Colores separados por coma<input value={product.colors} onChange={e => setProduct({ ...product, colors: e.target.value })}/></label>
        <label>Disponibilidad<select value={product.stock_status || "available"} onChange={e => setProduct({ ...product, stock_status: e.target.value })}><option value="available">Disponible</option><option value="sold_out">Agotado / sin stock</option></select></label>
        <label>Mostrar en tienda<select value={String(product.active)} onChange={e => setProduct({ ...product, active: e.target.value === "true" })}><option value="true">Sí, visible</option><option value="false">No, ocultar</option></select></label>
        <label className="media-picker">Fotos y videos<input type="file" accept="image/*,video/*" multiple onChange={e => setFiles(Array.from(e.target.files || []))}/><small>Elegí varias fotos y videos juntos. Máximo 80 MB por archivo. Al editar, los archivos nuevos se suman a los existentes.</small></label>
        {files.length > 0 && <p className="selected-files">{files.map(f => f.name).join(" · ")}</p>}
        {(product.media_urls?.length || product.image_url || product.video_url) && <div className="admin-preview-list">{(product.media_urls?.length ? product.media_urls : product.image_url ? [product.image_url] : []).map((url, i) => <img key={url} src={url} alt={`Vista previa ${i+1}`}/>)}{product.video_url && <video src={product.video_url} controls playsInline/>}</div>}
        <label className="check-admin"><input type="checkbox" checked={Boolean(product.featured)} onChange={e => setProduct({ ...product, featured: e.target.checked })}/> Mostrar en portada</label>
        <button className="button button-dark" disabled={busy}>{busy ? "Guardando..." : editingId ? "Guardar cambios" : "Publicar prenda"}</button>
        {editingId && <button type="button" className="button button-outline" onClick={() => { setEditingId(null); setProduct(emptyProduct); setFiles([]); }}>Cancelar edición</button>}
      </form>
    </section>
    <section className="admin-section"><h2>Prendas publicadas ({products.length})</h2>
      {products.map(p => <div className="admin-row" key={p.id}><div className="admin-product-name">{p.image_url && <img src={p.image_url} alt=""/>}<span><b>{p.name}</b><small>{money(p.price)} · {p.category} · {p.stock_status === "sold_out" ? "AGOTADO" : "DISPONIBLE"} · {p.active ? "Visible" : "Oculta"}</small></span></div><div className="admin-actions"><button className="button button-outline small" onClick={() => editProduct(p)}>Editar</button><button className="button button-outline small" onClick={() => toggleStock(p.id, p.stock_status)}>{p.stock_status === "sold_out" ? "Marcar disponible" : "Marcar agotada"}</button><button className="button button-outline small" onClick={() => toggleProduct(p.id, p.active)}>{p.active ? "Ocultar" : "Mostrar"}</button></div></div>)}
    </section>
    <section className="admin-section"><h2>Pedidos y envíos ({orders.length})</h2>
      {orders.map(o => <article className="admin-order-card" key={o.id}>
        <div><b>Pedido #{o.id.slice(0,8).toUpperCase()}</b><span>{o.customer_name} · {o.customer_phone}</span><span>{o.shipping_address}, {o.shipping_city} · CP {o.shipping_postal_code || "Sin CP"}</span><span>Entrega: {o.shipping_method === "branch" ? "Sucursal Correo Argentino" : "Domicilio"}</span><span>Productos: {money(o.total_amount)} · Envío: {o.shipping_amount == null ? "A cotizar" : money(o.shipping_amount)}</span>{o.order_items?.map((item, i) => <span key={item.id || i}>{item.quantity} × {item.name} · Talle {item.size || "—"} · {item.color || "—"}</span>)}</div>
        <div className="admin-order-controls"><a className="button button-outline small" href="https://micorreo.correoargentino.com.ar/" target="_blank" rel="noreferrer">Cotizar en Correo Argentino ↗</a><label>Costo de envío (ARS)<input type="number" min="0" step="1" defaultValue={o.shipping_amount ?? ""} placeholder="Cotizar" onBlur={e => { if (e.target.value !== String(o.shipping_amount ?? "")) updateShipping(o.id, e.target.value); }}/></label>
        <label>Número de seguimiento<input defaultValue={o.tracking_number || ""} placeholder="Pegá el código de Correo Argentino" onBlur={e => { if (e.target.value !== (o.tracking_number || "")) updateTracking(o.id, e.target.value); }}/></label><label>Estado<select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}>{statuses.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}</select></label></div>
      </article>)}
    </section>
  </main>;
}
