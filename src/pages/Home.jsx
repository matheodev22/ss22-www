import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowDownRight, Truck, ShieldCheck, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { getProducts } from "../lib/products";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);
  // Reemplazá el archivo /public/media/nas.mp4 por tu video cuando lo tengas.
  const video = import.meta.env.VITE_HOME_VIDEO_URL || "/media/nas.mp4";

  useEffect(() => {
    getProducts().then(setProducts).catch(console.error);
  }, []);

  const featured = products.filter(p => p.featured);
  const shownProducts = (featured.length ? featured : products).slice(0, 4);
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))].slice(0, 5);

  return (
    <main className="home-editorial woundz-inspired">
      <div className="home-marquee" aria-label="SS22 novedades">
        <div className="home-marquee-track">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i}>SS22.WWW <b>✳</b> STREETWEAR SELECCIONADO <b>✳</b> ENVÍOS A TODO EL PAÍS <b>✳</b> STOCK LIMITADO <b>✳</b></span>
          ))}
        </div>
      </div>

      <section className="hero container">
        <div className="hero-meta">
          <span>BUENOS AIRES, ARGENTINA</span>
          <span>SS22.WWW — INDEPENDENT CLOTHING</span>
        </div>
        <div className="hero-layout">
          <div className="hero-copy">
            <p className="eyebrow light">NEW DROP / SS22 SELECTION</p>
            <h1>FIND<br /><em>YOUR</em><br />UNIFORM<span className="hero-period">.</span></h1>
            <div className="hero-copy-bottom">
              <p className="hero-description">Prendas seleccionadas para todos los días. Encontrá esa pieza que cambia todo el outfit.</p>
              <Link to="/tienda" className="hero-cta"><span>COMPRAR AHORA</span><ArrowUpRight size={18} /></Link>
            </div>
          </div>
          <div className="hero-art">
            <video className="hero-video" src={video} autoPlay muted loop playsInline preload="metadata" poster="/brand-cover.svg" aria-label="Video de campaña SS22.WWW" />
            <div className="hero-video-shade" />
            <div className="hero-video-top"><span>SS22 CAMPAIGN</span><span>BUENOS AIRES / 2026</span></div>
            <img className="hero-video-logo" src="/ss22-logo-original.png" alt="SS22" />
            <div className="hero-video-bottom"><span>INDEPENDENT CLOTHING</span><span>BUILT FOR EVERYDAY</span></div>
          </div>
        </div>
        <div className="hero-footer">
          <span>DESIGNED TO BE WORN</span>
          <span className="hero-scroll">SCROLL TO EXPLORE <ArrowDownRight size={14} /></span>
          <span>EST. 2022</span>
        </div>
      </section>

      <section className="service-strip container" aria-label="Beneficios de compra">
        <div><Truck size={19}/><span><b>ENVÍOS A TODO EL PAÍS</b><small>Coordinamos tu entrega</small></span></div>
        <div><ShieldCheck size={19}/><span><b>COMPRA SEGURA</b><small>Atención personalizada</small></span></div>
        <div><RefreshCw size={19}/><span><b>STOCK SELECCIONADO</b><small>Unidades limitadas</small></span></div>
      </section>

      {categories.length > 0 && (
        <section className="category-ribbon container">
          <div><p className="eyebrow">EXPLORE BY CATEGORY</p><h2>Encontrá tu estilo<span>.</span></h2></div>
          <div className="category-ribbon-links">
            {categories.map(category => <Link key={category} to="/tienda">{category}<ArrowUpRight size={14}/></Link>)}
            <Link to="/tienda" className="all-category">VER TODO <ArrowUpRight size={14}/></Link>
          </div>
        </section>
      )}

      <section className="section container home-products">
        <div className="section-heading">
          <div><p className="eyebrow">THE SS22 SELECTION / 01</p><h2>Últimas prendas<span>.</span></h2></div>
          <Link className="text-link" to="/tienda">VER TODO EL CATÁLOGO <ArrowUpRight size={16}/></Link>
        </div>
        <div className="product-grid">{shownProducts.map(p => <ProductCard key={p.id} product={p}/>)}</div>
        {!products.length && <p className="empty-hint">Estamos preparando la próxima selección.</p>}
        <div className="catalog-bottom"><Link to="/tienda" className="catalog-button">EXPLORAR CATÁLOGO <ArrowUpRight size={16}/></Link></div>
      </section>

      <section className="how-section">
        <div className="container how-inner">
          <div><p className="eyebrow light">HOW TO SHOP / SS22</p><h2>Elegí.<br/><em>Comprá.</em><br/>Recibí.</h2></div>
          <div className="how-steps">
            <p><b>01 / ELEGÍ</b><span>Encontrá tu prenda y seleccioná talle y color.</span></p>
            <p><b>02 / CONFIRMÁ</b><span>Completá tus datos y coordinamos el costo de envío.</span></p>
            <p><b>03 / RECIBÍ</b><span>Confirmamos el total antes del pago y te mantenemos al tanto de tu pedido.</span></p>
          </div>
        </div>
      </section>

      <section className="section container newsletter">
        <p className="eyebrow">SS22.WWW — ENDLESS EVERYDAY</p>
        <h2>El próximo fit empieza acá.</h2>
        <p>Explorá todas las prendas disponibles.</p>
        <Link to="/tienda" className="button button-dark">IR A LA TIENDA <ArrowUpRight size={17}/></Link>
      </section>
    </main>
  );
}
