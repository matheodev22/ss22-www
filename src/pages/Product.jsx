import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Minus, ShoppingBag, Truck } from "lucide-react";
import { getProduct } from "../lib/products";
import { getActivePromotions, getProductOffer } from "../lib/promotions";
import { shippingPrice, validatePostalCode, getBranchPickupInfo } from "../lib/shipping";
import { useCart } from "../context/CartContext";
import { money } from "../lib/format";

export default function Product() {
  const { id } = useParams(); const navigate = useNavigate(); const { addItem } = useCart();
  const [product, setProduct] = useState(null); const [promotions, setPromotions] = useState([]);
  const [size, setSize] = useState(""); const [color, setColor] = useState(""); const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(""); const [activeMedia, setActiveMedia] = useState("");
  const [postalCode, setPostalCode] = useState(""); const [shippingMethod, setShippingMethod] = useState("branch");
  useEffect(() => {
    getProduct(id).then(p => { setProduct(p); setSize(p?.sizes?.[0] || "Único"); setColor(p?.colors?.[0] || ""); setActiveMedia(p?.image_url || ""); }).catch(e => setError(e.message));
    getActivePromotions().then(setPromotions).catch(() => setPromotions([]));
  }, [id]);
  if (!product) return <main className="page container">{error || "Cargando prenda..."}</main>;
  const offer = getProductOffer(product, promotions);
  const images = product.media_urls?.length ? product.media_urls : (product.image_url ? [product.image_url] : []);
  const postal = validatePostalCode(postalCode);
  const canQuote = postal.valid;
  const branchPrice = shippingPrice(postal.zone, "branch", offer.freeShipping);
  const homePrice = shippingPrice(postal.zone, "home", offer.freeShipping);
  return <main className="page container product-detail">
    <button className="back-link" onClick={() => navigate(-1)}><ArrowLeft size={16}/> Volver a la tienda</button>
    <div className="detail-grid"><div>
      <div className="detail-image">{activeMedia === product.video_url && product.video_url ? <video src={activeMedia} controls playsInline/> : activeMedia ? <img src={activeMedia} alt={product.name}/> : <div className="empty-media">SS22.WWW</div>}</div>
      <div className="media-thumbs">{images.map((url,i) => <button key={url} className={activeMedia === url ? "selected" : ""} onClick={() => setActiveMedia(url)}><img src={url} alt={`${product.name} ${i+1}`}/></button>)}{product.video_url && <button className="video-thumb" onClick={() => setActiveMedia(product.video_url)}>Ver video</button>}</div>
    </div>
      <div className="detail-copy"><p className="eyebrow">{product.category}</p><h1>{product.name}<span>.</span></h1>
        <h2>{money(offer.price)} {offer.discount > 0 && <del className="old-price">{money(offer.originalPrice)}</del>}</h2>
        {offer.discount > 0 && <p className="offer-note">-{offer.discount}% de descuento aplicado</p>}
        <p>{product.description}</p>
        <div className="product-quality-note"><strong>¿Querés ver más detalles?</strong><p>Pedinos fotos, videos o información sobre la calidad por Instagram o WhatsApp antes de comprar.</p><div><a href="https://www.instagram.com/ss22.www/" target="_blank" rel="noreferrer">Instagram</a><a href={`https://wa.me/5491154154628?text=${encodeURIComponent(`Hola SS22, quiero consultar detalles de ${product.name}.`)}`} target="_blank" rel="noreferrer">WhatsApp</a></div><small>Prenda nueva, sin uso y con su bolsa.</small></div>
        <p className={`stock-label ${product.stock_status === "sold_out" ? "out" : ""}`}>{product.stock_status === "sold_out" ? "SIN STOCK" : "STOCK DISPONIBLE"}</p>
        <div className="option-group"><strong>Talle</strong><div className="option-list">{(product.sizes || ["Único"]).map(s => <button key={s} className={size === s ? "selected" : ""} onClick={() => setSize(s)}>{s}</button>)}</div></div>
        {product.colors?.length > 0 && <div className="option-group"><strong>Color</strong><div className="option-list">{product.colors.map(c => <button key={c} className={color === c ? "selected" : ""} onClick={() => setColor(c)}>{c}</button>)}</div></div>}
        <div className="option-group"><strong>Cantidad</strong><div className="quantity-control"><button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={15}/></button><span>{quantity}</span><button onClick={() => setQuantity(Math.min(20, quantity + 1))}><Plus size={15}/></button></div></div>
        <section className="shipping-calculator">
          <div className="shipping-calculator-heading"><Truck size={18}/><div><strong>Calculá tu envío</strong><small>Consultá el costo antes de comprar.</small></div></div>
          <label>Código postal<input value={postalCode} onChange={e => setPostalCode(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="Ej. 1704" inputMode="numeric" pattern="[0-9]{4}" maxLength={4}/></label>
          {canQuote ? <>
            <p className="shipping-cp-confirm">Presupuestos estimados para el CP {postal.normalized}</p>
            <div className="shipping-quote-results">
              <button type="button" className={shippingMethod === "branch" ? "selected" : ""} onClick={() => setShippingMethod("branch")}><span>Retiro en sucursal<small>2 a 5 días hábiles desde el despacho</small></span><b>{offer.freeShipping ? "GRATIS" : money(branchPrice)}</b></button>
              <button type="button" className={shippingMethod === "home" ? "selected" : ""} onClick={() => setShippingMethod("home")}><span>Envío a domicilio<small>2 a 5 días hábiles desde el despacho</small></span><b>{offer.freeShipping ? "GRATIS" : money(homePrice)}</b></button>
            </div>
            <small className="shipping-branch-info">{getBranchPickupInfo(postal.zone)}</small>
          </> : <small className="shipping-help">{postalCode.length ? postal.message : "Ingresá los 4 números de tu código postal para ver los presupuestos."}</small>}
          {offer.freeShipping && <p className="offer-note">Esta prenda tiene envío gratis.</p>}
        </section>
        <div className="deposit-box"><span>Precio de la prenda × {quantity}</span><strong>{money(offer.price * quantity)}</strong><small>El envío se suma en el checkout según la zona y modalidad elegidas.</small></div>
        <button className="button button-dark full-button" disabled={product.stock_status === "sold_out"} onClick={() => { addItem({ ...product, applied_price: offer.price, discount_percent: offer.discount, free_shipping: offer.freeShipping }, size, color); navigate("/carrito"); }}><ShoppingBag size={17}/> {product.stock_status === "sold_out" ? "Sin stock" : "Agregar al carrito"}</button>
      </div>
    </div>
  </main>;
}
