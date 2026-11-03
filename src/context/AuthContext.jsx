
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  hasSupabase,
  supabase,
  supabaseConfigError,
} from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(hasSupabase));
  const [profileError, setProfileError] = useState("");

  const requestId = useRef(0);

  const loadProfile = useCallback(async (currentUser) => {
    const currentRequest = ++requestId.current;

    setLoading(true);
    setProfile(null);
    setProfileError("");

    if (!hasSupabase) {
      setUser(null);
      setProfile(null);
      setProfileError(
        supabaseConfigError || "Supabase no está configurado."
      );
      setLoading(false);
      return;
    }

    setUser(currentUser ?? null);

    if (!currentUser) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, role")
        .eq("id", currentUser.id)
        .maybeSingle();

      // Ignora las respuestas de consultas anteriores.
      if (currentRequest !== requestId.current) return;

      if (error) {
        setProfile(null);
        setProfileError(
          error.message ||
            "No se pudo consultar el perfil en Supabase."
        );
        return;
      }

      if (!data) {
        setProfile(null);
        setProfileError(
          "No existe un perfil para esta cuenta en public.profiles."
        );
        return;
      }

      // Evita aceptar un perfil que no corresponde al usuario actual.
      if (data.id !== currentUser.id) {
        setProfile(null);
        setProfileError(
          "El perfil recibido no coincide con la cuenta autenticada."
        );
        return;
      }

      setProfile(data);
      setProfileError("");
    } catch (error) {
      if (currentRequest !== requestId.current) return;

      setProfile(null);
      setProfileError(
        error?.message ||
          "Ocurrió un error inesperado al cargar el perfil."
      );
    } finally {
      if (currentRequest === requestId.current) {
        setLoading(false);
      }
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!hasSupabase) {
      setProfile(null);
      setProfileError(
        supabaseConfigError || "Supabase no está configurado."
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    setProfileError("");

    try {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        // Invalida cualquier consulta anterior.
        requestId.current += 1;
        setProfile(null);
        setProfileError(error.message);
        setLoading(false);
        return;
      }

      await loadProfile(data.user ?? null);
    } catch (error) {
      requestId.current += 1;
      setProfile(null);
      setProfileError(
        error?.message || "No se pudo comprobar la sesión."
      );
      setLoading(false);
    }
  }, [loadProfile]);

  useEffect(() => {
    if (!hasSupabase) {
      setLoading(false);
      setProfileError(
        supabaseConfigError ||
          "Faltan las variables de entorno de Supabase."
      );
      return undefined;
    }

    let active = true;
    let authEventVersion = 0;
    let pendingTimer;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      authEventVersion += 1;
      const eventVersion = authEventVersion;

      // Evita ejecutar consultas de datos dentro del callback de Auth.
      clearTimeout(pendingTimer);

      pendingTimer = setTimeout(() => {
        if (!active || eventVersion !== authEventVersion) return;

        void loadProfile(session?.user ?? null);
      }, 0);
    });

    const initialVersion = authEventVersion;

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active || authEventVersion !== initialVersion) return;

        if (error) {
          setProfile(null);
          setProfileError(error.message);
          setLoading(false);
          return;
        }

        void loadProfile(data.session?.user ?? null);
      })
      .catch((error) => {
        if (!active) return;

        setProfile(null);
        setProfileError(
          error?.message || "No se pudo recuperar la sesión."
        );
        setLoading(false);
      });

    return () => {
      active = false;
      clearTimeout(pendingTimer);
      subscription.unsubscribe();
      requestId.current += 1;
    };
  }, [loadProfile]);

  async function signIn(email, password) {
    if (!hasSupabase) {
      throw new Error(
        supabaseConfigError ||
          "Configurá Supabase para habilitar las cuentas."
      );
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  }

  async function signUp(email, password, fullName) {
    if (!hasSupabase) {
      throw new Error(
        supabaseConfigError ||
          "Configurá Supabase para habilitar las cuentas."
      );
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) throw error;
  }

  async function signOut() {
    if (hasSupabase) {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;
    }

    requestId.current += 1;
    setUser(null);
    setProfile(null);
    setProfileError("");
    setLoading(false);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        profileError,
        refreshProfile,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
