import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, admin = false }) {
  const { user, profile, loading, profileError, refreshProfile } = useAuth();

  if (loading) return <main className="page container"><p>Cargando tu cuenta...</p></main>;
  if (!user) return <Navigate to="/cuenta" replace />;

  if (admin && profileError) {
    return (
      <main className="page container" style={{ maxWidth: 760, paddingTop: 48, paddingBottom: 64 }}>
        <p className="eyebrow">SS22.WWW · ADMIN</p>
        <h1>No pudimos cargar tu perfil<span>.</span></h1>
        <p>Tu sesión está iniciada, pero la tienda no pudo verificar los permisos de administrador. No cambiamos tus datos ni tu cuenta.</p>
        <p role="alert" style={{ overflowWrap: "anywhere", padding: 16, background: "#f7f3ee", border: "1px solid #e5ddd3", borderRadius: 8 }}>
          <strong>Detalle:</strong> {profileError}
        </p>
        <button className="button button-dark" type="button" onClick={() => void refreshProfile()}>Volver a comprobar</button>
      </main>
    );
  }

  if (admin && !profile) {
    return (
      <main className="page container" style={{ maxWidth: 760, paddingTop: 48, paddingBottom: 64 }}>
        <p className="eyebrow">SS22.WWW · ADMIN</p>
        <h1>Perfil pendiente de verificar<span>.</span></h1>
        <p>La sesión está iniciada, pero todavía no hay un perfil disponible para comprobar los permisos.</p>
        <button className="button button-dark" type="button" onClick={() => void refreshProfile()}>Volver a comprobar</button>
      </main>
    );
  }

  if (admin && profile.role !== "admin") {
    return (
      <main className="page container" style={{ maxWidth: 760, paddingTop: 48, paddingBottom: 64 }}>
        <p className="eyebrow">SS22.WWW · ADMIN</p>
        <h1>Tu cuenta no tiene rol administrador<span>.</span></h1>
        <p>La web cargó un perfil, pero el rol que recibió es <strong>{profile.role || "sin rol"}</strong>. Por seguridad no se muestra el panel de administración.</p>
        <p>Si en el SQL Editor de Supabase figura <strong>admin</strong>, comprobá que la variable <code>VITE_SUPABASE_URL</code> de Vercel apunte a ese mismo proyecto y volvé a iniciar sesión.</p>
        <button className="button button-dark" type="button" onClick={() => void refreshProfile()}>Volver a comprobar</button>
      </main>
    );
  }
  return children;
}
