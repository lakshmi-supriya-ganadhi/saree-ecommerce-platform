"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartItem, Saree } from "@/lib/types";

type CartContextValue = {
  items: CartItem[];
  count: number; // total quantity across items
  total: number; // total price in ₹
  add: (saree: Saree) => void;
  remove: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "saree_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load persisted cart once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  // Persist on every change (after initial load).
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  function add(saree: Saree) {
    setItems((prev) => {
      const existing = prev.find((i) => i.saree.id === saree.id);
      if (existing) {
        return prev.map((i) =>
          i.saree.id === saree.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { saree, quantity: 1 }];
    });
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.saree.id !== id));
  }

  function setQuantity(id: string, quantity: number) {
    if (quantity <= 0) return remove(id);
    setItems((prev) =>
      prev.map((i) => (i.saree.id === id ? { ...i, quantity } : i)),
    );
  }

  function clear() {
    setItems([]);
  }

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((n, i) => n + i.quantity, 0);
    const total = items.reduce((n, i) => n + i.quantity * i.saree.price, 0);
    return { items, count, total, add, remove, setQuantity, clear };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
