import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "ss22-cart";

function readCart() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);
  const persist = (next) => { setItems(next); localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); };

  function addItem(product, size, color) {
    const key = `${product.id}-${size}-${color}`;
    const found = items.find(item => item.key === key);
    persist(found
      ? items.map(item => item.key === key ? { ...item, quantity: item.quantity + 1 } : item)
      : [...items, { key, product, size, color, quantity: 1 }]);
  }
  function updateQuantity(key, quantity) {
    if (quantity < 1) return removeItem(key);
    persist(items.map(item => item.key === key ? { ...item, quantity } : item));
  }
  function removeItem(key) { persist(items.filter(item => item.key !== key)); }
  function clearCart() { persist([]); }

  const total = items.reduce((sum, item) => sum + Number(item.product.applied_price ?? item.product.price) * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const value = useMemo(() => ({ items, total, count, addItem, updateQuantity, removeItem, clearCart }), [items, total, count]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart debe usarse dentro de CartProvider");
  return value;
}
