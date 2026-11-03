import { Link } from "react-router-dom";
export default function Footer() {
  return <footer className="footer">
    <div className="container footer-grid">
      <div><Link to="/" className="brand footer-brand">SS22<span>.WWW</span></Link><p>Prendas seleccionadas. Compras por encargo.</p></div>
      <div><strong>Explorá</strong><Link to="/tienda">Tienda</Link><Link to="/cuenta">Mi cuenta</Link><Link to="/pedidos">Mis pedidos</Link></div>
      <div><strong>Información</strong><a href="/#como-funciona">Cómo funciona</a><Link to="/preguntas">Preguntas frecuentes</Link><a href="mailto:hola@ss22.example">Contacto</a></div>
    </div>
    <div className="container footer-bottom">© {new Date().getFullYear()} SS22.WWW. Todos los derechos reservados.</div>
  </footer>;
}
