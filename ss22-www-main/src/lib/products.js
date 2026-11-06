import { supabase, hasSupabase } from "./supabase";

export async function getProducts() {
  if (!hasSupabase) return [];
  const { data, error } = await supabase.from("products").select("*").eq("active", true).order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getProduct(id) {
  if (!hasSupabase) return null;
  const { data, error } = await supabase.from("products").select("*").eq("id", id).eq("active", true).single();
  if (error) throw error;
  return data;
}
