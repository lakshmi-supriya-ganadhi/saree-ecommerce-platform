"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem, ColorVariant, Saree } from "@/lib/types";

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  add: (saree: Saree, variant: ColorVariant) => void;
  remove: (sareeId: string, colorName: string) => void;
  setQuantity: (sareeId: string, colorName: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "saree_cart";

function itemKey(sareeId: string, colorName: string) {
  return `${sareeId}::${colorName}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  function add(saree: Saree, variant: ColorVariant) {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.saree.id === saree.id && i.variant.colorName === variant.colorName,
      );
      if (existing) {
        return prev.map((i) =>
          itemKey(i.saree.id, i.variant.colorName) === itemKey(saree.id, variant.colorName)
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        );
      }
      return [...prev, { saree, variant, quantity: 1 }];
    });
  }

  function remove(sareeId: string, colorName: string) {
    setItems((prev) =>
      prev.filter(
        (i) => itemKey(i.saree.id, i.variant.colorName) !== itemKey(sareeId, colorName),
      ),
    );
  }

  function setQuantity(sareeId: string, colorName: string, quantity: number) {
    if (quantity <= 0) return remove(sareeId, colorName);
    setItems((prev) =>
      prev.map((i) =>
        itemKey(i.saree.id, i.variant.colorName) === itemKey(sareeId, colorName)
          ? { ...i, quantity }
          : i,
      ),
    );
  }

  function clear() {
    setItems([]);
  }

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((n, i) => n + i.quantity, 0);
    const total = items.reduce((n, i) => n + i.quantity * i.saree.price, 0);
    return { items, count, total, add, remove, setQuantity, clear };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
