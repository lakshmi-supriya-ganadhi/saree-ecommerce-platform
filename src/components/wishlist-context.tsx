"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ColorVariant, Saree, WishlistItem } from "@/lib/types";

type WishlistContextValue = {
  items: WishlistItem[];
  add: (saree: Saree, variant: ColorVariant) => void;
  remove: (sareeId: string) => void;
  has: (sareeId: string) => boolean;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = "saree_wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as WishlistItem[]);
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
      if (prev.find((i) => i.saree.id === saree.id)) return prev;
      return [...prev, { saree, variant }];
    });
  }

  function remove(sareeId: string) {
    setItems((prev) => prev.filter((i) => i.saree.id !== sareeId));
  }

  function has(sareeId: string) {
    return items.some((i) => i.saree.id === sareeId);
  }

  const value = useMemo<WishlistContextValue>(
    () => ({ items, add, remove, has }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
