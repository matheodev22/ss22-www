import { createContext, useContext, useEffect, useState } from "react";
import { hasSupabase, supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(hasSupabase));

  async function loadProfile(currentUser) {
    if (!currentUser || !hasSupabase) { setProfile(null); return; }
    const { data } = await supabase.from("profiles").select("*").eq("id", currentUser.id).maybeSingle();
    setProfile(data);
  }

  useEffect(() => {
    if (!hasSupabase) { setLoading(false); return; }
    supabase.auth.getSession().then(async ({ data }) => {
      setUser(data.session?.user ?? null);
      await loadProfile(data.session?.user);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setTimeout(() => loadProfile(session?.user), 0);
      setLoading(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function signIn(email, password) {
    if (!hasSupabase) throw new Error("Configurá Supabase para habilitar las cuentas.");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }
  async function signUp(email, password, fullName) {
    if (!hasSupabase) throw new Error("Configurá Supabase para habilitar las cuentas.");
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
    if (error) throw error;
  }
  async function signOut() { if (hasSupabase) await supabase.auth.signOut(); }
  return <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
