import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Minus, ShoppingBag } from "lucide-react";
import { getProduct } from "../lib/products";
import { useCart } from "../context/CartContext";
import { money, depositFor } from "../lib/format";

export default function Product() {
  const { id } = useParams(); const navigate = useNavigate(); const { addItem } = useCart();
  const [product, setProduct] = useState(null); const [size, setSize] = useState(""); const [color, setColor] = useState(""); const [quantity, setQuantity] = useState(1); const [error, setError] = useState("");
  useEffect(() => { getProduct(id).then(p => { setProduct(p); setSize(p?.sizes?.[0] || "Único"); setColor(p?.colors?.[0] || ""); }).catch(e => setError(e.message)); }, [id]);
  if (!product) return <main className="page container">{error || "Cargando producto..."}</main>;
  return <main className="page container product-detail">
    <button className="back-link" onClick={() => navigate(-1)}><ArrowLeft size={16}/> Volver</button>
    <div className="detail-grid"><div className="detail-image"><img src={product.image_url} alt={product.name}/><span className="image-tag">POR ENCARGO</span></div>
      <div className="detail-copy"><p className="eyebrow">{product.category}</p><h1>{product.name}<span>.</span></h1><h2>{money(product.price)}</h2><p>{product.description}</p>
        <div className="option-group"><strong>Talle</strong><div className="option-list">{(product.sizes || ["Único"]).map(s => <button key={s} className={size === s ? "selected" : ""} onClick={() => setSize(s)}>{s}</button>)}</div></div>
        {product.colors?.length > 0 && <div className="option-group"><strong>Color</strong><div className="option-list">{product.colors.map(c => <button key={c} className={color === c ? "selected" : ""} onClick={() => setColor(c)}>{c}</button>)}</div></div>}
        <div className="option-group"><strong>Cantidad</strong><div className="quantity-control"><button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={15}/></button><span>{quantity}</span><button onClick={() => setQuantity(quantity + 1)}><Plus size={15}/></button></div></div>
        <div className="deposit-box"><span>Seña estimada ({product.deposit_percent || 30}%)</span><strong>{money(depositFor(product.price * quantity, product.deposit_percent || 30))}</strong><small>Saldo restante: {money(product.price * quantity - depositFor(product.price * quantity, product.deposit_percent || 30))}</small></div>
        <button className="button button-dark full-button" onClick={() => { addItem(product, size, color); navigate("/carrito"); }}><ShoppingBag size={17}/> Agregar al carrito</button>
        <p className="fine-print">Producto por encargo. Plazo estimado de entrega: aproximadamente 30 días, sujeto a variaciones logísticas. La seña y el saldo se detallan antes de confirmar el pago.</p>
      </div>
    </div>
  </main>;
}
