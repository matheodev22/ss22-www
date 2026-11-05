import { Link } from "react-router-dom";
import { ArrowUpRight, Truck, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { getProducts } from "../lib/products";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts().then(setProducts).catch(console.error);
  }, []);

  const featured = products.filter((product) => product.featured);
  const newItems = products.slice(0, 4);
  const featuredItems = (featured.length ? featured : products).slice(0, 4);
  const categories = [...new Set(products.map((product) => product.category).filter(Boolean))].slice(0, 6);

  return (
    <main className="ss22-home">
      <section className="ss22-hero">
        <div className="ss22-hero-top">
          <span>BUENOS AIRES · ARGENTINA</span>
          <span>INDUMENTARIA SELECCIONADA</span>
        </div>
        <div className="ss22-hero-center">
          <img src="/ss22-logo-original.png" alt="SS22.WWW" className="ss22-main-logo" />
          <p>Prendas seleccionadas. Identidad propia.</p>
          <Link to="/tienda" className="ss22-main-link">EXPLORAR TIENDA <ArrowUpRight size={16} /></Link>
        </div>
        <div className="ss22-hero-bottom">
          <span>STREETWEAR & CULTURA</span>
          <span>ENVÍOS A TODO EL PAÍS</span>
          <span>SS22.WWW</span>
        </div>
      </section>

      <div className="ss22-benefits">
        <span><Truck size={15} /> ENVÍOS A TODO EL PAÍS</span>
        <i />
        <span><ShieldCheck size={15} /> COMPRA SEGURA</span>
        <i />
        <span>STOCK LIMITADO</span>
      </div>

      {categories.length > 0 && (
        <section className="ss22-categories container">
          <div className="ss22-section-label"><span>01 / CATEGORÍAS</span><span>SS22.WWW</span></div>
          <div className="ss22-category-list">
            {categories.map((category) => (
              <Link key={category} to="/tienda">{category}<ArrowUpRight size={15} /></Link>
            ))}
            <Link to="/tienda" className="ss22-category-all">VER TODO <ArrowUpRight size={15} /></Link>
          </div>
        </section>
      )}

      <section className="ss22-products-section container">
        <div className="ss22-section-heading">
          <div><span className="ss22-kicker">02 / RECIÉN LLEGADO</span><h2>Novedades</h2></div>
          <Link to="/tienda">VER TODAS <ArrowUpRight size={16} /></Link>
        </div>
        <div className="product-grid ss22-product-grid">
          {newItems.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
        {!products.length && <p className="ss22-empty">Próximamente nuevas prendas.</p>}
      </section>

      {featuredItems.length > 0 && (
        <section className="ss22-products-section ss22-featured-section">
          <div className="container">
            <div className="ss22-section-heading">
              <div><span className="ss22-kicker">03 / SELECCIÓN SS22</span><h2>Destacados</h2></div>
              <Link to="/tienda">VER CATÁLOGO <ArrowUpRight size={16} /></Link>
            </div>
            <div className="product-grid ss22-product-grid">
              {featuredItems.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </div>
        </section>
      )}

      <section className="ss22-bottom-cta container">
        <img src="/ss22-logo-original.png" alt="SS22.WWW" />
        <div><span>SS22.WWW — BUENOS AIRES</span><h2>Encontrá tu próxima prenda.</h2></div>
        <Link to="/tienda" aria-label="Ir a la tienda"><ArrowUpRight size={22} /></Link>
      </section>
    </main>
  );
}
