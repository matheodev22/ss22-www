
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({
  children,
  admin = false,
}) {
  const {
    user,
    profile,
    loading,
    profileError,
    refreshProfile,
  } = useAuth();

  if (loading) {
    return (
      <main className="page container">
        <p>Cargando tu cuenta...</p>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/cuenta" replace />;
  }

  // No mostrar el panel hasta poder verificar el perfil.
  if (admin && (profileError || !profile)) {
    return (
      <main
        className="page container"
        style={{
          maxWidth: 760,
          paddingTop: 48,
          paddingBottom: 64,
        }}
      >
        <p className="eyebrow">SS22.WWW · ADMIN</p>

        <h1>
          No pudimos verificar tu perfil<span>.</span>
        </h1>

        <p>
          Tu sesión está iniciada, pero necesitamos comprobar
          los permisos de tu cuenta antes de mostrar el panel.
        </p>

        {profileError && (
          <p
            role="alert"
            style={{
              overflowWrap: "anywhere",
              padding: 16,
              background: "#f7f3ee",
              border: "1px solid #e5ddd3",
              borderRadius: 8,
            }}
          >
            <strong>Detalle:</strong> {profileError}
          </p>
        )}

        <button
          className="button button-dark"
          type="button"
          onClick={() => void refreshProfile()}
        >
          Volver a comprobar
        </button>
      </main>
    );
  }

  const role = String(profile?.role ?? "")
    .trim()
    .toLowerCase();

  // Comprobación explícita del rol de administrador.
  if (admin && role !== "admin") {
    return (
      <main
        className="page container"
        style={{
          maxWidth: 760,
          paddingTop: 48,
          paddingBottom: 64,
        }}
      >
        <p className="eyebrow">SS22.WWW · ADMIN</p>

        <h1>
          Tu cuenta no tiene rol administrador<span>.</span>
        </h1>

        <p>
          El perfil cargado tiene el rol{" "}
          <strong>{role || "sin rol"}</strong>. Por seguridad,
          no podemos mostrar el panel de administración.
        </p>

        <button
          className="button button-dark"
          type="button"
          onClick={() => void refreshProfile()}
        >
          Volver a comprobar
        </button>
      </main>
    );
  }

  return children;
}
