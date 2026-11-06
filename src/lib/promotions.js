import { supabase } from "./supabase";

export async function getActivePromotions() {
  const { data, error } = await supabase
    .from("store_promotions")
    .select("*")
    .eq("active", true);
  if (error) throw error;
  return data || [];
}

export function promotionMatches(promotion, product) {
  if (!promotion || !product) return false;
  if (promotion.target_type === "all") return true;
  if (promotion.target_type === "category") {
    return String(product.category || "").trim().toLowerCase() ===
      String(promotion.target_value || "").trim().toLowerCase();
  }
  if (promotion.target_type === "product") {
    return String(product.id) === String(promotion.target_value);
  }
  return false;
}

export function getProductOffer(product, promotions = []) {
  const matching = promotions.filter(p => promotionMatches(p, product));
  const discount = matching.reduce((best, p) => Math.max(best, Number(p.discount_percent) || 0), 0);
  const freeShipping = matching.some(p => Boolean(p.free_shipping));
  const price = Number(product?.price || 0);
  return {
    discount,
    originalPrice: price,
    price: Math.max(0, Math.round(price * (100 - discount) / 100)),
    freeShipping,
  };
}

export function cartHasFreeShipping(items, promotions = []) {
  return items.some(item => getProductOffer(item.product, promotions).freeShipping);
}
