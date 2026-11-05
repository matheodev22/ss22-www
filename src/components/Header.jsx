import { Link, NavLink } from "react-router-dom";
import { ShoppingBag, Menu, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useCart } from "../context/CartContext";

const categories = ["Remeras", "Buzos", "Camperas", "Pantalones", "Accesorios"];

export default function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  return <header className="site-header">
    <div className="topline"><span>SS22.WWW</span><b>PRENDAS SELECCIONADAS · NUEVOS INGRESOS</b><span>ENVÍOS A TODO EL PAÍS</span></div>
    <div className="nav-wrap container">
      <button className="icon-button mobile-menu" onClick={() => setOpen(!open)} aria-label={open ? "Cerrar menú" : "Abrir menú"}>{open ? <X/> : <Menu/>}</button>
      <Link to="/" className="brand" aria-label="SS22.WWW inicio"><img className="brand-logo" src="/ss22-logo-original.png" alt="SS22.WWW"/></Link>
      <nav className={open ? "main-nav open" : "main-nav"}>
        <NavLink to="/" onClick={() => setOpen(false)}>Inicio</NavLink>
        <div className="nav-categories"><NavLink to="/tienda" onClick={() => setOpen(false)}>Tienda <ChevronDown size={12}/></NavLink><div className="nav-dropdown">{categories.map(category => <Link key={category} to={`/tienda?categoria=${encodeURIComponent(category)}`} onClick={() => setOpen(false)}>{category}</Link>)}</div></div>
        <NavLink to="/preguntas" onClick={() => setOpen(false)}>Preguntas frecuentes</NavLink>
      </nav>
      <div className="nav-actions"><Link className="nav-account" to="/cuenta">Mi cuenta</Link><Link to="/carrito" className="cart-link" aria-label="Carrito"><ShoppingBag size={19}/><span>{count}</span></Link></div>
    </div>
  </header>;
}
