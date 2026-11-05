import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Minus, ShoppingBag } from "lucide-react";
import { getProduct } from "../lib/products";
import { useCart } from "../context/CartContext";
import { money } from "../lib/format";

export default function Product() {
  const { id } = useParams(); const navigate = useNavigate(); const { addItem } = useCart();
  const [product, setProduct] = useState(null); const [size, setSize] = useState(""); const [color, setColor] = useState(""); const [quantity, setQuantity] = useState(1); const [error, setError] = useState(""); const [activeMedia, setActiveMedia] = useState("");
  useEffect(() => { getProduct(id).then(p => { setProduct(p); setSize(p?.sizes?.[0] || "Único"); setColor(p?.colors?.[0] || ""); setActiveMedia(p?.image_url || ""); }).catch(e => setError(e.message)); }, [id]);
  if (!product) return <main className="page container">{error || "Cargando prenda..."}</main>;
  const images = product.media_urls?.length ? product.media_urls : (product.image_url ? [product.image_url] : []);
  return <main className="page container product-detail">
    <button className="back-link" onClick={() => navigate(-1)}><ArrowLeft size={16}/> Volver a la tienda</button>
    <div className="detail-grid"><div>
      <div className="detail-image">{activeMedia === product.video_url && product.video_url ? <video src={product.video_url} controls playsInline/> : activeMedia ? <img src={activeMedia} alt={product.name}/> : <div className="empty-media">SS22.WWW</div>}</div>
      <div className="media-thumbs">{images.map((url,i) => <button key={url} className={activeMedia === url ? "selected" : ""} onClick={() => setActiveMedia(url)}><img src={url} alt={`${product.name} ${i+1}`}/></button>)}
        {product.video_url && <button className="video-thumb" onClick={() => setActiveMedia(product.video_url)}>Ver video</button>}</div>
    </div>
      <div className="detail-copy"><p className="eyebrow">{product.category}</p><h1>{product.name}<span>.</span></h1><h2>{money(product.price)}</h2><p>{product.description}</p>
        {product.stock_status === "sold_out" && <p className="stock-alert">AGOTADO · SIN STOCK</p>}<div className="option-group"><strong>Talle</strong><div className="option-list">{(product.sizes || ["Único"]).map(s => <button key={s} className={size === s ? "selected" : ""} onClick={() => setSize(s)}>{s}</button>)}</div></div>
        {product.colors?.length > 0 && <div className="option-group"><strong>Color</strong><div className="option-list">{product.colors.map(c => <button key={c} className={color === c ? "selected" : ""} onClick={() => setColor(c)}>{c}</button>)}</div></div>}
        <div className="option-group"><strong>Cantidad</strong><div className="quantity-control"><button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={15}/></button><span>{quantity}</span><button onClick={() => setQuantity(quantity + 1)}><Plus size={15}/></button></div></div>
        <div className="deposit-box"><span>Precio de la prenda</span><strong>{money(product.price * quantity)}</strong><small>El envío se calcula según tu código postal.</small></div>
        <button className="button button-dark full-button" disabled={product.stock_status === "sold_out"} onClick={() => { addItem(product, size, color); navigate("/carrito"); }}><ShoppingBag size={17}/> {product.stock_status === "sold_out" ? "Prenda agotada" : "Agregar al carrito"}</button>
      </div>
    </div>
  </main>;
}
