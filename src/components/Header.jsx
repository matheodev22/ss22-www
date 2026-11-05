import { Link, NavLink } from "react-router-dom";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "../context/CartContext";

export default function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  return <header className="site-header">
    <div className="topline">ENVÍOS A TODO EL PAÍS · NUEVAS PRENDAS DISPONIBLES · SS22.WWW</div>
    <div className="nav-wrap container">
      <button className="icon-button mobile-menu" onClick={() => setOpen(!open)} aria-label="Abrir menú">{open ? <X/> : <Menu/>}</button>
      <Link to="/" className="brand" aria-label="SS22.WWW inicio"><img className="brand-logo" src="/ss22-logo-original.png" alt="SS22.WWW"/></Link>
      <nav className={open ? "main-nav open" : "main-nav"}>
        <NavLink to="/" onClick={() => setOpen(false)}>Inicio</NavLink>
        <NavLink to="/tienda" onClick={() => setOpen(false)}>Tienda</NavLink>
        <NavLink to="/preguntas" onClick={() => setOpen(false)}>Información</NavLink>
      </nav>
      <div className="nav-actions"><Link className="nav-account" to="/cuenta">Mi cuenta</Link><Link to="/carrito" className="cart-link" aria-label="Carrito"><ShoppingBag size={19}/><span>{count}</span></Link></div>
    </div>
  </header>;
}
