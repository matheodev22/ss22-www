import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useEffect, useState } from "react";
import { getProducts } from "../lib/products";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);
  const video = import.meta.env.VITE_HOME_VIDEO_URL || "/media/nas.mp4";

  useEffect(() => {
    getProducts().then(setProducts).catch(console.error);
  }, []);

  const featured = products.filter(p => p.featured);

  return (
    <main className="home-editorial">
      <section className="hero container">
        <div className="hero-meta">
          <span>BUENOS AIRES, ARGENTINA</span>
          <span>SS22.WWW — INDEPENDENT CLOTHING</span>
        </div>

        <div className="hero-layout">
          <div className="hero-copy">
            <p className="eyebrow light">NO SEGUIMOS TENDENCIAS. ELEGIMOS LO QUE NOS REPRESENTA.</p>
            <h1>WEAR<br /><em>YOUR</em><br />IDENTITY<span className="hero-period">.</span></h1>
            <div className="hero-copy-bottom">
              <p className="hero-description">Una selección de prendas para todos los días. Encontrá piezas que hablen por vos.</p>
              <Link to="/tienda" className="hero-cta">
                <span>EXPLORAR LA TIENDA</span><ArrowUpRight size={18} />
              </Link>
            </div>
          </div>

          <div className="hero-art">
            <video
              className="hero-video"
              src={video}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/brand-cover.svg"
              aria-label="Video de campaña SS22.WWW"
            />
            <div className="hero-video-shade" />
            <div className="hero-video-top"><span>CAMPAIGN FILM</span><span>001 / 026</span></div>
            <img className="hero-video-logo" src="/ss22-logo-original.png" alt="SS22" />
            <div className="hero-video-bottom"><span>SS22 — WWW</span><span>BUILT FOR EVERYDAY</span></div>
          </div>
        </div>

        <div className="hero-footer">
          <span>INDEPENDENT STYLE / ARGENTINA</span>
          <span className="hero-scroll">SCROLL TO EXPLORE <ArrowDownRight size={14} /></span>
          <span>EST. 2022</span>
        </div>
      </section>

      <section className="section container home-products">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE SS22 SELECTION / 01</p>
            <h2>Elegidos para vos<span>.</span></h2>
          </div>
          <Link className="text-link" to="/tienda">VER TODA LA TIENDA <ArrowUpRight size={16}/></Link>
        </div>
        <div className="product-grid">{(featured.length ? featured : products).slice(0,4).map(p => <ProductCard key={p.id} product={p}/>)}</div>
        {!products.length && <p className="empty-hint">Estamos preparando la próxima selección.</p>}
      </section>

      <section className="how-section">
        <div className="container how-inner">
          <div><p className="eyebrow light">HOW TO SHOP / SS22</p><h2>Elegí.<br/><em>Comprá.</em><br/>Recibí.</h2></div>
          <div className="how-steps">
            <p><b>01 / ELEGÍ</b><span>Encontrá tu prenda y seleccioná talle y color.</span></p>
            <p><b>02 / CONFIRMÁ</b><span>Completá tus datos y coordinamos el costo de envío.</span></p>
            <p><b>03 / RECIBÍ</b><span>Pagá por transferencia una vez confirmado el total y seguí tu pedido.</span></p>
          </div>
        </div>
      </section>

      <section className="section container newsletter">
        <p className="eyebrow">SS22.WWW — ENDLESS EVERYDAY</p>
        <h2>Tu estilo, tus reglas.</h2>
        <p>Explorá todas las prendas disponibles.</p>
        <Link to="/tienda" className="button button-dark">IR A LA TIENDA <ArrowUpRight size={17}/></Link>
      </section>
    </main>
  );
}
