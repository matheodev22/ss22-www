import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import { money, depositFor } from "../lib/format";

export default function Cart() {
  const { items, total, updateQuantity, removeItem } = useCart();
  const deposit = items.reduce((sum, item) => sum + depositFor(item.product.price * item.quantity, item.product.deposit_percent || 30), 0);
  if (!items.length) return <main className="page container empty-state"><p className="eyebrow">YOUR BAG</p><h1>Tu carrito está vacío.</h1><Link className="button button-dark" to="/tienda">Explorar tienda</Link></main>;
  return <main className="page container"><div className="page-title"><p className="eyebrow">YOUR SELECTION</p><h1>Tu carrito<span>.</span></h1></div>
    <div className="cart-layout"><div className="cart-items">{items.map(item => <article className="cart-item" key={item.key}><img src={item.product.image_url} alt={item.product.name}/><div className="cart-item-info"><p className="eyebrow">{item.product.category}</p><h3>{item.product.name}</h3><p>Talle: {item.size} · Color: {item.color || "—"}</p><strong>{money(item.product.price)}</strong><div className="quantity-control"><button onClick={() => updateQuantity(item.key, item.quantity - 1)}><Minus size={14}/></button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.key, item.quantity + 1)}><Plus size={14}/></button></div></div><button className="icon-button remove-button" onClick={() => removeItem(item.key)} aria-label="Eliminar"><Trash2 size={17}/></button></article>)}</div>
      <aside className="summary-card"><p className="eyebrow">ORDER SUMMARY</p><div><span>Subtotal</span><strong>{money(total)}</strong></div><div><span>Seña a pagar</span><strong>{money(deposit)}</strong></div><div><span>Saldo posterior</span><strong>{money(total - deposit)}</strong></div><small>El envío se calcula y comunica según destino y modalidad.</small><Link to="/checkout" className="button button-dark full-button">Continuar <ArrowRight size={17}/></Link></aside>
    </div>
  </main>;
}
