import { Link } from "react-router-dom";
import { ArrowUpRight, Truck, ShieldCheck, CreditCard } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getProducts } from "../lib/products";
import ProductCard from "../components/ProductCard";
import { getActivePromotions } from "../lib/promotions";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  useEffect(() => { getProducts().then(setProducts).catch(console.error); getActivePromotions().then(setPromotions).catch(() => setPromotions([])); }, []);
  const latest = products.slice(0, 4);
  const featured = useMemo(() => products.filter(p => p.featured).slice(0, 4), [products]);
  const categories = useMemo(() => [...new Set(products.map(p => p.category).filter(Boolean))].slice(0, 5), [products]);
  const categoryProducts = categories.map(category => ({ category, product: products.find(p => p.category === category && p.image_url) })).filter(x => x.product);

  return <main className="store-home">
    <section className="campaign-hero">
      <div className="campaign-image campaign-image-logo">
        <img className="campaign-spinning-logo" src="/ss22-logo-original.png" alt="SS22.WWW" />
        <div className="campaign-copy">
          <span className="campaign-kicker">SS22.WWW </span>
          <h1>Vestite<br/><em>a tu manera.</em></h1>
          <p>Prendas seleccionadas. Nuevos ingresos y piezas para todos los días.</p>
          <Link to="/tienda" className="campaign-button">EXPLORAR TIENDA <ArrowUpRight size={17}/></Link>
        </div>
        <span className="campaign-index">NUEVA COLECCIÓN / 2026</span>
      </div>
    </section>

    <section className="store-benefits container">
      <div><Truck/><span><b>Envíos a todo el país</b><small>Elegí cómo recibir tu pedido</small></span></div>
      <div><ShieldCheck/><span><b>Compra segura</b><small>Seguimiento desde tu cuenta</small></span></div>
      <div><CreditCard/><span><b>Pago coordinado</b><small>Transferencia bancaria</small></span></div>
    </section>

    <section className="ss22-promo-strip container ss22-promo-two-items">
      <div className="ss22-promo-heading"><span className="store-overline">BENEFICIO AUTOMÁTICO</span><h2>10% OFF llevando 2 prendas o más</h2></div>
      <p>Se aplica automáticamente en el carrito y al confirmar tu pedido. No necesitás ingresar ningún cupón.</p>
    </section>

    {(promotions.length > 0) && <section className="ss22-promo-strip container">
      <div className="ss22-promo-heading"><span className="store-overline">BENEFICIOS ACTIVOS</span><h2>Promociones SS22</h2></div>
      <div className="ss22-promo-list">{promotions.map(p => <article className="ss22-promo-item" key={p.id}>
        <strong>{p.name || "Promoción SS22"}</strong>
        <span>{Number(p.discount_percent) > 0 ? `${p.discount_percent}% OFF` : ""}{Number(p.discount_percent) > 0 && p.free_shipping ? " · " : ""}{p.free_shipping ? "ENVÍO GRATIS" : ""}</span>
        <small>{p.target_type === "category" ? `En ${p.target_value}` : p.target_type === "product" ? "En prendas seleccionadas" : "En toda la tienda"}</small>
      </article>)}</div>
    </section>}

    <section className="ss22-trust-panel container">
      <div><span className="store-overline">COMPRÁ CON CONFIANZA</span><h2>Conocé cada detalle antes de elegir.</h2><p>Todas nuestras prendas son nuevas, sin uso y se entregan con su bolsa. Si querés ver más fotos, consultar la calidad o pedir videos reales, escribinos por nuestras redes.</p></div>
      <div className="ss22-trust-actions"><a href="https://www.instagram.com/ss22.www/" target="_blank" rel="noreferrer">VER INSTAGRAM ↗</a><a href="https://wa.me/5491154154628?text=Hola%20SS22%2C%20quiero%20ver%20mas%20fotos%20o%20videos%20de%20una%20prenda." target="_blank" rel="noreferrer">CONSULTAR POR WHATSAPP ↗</a><Link to="/preguntas">ENVÍOS, CAMBIOS Y DEVOLUCIONES ↗</Link><a href="https://wa.me/5491154154628?text=Hola%20SS22%2C%20quiero%20ejercer%20mi%20derecho%20de%20arrepentimiento." target="_blank" rel="noreferrer">SOLICITAR ARREPENTIMIENTO ↗</a></div>
    </section>

    {categoryProducts.length > 0 && <section className="store-categories container">
      <div className="store-section-head"><div><span className="store-overline">ENCONTRÁ TU ESTILO</span><h2>Comprar por categoría</h2></div><Link to="/tienda">VER TODO <ArrowUpRight size={15}/></Link></div>
      <div className="category-tiles">{categoryProducts.map(({category, product}, i) => <Link key={category} to={`/tienda?categoria=${encodeURIComponent(category)}`} className={`category-tile category-tile-${i % 3}`}><img src={product.image_url} alt={category}/><span>{category}<ArrowUpRight size={16}/></span></Link>)}</div>
    </section>}

    <section className="store-products container">
      <div className="store-section-head"><div><span className="store-overline">LO ÚLTIMO EN SS22</span><h2>Nuevos ingresos</h2></div><Link to="/tienda">VER CATÁLOGO <ArrowUpRight size={15}/></Link></div>
      {latest.length ? <div className="product-marquee"><div className="product-marquee-track">{[...latest, ...latest].map((p, i) => <div className="product-marquee-item" key={`${p.id}-${i}`}><ProductCard product={p} promotions={promotions}/></div>)}</div></div> : <p className="store-empty">Próximamente vas a encontrar nuevas prendas acá.</p>}
    </section>

    {featured.length > 0 && <section className="store-featured"><div className="container store-products"><div className="store-section-head"><div><span className="store-overline">SELECCIÓN DE LA CASA</span><h2>Novedades</h2></div><Link to="/tienda">DESCUBRIR MÁS <ArrowUpRight size={15}/></Link></div><div className="product-grid store-product-grid">{featured.map(p => <ProductCard key={p.id} product={p} promotions={promotions}/>)}</div></div></section>}

    <section className="store-signoff container"><img src="/ss22-logo-original.png" alt="SS22.WWW"/><div><span>SS22.WWW · INDUMENTARIA</span><h2>Encontrá eso que estabas buscando.</h2></div><Link to="/tienda" aria-label="Ver tienda"><ArrowUpRight/></Link></section>
  </main>;
}
