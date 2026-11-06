import { Link } from "react-router-dom";
import { ArrowUpRight, Truck } from "lucide-react";
import { money } from "../lib/format";
import { getProductOffer } from "../lib/promotions";

export default function ProductCard({ product, promotions = [] }) {
  const offer = getProductOffer(product, promotions);
  const soldOut = product.stock_status === "sold_out";
  return <Link to={`/producto/${product.id}`} className="product-card">
    <div className="product-image">
      <img loading="lazy" src={product.image_url || "https://placehold.co/800x1000?text=SS22"} alt={product.name}/>
      <span className={`image-tag ${soldOut ? "is-sold-out" : ""}`}>{soldOut ? "SIN STOCK" : "STOCK DISPONIBLE"}</span>
      {offer.discount > 0 && <span className="discount-tag">-{offer.discount}%</span>}
      {offer.freeShipping && <span className="free-shipping-tag"><Truck size={11}/> ENVÍO GRATIS</span>}
      <span className="quick-arrow"><ArrowUpRight size={18}/></span>
    </div>
    <div className="product-info"><div><p className="eyebrow">{product.category}</p><h3>{product.name}</h3></div><div className="product-card-prices">{offer.discount > 0 && <del>{money(offer.originalPrice)}</del>}<strong>{money(offer.price)}</strong></div></div>
  </Link>;
}
