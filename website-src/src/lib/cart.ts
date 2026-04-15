import { useState, useEffect } from "react";

export interface CartItem {
  id: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
}

const CART_KEY = "xp-c";

function getStoredCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart-updated"));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(getStoredCart);

  useEffect(() => {
    const handler = () => setItems(getStoredCart());
    window.addEventListener("cart-updated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("cart-updated", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const addItem = (product: { id: string; name: string; size: string; price: number; image: string }) => {
    const current = getStoredCart();
    const existing = current.find((i) => i.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      current.push({ ...product, quantity: 1 });
    }
    saveCart(current);
    setItems(current);
  };

  const removeItem = (id: string) => {
    const current = getStoredCart().filter((i) => i.id !== id);
    saveCart(current);
    setItems(current);
  };

  const updateQuantity = (id: string, quantity: number) => {
    const current = getStoredCart();
    const item = current.find((i) => i.id === id);
    if (item) {
      item.quantity = Math.max(1, quantity);
    }
    saveCart(current);
    setItems(current);
  };

  const clearCart = () => {
    saveCart([]);
    setItems([]);
  };

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return { items, addItem, removeItem, updateQuantity, clearCart, total, count };
}
