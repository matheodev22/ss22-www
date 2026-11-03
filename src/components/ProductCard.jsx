import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { money } from "../lib/format";

export default function ProductCard({ product }) {
  return <Link to={`/producto/${product.id}`} className="product-card">
    <div className="product-image"><img src={product.image_url || "https://placehold.co/800x1000?text=SS22"} alt={product.name}/><span className="image-tag">POR ENCARGO</span><span className="quick-arrow"><ArrowUpRight size={18}/></span></div>
    <div className="product-info"><div><p className="eyebrow">{product.category}</p><h3>{product.name}</h3></div><strong>{money(product.price)}</strong></div>
    <p className="product-deposit">Transferencia · 100%</p>
  </Link>;
}
