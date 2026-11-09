import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../lib/products";
import { getActivePromotions, getProductOffer } from "../lib/promotions";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(searchParams.get("categoria") || "Todos");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortOrder, setSortOrder] = useState("price-desc");
  const [error, setError] = useState("");
  useEffect(() => { getProducts().then(setProducts).catch(e => setError(e.message)); getActivePromotions().then(setPromotions).catch(() => setPromotions([])); }, []);
  useEffect(() => { setCategory(searchParams.get("categoria") || "Todos"); }, [searchParams]);
  const categories = ["Todos", ...new Set(products.map(p => p.category).filter(Boolean))];
  const filtered = useMemo(() => {
    const result = products.filter(p =>
      (category === "Todos" || p.category === category) &&
      (!onlyAvailable || p.stock_status !== "sold_out") &&
      `${p.name} ${p.category || ""}`.toLowerCase().includes(query.toLowerCase().trim())
    );
    const priceOf = (product) => {
      const offer = getProductOffer(product, promotions);
      return Number(offer.price ?? product.price ?? 0);
    };
    if (sortOrder === "price-desc") result.sort((a, b) => priceOf(b) - priceOf(a));
    if (sortOrder === "price-asc") result.sort((a, b) => priceOf(a) - priceOf(b));
    if (sortOrder === "newest") result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    return result;
  }, [products, promotions, category, query, onlyAvailable, sortOrder]);
  return <main className="page container">
    <div className="page-title"><p className="eyebrow">SELECCIÓN SS22</p><h1>La tienda<span>.</span></h1><p>Filtrá por disponibilidad y ordená las prendas según el precio.</p></div>
    <div className="shop-tools">
      <label className="search-box"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar prendas..."/></label>
      <div className="category-tabs">{categories.map(c => <button key={c} className={category === c ? "active" : ""} onClick={() => { setCategory(c); if (c === "Todos") setSearchParams({}); else setSearchParams({ categoria: c }); }}>{c}</button>)}</div>
    </div>
    <div className="shop-filter-row">
      <label className={`available-filter ${onlyAvailable ? "active" : ""}`}>
        <input type="checkbox" checked={onlyAvailable} onChange={e => setOnlyAvailable(e.target.checked)}/>
        <span className="available-filter-dot"/> <span>Solo disponibles</span>
      </label>
      <label className="sort-filter"><SlidersHorizontal size={15}/><span>Precio y orden:</span>
        <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} aria-label="Ordenar productos">
          <option value="newest">Más recientes</option>
          <option value="price-desc">Precio: de mayor a menor</option>
          <option value="price-asc">Precio: de menor a mayor</option>
        </select>
      </label>
    </div>
    {error && <p className="notice">{error}</p>}
    <div className="product-grid">{filtered.map(p => <ProductCard key={p.id} product={p} promotions={promotions}/>)}</div>
    {!filtered.length && <div className="empty-state"><h2>No encontramos prendas.</h2><p>{onlyAvailable ? "No hay prendas disponibles con estos filtros." : "Probá cambiar la búsqueda o la categoría."}</p></div>}
  </main>;
}
