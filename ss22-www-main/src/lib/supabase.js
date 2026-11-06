import { createClient } from "@supabase/supabase-js";

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || "").trim().replace(/^['\"]|['\"]$/g, "");
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim().replace(/^['\"]|['\"]$/g, "");

let projectUrl = "";
let supabaseConfigError = "";

if (rawUrl && anonKey && !rawUrl.includes("TU-PROYECTO")) {
  try {
    const parsed = new URL(rawUrl);
    if (!["https:", "http:"].includes(parsed.protocol)) {
      throw new Error("La URL de Supabase debe comenzar con https://.");
    }
    if (parsed.pathname !== "/" || parsed.search || parsed.hash) {
      throw new Error("En VITE_SUPABASE_URL pegá solamente la URL del proyecto (https://....supabase.co), sin /rest/v1, /auth/v1 ni otras rutas.");
    }
    projectUrl = `${parsed.origin}`;
  } catch (error) {
    supabaseConfigError = error.message || "La URL de Supabase no es válida.";
  }
} else if (rawUrl || anonKey) {
  supabaseConfigError = "Falta configurar VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY con los valores reales del proyecto.";
}

export const hasSupabase = Boolean(projectUrl && anonKey);
export { supabaseConfigError };
export const supabase = hasSupabase ? createClient(projectUrl, anonKey) : null;
