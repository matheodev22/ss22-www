import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { hasSupabase, supabase, supabaseConfigError } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(hasSupabase));
  const [profileError, setProfileError] = useState("");
  const syncId = useRef(0);

  const loadProfile = useCallback(async (currentUser) => {
    const requestId = ++syncId.current;
    setLoading(true);
    setProfile(null);
    setProfileError("");

    if (!hasSupabase) {
      setUser(null);
      setLoading(false);
      setProfileError(supabaseConfigError || "Supabase no está configurado.");
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

      if (requestId !== syncId.current) return;
      if (error) {
        setProfile(null);
        setProfileError(error.message || "No se pudo consultar el perfil en Supabase.");
      } else if (!data) {
        setProfile(null);
        setProfileError("La sesión está iniciada, pero no existe un perfil para este usuario en public.profiles.");
      } else {
        setProfile(data);
        setProfileError("");
      }
    } catch (error) {
      if (requestId !== syncId.current) return;
      setProfile(null);
      setProfileError(error?.message || "Ocurrió un error inesperado al cargar el perfil.");
    } finally {
      if (requestId === syncId.current) setLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!hasSupabase) {
      setProfileError(supabaseConfigError || "Supabase no está configurado.");
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      setProfileError(error.message);
      setLoading(false);
      return;
    }
    await loadProfile(data.user);
  }, [loadProfile]);

  useEffect(() => {
    if (!hasSupabase) {
      setLoading(false);
      setProfileError(supabaseConfigError || "Faltan las variables de entorno de Supabase.");
      return undefined;
    }

    let active = true;
    let authEventVersion = 0;
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      authEventVersion += 1;
      const eventVersion = authEventVersion;
      // Diferimos la consulta para no ejecutar consultas de datos dentro del callback de Auth.
      setTimeout(() => {
        if (active && eventVersion === authEventVersion) void loadProfile(session?.user ?? null);
      }, 0);
    });

    const initialVersion = authEventVersion;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active || authEventVersion !== initialVersion) return;
      if (error) {
        setProfileError(error.message);
        setLoading(false);
        return;
      }
      void loadProfile(data.session?.user ?? null);
    }).catch((error) => {
      if (!active) return;
      setProfileError(error?.message || "No se pudo recuperar la sesión.");
      setLoading(false);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
      syncId.current += 1;
    };
  }, [loadProfile]);

  async function signIn(email, password) {
    if (!hasSupabase) throw new Error(supabaseConfigError || "Configurá Supabase para habilitar las cuentas.");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signUp(email, password, fullName) {
    if (!hasSupabase) throw new Error(supabaseConfigError || "Configurá Supabase para habilitar las cuentas.");
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
    if (error) throw error;
  }

  async function signOut() {
    if (hasSupabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
    setUser(null);
    setProfile(null);
    setProfileError("");
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, profileError, refreshProfile, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
