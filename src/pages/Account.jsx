import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Account() {
  const { user, signIn, signUp, signOut } = useAuth();
  const [mode, setMode] = useState("login"); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [name, setName] = useState(""); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e) { e.preventDefault(); setBusy(true); setMessage(""); try { if (mode === "login") await signIn(email, password); else await signUp(email, password, name); setMessage(mode === "login" ? "Sesión iniciada." : "Cuenta creada. Revisá tu correo si se requiere confirmación."); } catch (err) { setMessage(err.message); } finally { setBusy(false); } }
  if (user) return <main className="page container account-card"><p className="eyebrow">MI CUENTA</p><h1>Hola.</h1><p>{user.email}</p><div className="account-actions"><Link className="button button-dark" to="/pedidos">Ver mis pedidos</Link><button className="button button-outline" onClick={signOut}>Cerrar sesión</button></div></main>;
  return <main className="page container account-card"><p className="eyebrow">BIENVENIDO A SS22</p><h1>{mode === "login" ? "Ingresar." : "Crear cuenta."}</h1><form className="form-stack" onSubmit={submit}>{mode === "signup" && <label>Nombre completo<input required value={name} onChange={e => setName(e.target.value)} /></label>}<label>Email<input type="email" required value={email} onChange={e => setEmail(e.target.value)} /></label><label>Contraseña<input type="password" minLength="8" required value={password} onChange={e => setPassword(e.target.value)} /></label><button className="button button-dark full-button" disabled={busy}>{busy ? "Procesando..." : mode === "login" ? "Ingresar" : "Crear cuenta"}</button></form>{message && <p className="notice">{message}</p>}<button className="text-button" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); }}>{mode === "login" ? "¿No tenés cuenta? Registrate" : "Ya tengo cuenta. Ingresar"}</button></main>;
}
