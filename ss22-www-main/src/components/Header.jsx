import { Link, NavLink } from "react-router-dom";
import { ShoppingBag, Menu, X, ChevronDown, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { getProducts } from "../lib/products";

export default function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    let active = true;
    getProducts().then(products => {
      if (active) setCategories([...new Set(products.map(p => p.category).filter(Boolean))]);
    }).catch(() => {});
    return () => { active = false; };
  }, []);
  return <header className="site-header">
    <div className="topline">
      <img src="/ss22-logo-original.png" alt="" className="topline-logo"/>
      <div className="topline-marquee" aria-label="SS22.WWW · Nuevos ingresos · Envíos a todo el país">
        <div className="topline-track"><span>SS22.WWW <i>·</i> PRENDAS SELECCIONADAS <i>·</i> NUEVOS INGRESOS <i>·</i> ENVÍOS A TODO EL PAÍS <i>·</i> STOCK DISPONIBLE <i>·</i></span><span aria-hidden="true">SS22.WWW <i>·</i> PRENDAS SELECCIONADAS <i>·</i> NUEVOS INGRESOS <i>·</i> ENVÍOS A TODO EL PAÍS <i>·</i> STOCK DISPONIBLE <i>·</i></span></div>
      </div>
      <span className="topline-side">BUENOS AIRES · ARG</span>
    </div>
    <div className="nav-wrap container">
      <button className="icon-button mobile-menu" onClick={() => setOpen(!open)} aria-label={open ? "Cerrar menú" : "Abrir menú"}>{open ? <X/> : <Menu/>}</button>
      <Link to="/" className="brand" aria-label="SS22.WWW inicio"><img className="brand-logo" src="/ss22-logo-original.png" alt="SS22.WWW"/></Link>
      <nav className={open ? "main-nav open" : "main-nav"}>
        <NavLink to="/" onClick={() => setOpen(false)}>Inicio</NavLink>
        <div className="nav-categories"><NavLink to="/tienda" onClick={() => setOpen(false)}>Tienda <ChevronDown size={12}/></NavLink><div className="nav-dropdown">{categories.map(category => <Link key={category} to={`/tienda?categoria=${encodeURIComponent(category)}`} onClick={() => setOpen(false)}>{category}</Link>)}</div></div>
        <NavLink to="/preguntas" onClick={() => setOpen(false)}>Preguntas frecuentes</NavLink>
      </nav>
      <div className="nav-actions"><Link className="nav-account" to="/cuenta"><UserRound size={18}/><span>Mi cuenta</span></Link><Link to="/carrito" className="cart-link" aria-label="Carrito"><ShoppingBag size={19}/><span>{count}</span></Link></div>
    </div>
  </header>;
}
