import { supabase, hasSupabase } from "./supabase";
import { demoProducts } from "../data/demoProducts";

export async function getProducts() {
  if (!hasSupabase) return demoProducts;
  const { data, error } = await supabase.from("products").select("*").eq("active", true).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getProduct(id) {
  if (!hasSupabase || String(id).startsWith("demo-")) return demoProducts.find(p => p.id === id);
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}
