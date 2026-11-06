import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import { money } from "../lib/format";
import { getActivePromotions, getProductOffer, cartHasFreeShipping } from "../lib/promotions";

export default function Cart() {
  const { items, updateQuantity, removeItem } = useCart();
  const [promotions, setPromotions] = useState([]);
  useEffect(() => { getActivePromotions().then(setPromotions).catch(() => setPromotions([])); }, []);
  const total = items.reduce((sum, item) => sum + getProductOffer(item.product, promotions).price * item.quantity, 0);
  const freeShipping = cartHasFreeShipping(items, promotions);
  if (!items.length) return <main className="page container empty-state"><p className="eyebrow">TU CARRITO</p><h1>Tu carrito está vacío.</h1><Link className="button button-dark" to="/tienda">Explorar tienda</Link></main>;
  return <main className="page container"><div className="page-title"><p className="eyebrow">TU SELECCIÓN</p><h1>Tu carrito<span>.</span></h1></div>
    <div className="cart-layout"><div className="cart-items">{items.map(item => { const offer = getProductOffer(item.product, promotions); return <article className="cart-item" key={item.key}><img src={item.product.image_url} alt={item.product.name}/><div className="cart-item-info"><p className="eyebrow">{item.product.category}</p><h3>{item.product.name}</h3><p>Talle: {item.size} · Color: {item.color || "—"}</p><strong>{money(offer.price)}{offer.discount > 0 && <del className="old-price">{money(offer.originalPrice)}</del>}</strong>{offer.freeShipping && <small className="offer-note">Esta prenda tiene envío gratis</small>}<div className="quantity-control"><button onClick={() => updateQuantity(item.key, item.quantity - 1)}><Minus size={14}/></button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.key, item.quantity + 1)}><Plus size={14}/></button></div></div><button className="icon-button remove-button" onClick={() => removeItem(item.key)} aria-label="Eliminar"><Trash2 size={17}/></button></article>; })}</div>
      <aside className="summary-card"><p className="eyebrow">RESUMEN DE COMPRA</p><div><span>Subtotal con descuentos</span><strong>{money(total)}</strong></div><div><span>Envío</span><strong>{freeShipping ? "GRATIS" : "Se calcula en el siguiente paso"}</strong></div>{freeShipping && <small className="offer-note">Tu compra tiene envío gratis.</small>}<small>Elegí la zona y modalidad de entrega en el checkout para conocer el total final.</small><Link to="/checkout" className="button button-dark full-button">Continuar <ArrowRight size={17}/></Link></aside>
    </div>
  </main>;
}
