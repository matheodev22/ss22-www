import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../lib/products";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [error, setError] = useState("");
  useEffect(() => { getProducts().then(setProducts).catch(e => setError(e.message)); }, []);
  const categories = ["Todos", ...new Set(products.map(p => p.category).filter(Boolean))];
  const filtered = useMemo(() => products.filter(p => (category === "Todos" || p.category === category) && `${p.name} ${p.category}`.toLowerCase().includes(query.toLowerCase())), [products, category, query]);
  return <main className="page container">
    <div className="page-title"><p className="eyebrow">SELECCIÓN SS22</p><h1>La tienda<span>.</span></h1><p>Prendas seleccionadas para vos.</p></div>
    <div className="shop-tools"><label className="search-box"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar prendas..."/></label><div className="category-tabs">{categories.map(c => <button key={c} className={category === c ? "active" : ""} onClick={() => setCategory(c)}>{c}</button>)}</div></div>
    {error && <p className="notice">{error}</p>}
    <div className="product-grid">{filtered.map(p => <ProductCard key={p.id} product={p}/>)}</div>
    {!filtered.length && <div className="empty-state">No encontramos productos con esa búsqueda.</div>}
  </main>;
}
