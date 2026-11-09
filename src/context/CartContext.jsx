import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "ss22-cart";

function readCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(item =>
      item && typeof item === "object" &&
      item.product && typeof item.product === "object" &&
      item.product.id != null &&
      Number.isFinite(Number(item.quantity)) && Number(item.quantity) > 0
    ).map(item => ({
      ...item,
      key: item.key || `${item.product.id}-${item.size || ""}-${item.color || ""}`,
      quantity: Math.min(20, Math.max(1, Math.floor(Number(item.quantity)))),
      size: item.size || "Único",
      color: item.color || "",
    }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);

  function persist(next) {
    setItems(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
    catch (error) { console.warn("No se pudo guardar el carrito localmente:", error); }
  }

  function addItem(product, size = "Único", color = "", quantity = 1) {
    if (!product || product.id == null || product.stock_status === "sold_out") return;
    const safeQuantity = Math.min(20, Math.max(1, Math.floor(Number(quantity) || 1)));
    const key = `${product.id}-${size || "Único"}-${color || ""}`;
    const found = items.find(item => item.key === key);
    persist(found
      ? items.map(item => item.key === key
          ? { ...item, product, quantity: Math.min(20, item.quantity + safeQuantity) }
          : item)
      : [...items, { key, product, size: size || "Único", color: color || "", quantity: safeQuantity }]);
  }

  function updateQuantity(key, quantity) {
    const safeQuantity = Math.floor(Number(quantity));
    if (!Number.isFinite(safeQuantity) || safeQuantity < 1) return removeItem(key);
    persist(items.map(item => item.key === key ? { ...item, quantity: Math.min(20, safeQuantity) } : item));
  }

  function removeItem(key) { persist(items.filter(item => item.key !== key)); }
  function clearCart() { persist([]); }

  const total = items.reduce((sum, item) => sum + Number(item.product.applied_price ?? item.product.price ?? 0) * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const value = useMemo(() => ({ items, total, count, addItem, updateQuantity, removeItem, clearCart }), [items, total, count]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart debe usarse dentro de CartProvider");
  return value;
}
