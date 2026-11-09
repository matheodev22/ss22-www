import { Link } from "react-router-dom";
export default function Footer() {
  return <footer className="footer"><div className="container footer-grid">
    <div><Link to="/" className="brand footer-brand"><img className="footer-logo" src="/ss22-logo-original.png" alt="SS22.WWW"/></Link><p>Indumentaria seleccionada.</p></div>
    <div><strong>TIENDA</strong><Link to="/tienda">Ver prendas</Link><Link to="/cuenta">Mi cuenta</Link><Link to="/pedidos">Mis pedidos</Link></div>
    <div><strong>AYUDA</strong><Link to="/preguntas">Preguntas frecuentes</Link><Link to="/preguntas#devoluciones">Cambios y devoluciones</Link><a href="https://www.instagram.com/ss22.www/" target="_blank" rel="noreferrer">Instagram</a><a href="https://wa.me/5491154154628" target="_blank" rel="noreferrer">WhatsApp · 11 5415-4628</a></div>
  </div><div className="container footer-bottom">© {new Date().getFullYear()} SS22.WWW · Todos los derechos reservados.</div></footer>;
}
