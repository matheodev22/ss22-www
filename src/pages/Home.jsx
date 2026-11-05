import { Link } from "react-router-dom";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { getProducts } from "../lib/products";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);
  useEffect(() => { getProducts().then(setProducts).catch(console.error); }, []);
  return <main>
    <section className="hero container">
      <div className="hero-copy"><p className="eyebrow light">ss22.www</p><h1>Prendas<br/><em>Seleccionadas.</em></h1><p className="hero-description">Una selección de prendas para construir tu propio estilo. Comprá por encargo, recibí en casa.</p><Link to="/tienda" className="button button-light">Explorar colección <ArrowUpRight size={17}/></Link></div>
      <div className="hero-art"><img src="https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1400&q=90" alt="Editorial de moda urbana"/><span className="hero-stamp"><br/><br/></span></div>
      <div className="hero-bottom"><span>BUENOS AIRES · ARGENTINA</span><span> </span></div>
    </section>
    <section className="section container"><div className="section-heading"><div><p className="eyebrow">SELECCIÓNADA PARA VOS</p><h2>Selección destacada<span>.</span></h2></div><Link className="text-link" to="/tienda">Ver toda la tienda <ArrowUpRight size={16}/></Link></div>
      <div className="product-grid">{products.filter(p => p.featured).slice(0,3).map(p => <ProductCard key={p.id} product={p}/>)}{products.filter(p => p.featured).length === 0 && products.slice(0,3).map(p => <ProductCard key={p.id} product={p}/>)}</div>
    </section>
    <section id="como-funciona" className="how-section"><div className="container how-inner"><div><p className="eyebrow light">Proceso facil</p><h2>Lo elegís.<br/><em>Y Es tuyo</em></h2></div><div className="how-steps"><p><b>01 / ELEGÍ</b><span>Encontrá tu próxima prenda en nuestra selección.</span></p><p><b>02 / COMPRA</b><span>Pagá el total por transferencia para confirmar tu compra.</span></p><p><b>03 / RECIBÍ</b><span>Seguí el estado de tu pedido desde tu cuenta.</span></p></div></div></section>
    <section className="section container newsletter"><p className="eyebrow">SS22 COMMUNITY</p><h2>Mira todas las prendas</h2><p>Descubrí la selección completa de SS22.WWW.</p><Link to="/tienda" className="button button-dark">Ver colección <ArrowUpRight size={17}/></Link></section>
  </main>;
}
