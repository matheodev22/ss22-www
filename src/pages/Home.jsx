import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { getProducts } from "../lib/products";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);
  const video = import.meta.env.VITE_HOME_VIDEO_URL || "";
  useEffect(() => { getProducts().then(setProducts).catch(console.error); }, []);
  const featured = products.filter(p => p.featured);
  return <main>
    <section className="hero container">
      <div className="hero-copy">
        <p className="eyebrow light">SS22.WWW · INDUMENTARIA</p>
        <h1>VESTÍ TU<br/><em>IDENTIDAD.</em></h1>
        <p className="hero-description">Ropa seleccionada para todos los días. Encontrá tu próximo favorito.</p>
        <Link to="/tienda" className="button button-light">Ver colección <ArrowUpRight size={17}/></Link>
      </div>
      <div className="hero-art">
        {video ? <video className="hero-video" src={./media/nas.mp4} autoPlay muted loop playsInline poster="/brand-cover.svg"/> :
          <img src="/brand-cover.svg" alt="Colección SS22.WWW"/>}
        <span className="hero-stamp">SS22<br/>WWW</span>
      </div>
      <div className="hero-bottom"><span>SS22.WWW · TIENDA ONLINE</span><span>NUEVA COLECCIÓN</span></div>
    </section>
    <section className="section container">
      <div className="section-heading"><div><p className="eyebrow">SELECCIÓN SS22</p><h2>Prendas destacadas<span>.</span></h2></div><Link className="text-link" to="/tienda">Ver toda la tienda <ArrowUpRight size={16}/></Link></div>
      <div className="product-grid">{(featured.length ? featured : products).slice(0,4).map(p => <ProductCard key={p.id} product={p}/>)}</div>
      {!products.length && <p className="empty-hint">Estamos preparando la próxima selección.</p>}
    </section>
    <section className="how-section"><div className="container how-inner"><div><p className="eyebrow light">COMPRÁ FÁCIL</p><h2>Elegí.<br/><em>Comprá.</em><br/>Recibí.</h2></div><div className="how-steps">
      <p><b>01 / ELEGÍ</b><span>Encontrá tu prenda y seleccioná talle y color.</span></p>
      <p><b>02 / CONFIRMÁ</b><span>Completá tus datos y coordinamos el costo de envío.</span></p>
      <p><b>03 / RECIBÍ</b><span>Pagá por transferencia una vez confirmado el total y seguí tu pedido.</span></p>
    </div></div></section>
    <section className="section container newsletter"><p className="eyebrow">SS22.WWW</p><h2>Tu estilo, tus reglas.</h2><p>Explorá todas las prendas disponibles.</p><Link to="/tienda" className="button button-dark">Ir a la tienda <ArrowUpRight size={17}/></Link></section>
  </main>;
}
