# Saree Storefront Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add home page enhancements (latest collection, offers, footer), a dedicated account page (profile, orders, wishlist, saved addresses), saree color variants with real Unsplash images, and a wishlist heart on every saree card.

**Architecture:** All new data lives in `src/lib/` following existing patterns. Color variants replace the flat `color`/`image` fields on `Saree`. Cart and wishlist contexts are updated to carry the selected `ColorVariant`. The account page follows the server-component-fetches / client-component-renders split already established by the dashboard.

**Tech Stack:** Next.js 16 App Router, React 19 (`useActionState`, `useTransition`), TypeScript, Tailwind CSS v4, in-memory data/auth — no test suite, use `npx tsc --noEmit` per task and `npm run build` at the end.

---

## File Map

| Action | File | Purpose |
|---|---|---|
| Modify | `src/lib/types.ts` | Add `ColorVariant`, `WishlistItem`, `Order`, `Address`; update `Saree`, `CartItem` |
| Create | `src/lib/offers.ts` | 3 static offer banners |
| Create | `src/lib/user-store.ts` | Runtime store: orders (seeded) + addresses (mutable) |
| Modify | `src/lib/data.ts` | Replace `color`/`image` with `variants[]` + Unsplash URLs |
| Modify | `src/lib/auth.ts` | Add `updateUserName()` |
| Modify | `src/app/actions.ts` | Add `updateProfileAction`, `addAddressAction` |
| Create | `src/components/wishlist-context.tsx` | Wishlist React context + localStorage |
| Modify | `src/components/cart-context.tsx` | `add(saree, variant)` new signature; dedup by `id-colorName` |
| Create | `src/components/footer.tsx` | Help center, contact, about columns |
| Modify | `src/app/layout.tsx` | Add `WishlistProvider` + `<Footer />` |
| Modify | `src/app/page.tsx` | Add latest collection strip + offers section |
| Modify | `src/components/header.tsx` | Replace "Hi, name" with avatar icon → `/account` |
| Create | `src/components/account-client.tsx` | 4-tab account UI (Profile, Orders, Wishlist, Addresses) |
| Create | `src/app/account/page.tsx` | Protected server component; fetches user + orders + addresses |
| Modify | `src/components/saree-card.tsx` | Real image, color swatches, wishlist heart, variant-aware cart |
| Modify | `src/components/cart-view.tsx` | Show variant color name; use `variant.hex` for swatch |

---

## Task 1: Update types

**Files:**
- Modify: `src/lib/types.ts`

- [ ] **Step 1: Replace `src/lib/types.ts`**

```ts
export type Occasion = "Bridal" | "Casual" | "Party" | "Office";

export type ColorVariant = {
  colorName: string;
  hex: string;
  image: string;
  inStock: boolean;
};

export type Saree = {
  id: string;
  name: string;
  fabric: string;
  region: string;
  price: number;
  variants: ColorVariant[];
  description: string;
  inStock: boolean;
  occasion: Occasion;
  rating: number;
};

export type User = {
  id: string;
  name: string;
  email: string;
};

export type CartItem = {
  saree: Saree;
  variant: ColorVariant;
  quantity: number;
};

export type WishlistItem = {
  saree: Saree;
  variant: ColorVariant;
};

export type Order = {
  id: string;
  date: string;
  items: { name: string; variant: string; quantity: number; price: number }[];
  total: number;
  status: "Delivered" | "Processing" | "Shipped";
};

export type Address = {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  pincode: string;
  state: string;
};
```

- [ ] **Step 2: Verify — expect errors only in data.ts (missing variants)**

```bash
npx tsc --noEmit 2>&1 | grep -v "data.ts" | head -20
```

Expected: no errors outside `data.ts`.

---

## Task 2: Create offers data

**Files:**
- Create: `src/lib/offers.ts`

- [ ] **Step 1: Create `src/lib/offers.ts`**

```ts
export type Offer = {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  bgColor: string;
  accentColor: string;
  borderColor: string;
};

export const OFFERS: Offer[] = [
  {
    id: "monsoon-sale",
    badge: "LIMITED TIME",
    title: "Monsoon Sale",
    subtitle: "Up to 20% off on all silk sarees this season.",
    bgColor: "bg-rose-50 dark:bg-rose-950/30",
    accentColor: "text-rose-700 dark:text-rose-300",
    borderColor: "border-rose-200 dark:border-rose-800",
  },
  {
    id: "free-shipping",
    badge: "ALWAYS ON",
    title: "Free Shipping",
    subtitle: "On all orders above ₹5,000 — delivered to your door.",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    accentColor: "text-amber-700 dark:text-amber-300",
    borderColor: "border-amber-200 dark:border-amber-800",
  },
  {
    id: "festive-edit",
    badge: "NEW ARRIVALS",
    title: "Festive Edit",
    subtitle: "Diwali collection is here — handpicked for the season.",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    accentColor: "text-purple-700 dark:text-purple-300",
    borderColor: "border-purple-200 dark:border-purple-800",
  },
];
```

---

## Task 3: Create user store

**Files:**
- Create: `src/lib/user-store.ts`

- [ ] **Step 1: Create `src/lib/user-store.ts`**

```ts
import "server-only";
import type { Order, Address } from "./types";

const MOCK_ORDERS: Record<string, Order[]> = {
  u1: [
    {
      id: "ORD-2026-001",
      date: "2026-05-15",
      items: [
        { name: "Kanchipuram Bridal Silk", variant: "Crimson Red", quantity: 1, price: 18999 },
      ],
      total: 18999,
      status: "Delivered",
    },
    {
      id: "ORD-2026-002",
      date: "2026-06-01",
      items: [
        { name: "Banarasi Zari Weave", variant: "Gold", quantity: 1, price: 15499 },
        { name: "Chanderi Cotton-Silk", variant: "Pink", quantity: 2, price: 9998 },
      ],
      total: 25497,
      status: "Processing",
    },
  ],
};

const addressStore = new Map<string, Address[]>();

export function getOrders(userId: string): Order[] {
  return MOCK_ORDERS[userId] ?? [];
}

export function getAddresses(userId: string): Address[] {
  return addressStore.get(userId) ?? [];
}

export function addAddress(userId: string, address: Address): void {
  const existing = addressStore.get(userId) ?? [];
  addressStore.set(userId, [...existing, address]);
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep -v "data.ts" | head -20
```

Expected: no new errors.

---

## Task 4: Update saree data with color variants and Unsplash images

**Files:**
- Modify: `src/lib/data.ts`

- [ ] **Step 1: Replace `src/lib/data.ts`**

```ts
import type { Saree } from "./types";

const IMG = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=600&fit=crop&q=80`;

const SAREES: Saree[] = [
  {
    id: "kanchi-red",
    name: "Kanchipuram Bridal Silk",
    fabric: "Pure Silk",
    region: "Kanchipuram",
    price: 18999,
    description:
      "Handwoven pure mulberry silk with a contrast zari border and traditional temple motifs.",
    inStock: true,
    occasion: "Bridal",
    rating: 4.8,
    variants: [
      { colorName: "Crimson Red", hex: "#b91c1c", image: IMG("6XZWrSBo5o4"), inStock: true },
      { colorName: "Emerald Green", hex: "#059669", image: IMG("y9HsMX3-mUY"), inStock: true },
      { colorName: "Royal Blue", hex: "#1d4ed8", image: IMG("tjRs987fPfg"), inStock: true },
    ],
  },
  {
    id: "banarasi-gold",
    name: "Banarasi Zari Weave",
    fabric: "Katan Silk",
    region: "Banarasi",
    price: 15499,
    description:
      "Classic Banarasi with intricate gold zari brocade — a timeless wedding heirloom.",
    inStock: true,
    occasion: "Bridal",
    rating: 4.6,
    variants: [
      { colorName: "Gold", hex: "#a16207", image: IMG("K-tVxCdqMLs"), inStock: true },
      { colorName: "Maroon", hex: "#7f1d1d", image: IMG("xTrp1WOq2Do"), inStock: true },
      { colorName: "Ivory", hex: "#d6d3d1", image: IMG("Rm9DL9DmGi4"), inStock: true },
    ],
  },
  {
    id: "mysore-teal",
    name: "Mysore Crepe Silk",
    fabric: "Crepe Silk",
    region: "Mysore",
    price: 7999,
    description:
      "Lightweight, lustrous crepe silk — soft drape for everyday elegance.",
    inStock: true,
    occasion: "Casual",
    rating: 4.2,
    variants: [
      { colorName: "Teal", hex: "#0f766e", image: IMG("dQO-3ud96rQ"), inStock: true },
      { colorName: "Purple", hex: "#7c3aed", image: IMG("wcgCFUi_Zws"), inStock: true },
      { colorName: "Rose", hex: "#e11d48", image: IMG("jNePilPJTjY"), inStock: true },
    ],
  },
  {
    id: "chanderi-pink",
    name: "Chanderi Cotton-Silk",
    fabric: "Chanderi",
    region: "Madhya Pradesh",
    price: 4999,
    description:
      "Sheer Chanderi with delicate buti work and a glossy finish — ideal for daytime functions.",
    inStock: true,
    occasion: "Office",
    rating: 4.3,
    variants: [
      { colorName: "Pink", hex: "#db2777", image: IMG("TytqgMlC7Ps"), inStock: true },
      { colorName: "Mint", hex: "#10b981", image: IMG("A7H3qmJTNJc"), inStock: true },
      { colorName: "Peach", hex: "#fb923c", image: IMG("dCuCMZ9XnHg"), inStock: true },
    ],
  },
  {
    id: "georgette-navy",
    name: "Georgette Designer Drape",
    fabric: "Georgette",
    region: "Surat",
    price: 3499,
    description:
      "Flowy georgette with sequin embellishments — modern party-ready styling.",
    inStock: true,
    occasion: "Party",
    rating: 4.4,
    variants: [
      { colorName: "Navy", hex: "#1e3a8a", image: IMG("v9nCfAKxxx4"), inStock: true },
      { colorName: "Coral", hex: "#f97316", image: IMG("rjgFxE3eARQ"), inStock: true },
      { colorName: "Black", hex: "#171717", image: IMG("8g8JB2ZaZKc"), inStock: true },
    ],
  },
  {
    id: "linen-olive",
    name: "Handloom Linen",
    fabric: "Linen",
    region: "West Bengal",
    price: 2899,
    description:
      "Breathable handloom linen with a subtle slub texture — effortless office wear.",
    inStock: true,
    occasion: "Office",
    rating: 4.1,
    variants: [
      { colorName: "Olive", hex: "#4d7c0f", image: IMG("nDo0JshCZw8"), inStock: true },
      { colorName: "Beige", hex: "#d6d3d1", image: IMG("udCX1mvNFos"), inStock: true },
      { colorName: "Grey", hex: "#6b7280", image: IMG("nSBC88WAklo"), inStock: true },
    ],
  },
  {
    id: "patola-maroon",
    name: "Patola Double Ikat",
    fabric: "Silk",
    region: "Patan, Gujarat",
    price: 24999,
    description:
      "Rare double-ikat Patola, hand-dyed and woven over months — a collector's piece.",
    inStock: false,
    occasion: "Bridal",
    rating: 4.9,
    variants: [
      { colorName: "Maroon", hex: "#7f1d1d", image: IMG("Xqa_NWl4xEY"), inStock: false },
      { colorName: "Indigo", hex: "#3730a3", image: IMG("njVir8eVq1M"), inStock: false },
    ],
  },
  {
    id: "tussar-mustard",
    name: "Tussar Silk Print",
    fabric: "Tussar Silk",
    region: "Bhagalpur",
    price: 6499,
    description:
      "Natural tussar with hand-block prints and a rich golden sheen.",
    inStock: true,
    occasion: "Casual",
    rating: 4.0,
    variants: [
      { colorName: "Mustard", hex: "#ca8a04", image: IMG("gLxAUUHZjAw"), inStock: true },
      { colorName: "Rust", hex: "#c2410c", image: IMG("ohEYtC4TEsg"), inStock: true },
      { colorName: "Sage", hex: "#65a30d", image: IMG("tWkK51TlsdE"), inStock: true },
    ],
  },
  {
    id: "cotton-indigo",
    name: "Ikat Cotton Handloom",
    fabric: "Cotton",
    region: "Pochampally",
    price: 2199,
    description:
      "Geometric Pochampally ikat — durable, comfortable, everyday cotton.",
    inStock: true,
    occasion: "Casual",
    rating: 3.9,
    variants: [
      { colorName: "Indigo", hex: "#3730a3", image: IMG("SiQTqnp-qd8"), inStock: true },
      { colorName: "Terracotta", hex: "#c2410c", image: IMG("1n74YwCkcKU"), inStock: true },
      { colorName: "White", hex: "#f5f5f4", image: IMG("AZz_MHYNzFA"), inStock: true },
    ],
  },
  {
    id: "organza-lavender",
    name: "Organza Floral Saree",
    fabric: "Organza",
    region: "Bengaluru",
    price: 5499,
    description:
      "Crisp organza with digital floral prints and a satin border — light and dreamy.",
    inStock: true,
    occasion: "Party",
    rating: 4.5,
    variants: [
      { colorName: "Lavender", hex: "#7c3aed", image: IMG("i6WNgoMpEjY"), inStock: true },
      { colorName: "Blush", hex: "#fda4af", image: IMG("0RMDcqQMAww"), inStock: true },
      { colorName: "Teal", hex: "#0f766e", image: IMG("2DZmm6QKFQE"), inStock: true },
    ],
  },
];

export function getSarees(): Saree[] {
  return SAREES;
}

export function getSaree(id: string): Saree | undefined {
  return SAREES.find((s) => s.id === id);
}

export function getFeaturedSarees(count = 4): Saree[] {
  return SAREES.filter((s) => s.inStock).slice(0, count);
}
```

- [ ] **Step 2: Type-check — expect clean**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/types.ts src/lib/offers.ts src/lib/user-store.ts src/lib/data.ts
git commit -m "feat: add color variants, offers data, and user store"
```

---

## Task 5: Add updateUserName to auth

**Files:**
- Modify: `src/lib/auth.ts`

- [ ] **Step 1: Add `updateUserName` export to `src/lib/auth.ts`**

Add this function after `registerUser`:

```ts
/** Update a user's display name in-memory. Returns false if userId not found. */
export function updateUserName(userId: string, name: string): boolean {
  const match = USERS.find((u) => u.id === userId);
  if (!match) return false;
  match.name = name.trim();
  return true;
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -10
```

Expected: no errors.

---

## Task 6: Add new server actions

**Files:**
- Modify: `src/app/actions.ts`

- [ ] **Step 1: Replace `src/app/actions.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  authenticate,
  createSession,
  destroySession,
  registerUser,
  updateUserName,
  getCurrentUser,
} from "@/lib/auth";
import { addAddress } from "@/lib/user-store";
import type { Address } from "@/lib/types";

export type LoginState = { error?: string };
export type SignupState = { error?: string };
export type ProfileState = { error?: string; success?: boolean };
export type AddressState = { error?: string; success?: boolean };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Please enter both email and password." };
  const user = authenticate(email, password);
  if (!user) return { error: "Invalid email or password." };
  await createSession(user.id);
  redirect("/dashboard");
}

export async function signupAction(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  if (!name || !email || !password || !confirmPassword) return { error: "All fields are required." };
  if (password !== confirmPassword) return { error: "Passwords do not match." };
  const user = registerUser(name, email, password);
  if (!user) return { error: "An account with this email already exists." };
  await createSession(user.id);
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated." };
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required." };
  const ok = updateUserName(user.id, name);
  if (!ok) return { error: "Could not update profile." };
  revalidatePath("/account");
  return { success: true };
}

export async function addAddressAction(
  _prev: AddressState,
  formData: FormData,
): Promise<AddressState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated." };
  const fields: Omit<Address, "id"> = {
    name: String(formData.get("name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    street: String(formData.get("street") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    pincode: String(formData.get("pincode") ?? "").trim(),
    state: String(formData.get("state") ?? "").trim(),
  };
  if (Object.values(fields).some((v) => !v)) return { error: "All fields are required." };
  addAddress(user.id, { id: `addr-${user.id}-${Date.now()}`, ...fields });
  revalidatePath("/account");
  return { success: true };
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/auth.ts src/app/actions.ts
git commit -m "feat: add updateUserName, updateProfileAction, addAddressAction"
```

---

## Task 7: Create wishlist context

**Files:**
- Create: `src/components/wishlist-context.tsx`

- [ ] **Step 1: Create `src/components/wishlist-context.tsx`**

```tsx
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
    [items],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
```

---

## Task 8: Update cart context for variant-aware add

**Files:**
- Modify: `src/components/cart-context.tsx`

- [ ] **Step 1: Replace `src/components/cart-context.tsx`**

```tsx
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
      prev.filter((i) => itemKey(i.saree.id, i.variant.colorName) !== itemKey(sareeId, colorName)),
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
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: errors only in `saree-card.tsx` and `cart-view.tsx` (they call old `add`/`remove` signatures — fixed in later tasks).

- [ ] **Step 3: Commit**

```bash
git add src/components/wishlist-context.tsx src/components/cart-context.tsx
git commit -m "feat: add wishlist context and update cart for variant-aware add/remove"
```

---

## Task 9: Create footer component

**Files:**
- Create: `src/components/footer.tsx`

- [ ] **Step 1: Create `src/components/footer.tsx`**

```tsx
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-12 sm:grid-cols-3">
        {/* Help Center */}
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Help Center
          </h3>
          <ul className="flex flex-col gap-2 text-sm text-neutral-600 dark:text-neutral-300">
            {[
              "FAQ",
              "Shipping Policy",
              "Returns & Exchanges",
              "Track Order",
            ].map((item) => (
              <li key={item}>
                <Link href="#" className="hover:text-rose-600 transition-colors">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Contact Us
          </h3>
          <ul className="flex flex-col gap-2 text-sm text-neutral-600 dark:text-neutral-300">
            <li>
              <a href="mailto:support@sareesutra.com" className="hover:text-rose-600 transition-colors">
                support@sareesutra.com
              </a>
            </li>
            <li>+91 98765 43210</li>
            <li>Bengaluru, Karnataka, India</li>
            <li className="pt-1 text-xs text-neutral-400">Mon–Sat, 10am–6pm IST</li>
          </ul>
        </div>

        {/* About */}
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            About SareeSutra
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Curating authentic handwoven sarees from master weavers across India
            since 2020. Every piece tells a story.
          </p>
          <div className="mt-4 flex gap-4 text-sm">
            <a href="#" className="text-neutral-500 hover:text-rose-600 transition-colors">Instagram</a>
            <a href="#" className="text-neutral-500 hover:text-rose-600 transition-colors">Facebook</a>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-100 px-4 py-4 text-center text-xs text-neutral-400 dark:border-neutral-800">
        © 2026 SareeSutra. All rights reserved.
      </div>
    </footer>
  );
}
```

---

## Task 10: Update layout with WishlistProvider and Footer

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Replace `src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart-context";
import { WishlistProvider } from "@/components/wishlist-context";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getCurrentUser } from "@/lib/auth";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SareeSutra — Handwoven Sarees",
  description: "Shop authentic handwoven sarees from across India.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-rose-50/30 dark:bg-neutral-950">
        <CartProvider>
          <WishlistProvider>
            <Header user={user} />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
              {children}
            </main>
            <Footer />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors (existing errors in saree-card/cart-view remain until their tasks).

- [ ] **Step 3: Commit**

```bash
git add src/components/footer.tsx src/app/layout.tsx
git commit -m "feat: add footer component and WishlistProvider to layout"
```

---

## Task 11: Update home page with collection strip and offers

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace `src/app/page.tsx`**

```tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getFeaturedSarees } from "@/lib/data";
import { OFFERS } from "@/lib/offers";
import { formatINR } from "@/lib/format";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const featured = getFeaturedSarees(4);

  return (
    <div className="mx-auto max-w-4xl">
      {/* Hero */}
      <section className="flex flex-col items-center gap-6 py-16 text-center">
        <span className="text-6xl">🥻</span>
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Handwoven sarees,{" "}
          <span className="text-rose-600">delivered.</span>
        </h1>
        <p className="max-w-md text-lg text-neutral-600 dark:text-neutral-400">
          Discover authentic Kanchipuram silks, Banarasi weaves, Chanderi
          cottons and more — curated from master weavers across India.
        </p>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="rounded-lg border border-rose-600 px-6 py-3 font-medium text-rose-600 transition hover:bg-rose-50 dark:hover:bg-neutral-900"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-rose-600 px-6 py-3 font-medium text-white transition hover:bg-rose-700"
          >
            Sign up
          </Link>
        </div>
      </section>

      {/* Latest Collection */}
      <section className="mt-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
            Latest Collection
          </h2>
          <Link
            href="/login"
            className="text-sm font-medium text-rose-600 hover:text-rose-700"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {featured.map((saree) => (
            <Link
              key={saree.id}
              href="/login"
              className="group overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={saree.variants[0].image}
                  alt={saree.name}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-50">
                  {saree.name}
                </p>
                <p className="text-sm font-bold text-rose-600">
                  {formatINR(saree.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Offers */}
      <section className="mt-10">
        <h2 className="mb-4 text-xl font-bold text-neutral-900 dark:text-neutral-50">
          Offers &amp; Promotions
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {OFFERS.map((offer) => (
            <div
              key={offer.id}
              className={`rounded-2xl border p-6 ${offer.bgColor} ${offer.borderColor}`}
            >
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${offer.accentColor} bg-white/60`}
              >
                {offer.badge}
              </span>
              <h3 className={`mt-3 text-lg font-bold ${offer.accentColor}`}>
                {offer.title}
              </h3>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                {offer.subtitle}
              </p>
              <Link
                href="/login"
                className={`mt-4 inline-block text-sm font-semibold ${offer.accentColor} hover:underline`}
              >
                Shop now →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="mt-10 grid gap-6 rounded-2xl border border-rose-100 bg-white p-8 dark:border-neutral-800 dark:bg-neutral-900 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <span className="text-3xl">🧵</span>
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">Master Weavers</h2>
          <p className="text-sm text-neutral-500">
            Every saree is handcrafted by artisans who have perfected their craft over generations.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-3xl">🇮🇳</span>
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">Across India</h2>
          <p className="text-sm text-neutral-500">
            From the silk looms of Kanchipuram to the zari workshops of Varanasi — authentic origin, guaranteed.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-3xl">📦</span>
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">Delivered to You</h2>
          <p className="text-sm text-neutral-500">
            Carefully packaged and shipped to your doorstep, wherever you are.
          </p>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add latest collection strip and offers section to home page"
```

---

## Task 12: Update header with avatar icon

**Files:**
- Modify: `src/components/header.tsx`

- [ ] **Step 1: Replace `src/components/header.tsx`**

```tsx
"use client";

import Link from "next/link";
import type { User } from "@/lib/types";
import { useCart } from "./cart-context";
import { logoutAction } from "@/app/actions";

export function Header({ user }: { user: User | null }) {
  const { count } = useCart();

  const initials = user
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "";

  return (
    <header className="sticky top-0 z-10 border-b border-rose-100 bg-white/90 backdrop-blur dark:border-rose-950 dark:bg-neutral-950/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2">
          <span className="text-2xl">🪡</span>
          <span className="text-lg font-semibold tracking-tight text-rose-800 dark:text-rose-300">
            Saree<span className="text-amber-600">Sutra</span>
          </span>
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-md px-3 py-1.5 font-medium text-neutral-700 hover:bg-rose-50 dark:text-neutral-200 dark:hover:bg-neutral-900"
              >
                Collection
              </Link>
              <Link
                href="/cart"
                className="relative rounded-md px-3 py-1.5 font-medium text-neutral-700 hover:bg-rose-50 dark:text-neutral-200 dark:hover:bg-neutral-900"
              >
                Cart
                {count > 0 && (
                  <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-600 px-1.5 text-xs font-semibold text-white">
                    {count}
                  </span>
                )}
              </Link>
              <Link
                href="/account"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white hover:bg-rose-700"
                aria-label="My account"
                title={user.name}
              >
                {initials}
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-md border border-rose-200 px-3 py-1.5 font-medium text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-neutral-900"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-rose-600 px-4 py-1.5 font-medium text-white hover:bg-rose-700"
            >
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/header.tsx
git commit -m "feat: replace header name text with avatar icon linking to account page"
```

---

## Task 13: Create AccountClient component

**Files:**
- Create: `src/components/account-client.tsx`

- [ ] **Step 1: Create `src/components/account-client.tsx`**

```tsx
"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Address, Order, User } from "@/lib/types";
import { updateProfileAction, addAddressAction } from "@/app/actions";
import { useWishlist } from "./wishlist-context";
import { useCart } from "./cart-context";
import { formatINR } from "@/lib/format";

type Tab = "profile" | "orders" | "wishlist" | "addresses";

const inputClass =
  "rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50";

const STATUS_COLORS: Record<Order["status"], string> = {
  Delivered: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  Processing: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  Shipped: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
};

export function AccountClient({
  user,
  orders,
  addresses,
}: {
  user: User;
  orders: Order[];
  addresses: Address[];
}) {
  const [tab, setTab] = useState<Tab>("profile");
  const router = useRouter();

  const tabs: { id: Tab; label: string }[] = [
    { id: "profile", label: "Profile" },
    { id: "orders", label: "Orders" },
    { id: "wishlist", label: "Wishlist" },
    { id: "addresses", label: "Saved Addresses" },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-neutral-50">
        My Account
      </h1>

      {/* Tab bar */}
      <div className="mb-8 flex gap-1 overflow-x-auto rounded-xl border border-neutral-200 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-900">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
              tab === t.id
                ? "bg-white text-rose-600 shadow-sm dark:bg-neutral-800 dark:text-rose-400"
                : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "profile" && <ProfileTab user={user} onSave={() => router.refresh()} />}
      {tab === "orders" && <OrdersTab orders={orders} />}
      {tab === "wishlist" && <WishlistTab />}
      {tab === "addresses" && <AddressesTab addresses={addresses} onSave={() => router.refresh()} />}
    </div>
  );
}

function ProfileTab({ user, onSave }: { user: User; onSave: () => void }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateProfileAction, {});

  function handleSuccess() {
    if (state.success) { setEditing(false); onSave(); }
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">Profile</h2>
      {!editing ? (
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs text-neutral-500">Name</p>
            <p className="font-medium text-neutral-900 dark:text-neutral-50">{user.name}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Email</p>
            <p className="font-medium text-neutral-900 dark:text-neutral-50">{user.email}</p>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="mt-2 w-fit rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <form action={formAction} onSubmit={handleSuccess} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-neutral-700 dark:text-neutral-300">Name</span>
            <input name="name" defaultValue={user.name} required className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-neutral-700 dark:text-neutral-300">Email (cannot change)</span>
            <input value={user.email} disabled className={`${inputClass} opacity-50`} />
          </label>
          {state.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}
          {state.success && (
            <p className="text-sm text-green-600">Profile updated!</p>
          )}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function OrdersTab({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-neutral-500">No orders yet.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-neutral-900 dark:text-neutral-50">{order.id}</p>
              <p className="text-xs text-neutral-500">{order.date}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[order.status]}`}>
              {order.status}
            </span>
          </div>
          <div className="mt-3 flex flex-col gap-1">
            {order.items.map((item, i) => (
              <p key={i} className="text-sm text-neutral-600 dark:text-neutral-400">
                {item.name} — {item.variant} × {item.quantity}
              </p>
            ))}
          </div>
          <p className="mt-3 text-right font-bold text-neutral-900 dark:text-neutral-50">
            {formatINR(order.total)}
          </p>
        </div>
      ))}
    </div>
  );
}

function WishlistTab() {
  const { items, remove } = useWishlist();
  const { add } = useCart();

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-neutral-500">Your wishlist is empty.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map(({ saree, variant }) => (
        <div
          key={`${saree.id}-${variant.colorName}`}
          className="flex gap-3 rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg">
            <img src={variant.image} alt={saree.name} className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">{saree.name}</p>
            <p className="text-xs text-neutral-500">{variant.colorName} · {saree.fabric}</p>
            <p className="text-sm font-bold text-rose-600">{formatINR(saree.price)}</p>
            <div className="mt-auto flex gap-2">
              <button
                onClick={() => { add(saree, variant); }}
                className="rounded-md bg-rose-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-rose-700"
              >
                Add to cart
              </button>
              <button
                onClick={() => remove(saree.id)}
                className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AddressesTab({ addresses, onSave }: { addresses: Address[]; onSave: () => void }) {
  const [adding, setAdding] = useState(false);
  const [state, formAction, pending] = useActionState(addAddressAction, {});

  if (state.success && adding) {
    setAdding(false);
    onSave();
  }

  return (
    <div className="flex flex-col gap-4">
      {addresses.length === 0 && !adding && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-neutral-500">No saved addresses.</p>
        </div>
      )}

      {addresses.map((addr) => (
        <div
          key={addr.id}
          className="rounded-xl border border-neutral-200 bg-white p-4 text-sm dark:border-neutral-800 dark:bg-neutral-900"
        >
          <p className="font-medium text-neutral-900 dark:text-neutral-50">{addr.name}</p>
          <p className="text-neutral-600 dark:text-neutral-400">{addr.phone}</p>
          <p className="text-neutral-600 dark:text-neutral-400">
            {addr.street}, {addr.city} — {addr.pincode}
          </p>
          <p className="text-neutral-600 dark:text-neutral-400">{addr.state}</p>
        </div>
      ))}

      {adding && (
        <form action={formAction} className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-50">New Address</h3>
          {[
            { name: "name", label: "Full Name", type: "text" },
            { name: "phone", label: "Phone", type: "tel" },
            { name: "street", label: "Street Address", type: "text" },
            { name: "city", label: "City", type: "text" },
            { name: "pincode", label: "Pincode", type: "text" },
            { name: "state", label: "State", type: "text" },
          ].map((f) => (
            <label key={f.name} className="flex flex-col gap-1 text-sm">
              <span className="text-neutral-700 dark:text-neutral-300">{f.label}</span>
              <input name={f.name} type={f.type} required className={inputClass} />
            </label>
          ))}
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save Address"}
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {!adding && (
        <button
          onClick={() => setAdding(true)}
          className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
        >
          + Add New Address
        </button>
      )}
    </div>
  );
}
```

---

## Task 14: Create account page route

**Files:**
- Create: `src/app/account/page.tsx`

- [ ] **Step 1: Create `src/app/account/page.tsx`**

```tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOrders, getAddresses } from "@/lib/user-store";
import { AccountClient } from "@/components/account-client";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const orders = getOrders(user.id);
  const addresses = getAddresses(user.id);

  return <AccountClient user={user} orders={orders} addresses={addresses} />;
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: errors only in `saree-card.tsx` and `cart-view.tsx` — fixed in next tasks.

- [ ] **Step 3: Commit**

```bash
git add src/components/account-client.tsx src/app/account/page.tsx
git commit -m "feat: add account page with profile, orders, wishlist, and addresses tabs"
```

---

## Task 15: Update SareeCard with image, swatches, and wishlist heart

**Files:**
- Modify: `src/components/saree-card.tsx`

- [ ] **Step 1: Replace `src/components/saree-card.tsx`**

```tsx
"use client";

import { useState } from "react";
import type { ColorVariant, Saree } from "@/lib/types";
import { formatINR } from "@/lib/format";
import { useCart } from "./cart-context";
import { useWishlist } from "./wishlist-context";

export function SareeCard({ saree }: { saree: Saree }) {
  const { add } = useCart();
  const { add: wishlistAdd, remove: wishlistRemove, has } = useWishlist();
  const [selected, setSelected] = useState<ColorVariant>(saree.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const wishlisted = has(saree.id);

  function handleAdd() {
    for (let i = 0; i < quantity; i++) add(saree, selected);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  function toggleWishlist() {
    if (wishlisted) wishlistRemove(saree.id);
    else wishlistAdd(saree, selected);
  }

  const stepperBtn =
    "h-7 w-7 rounded-md border border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800";

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
      {/* Image with wishlist heart */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={selected.image}
          alt={`${saree.name} in ${selected.colorName}`}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          onError={(e) => {
            const t = e.currentTarget;
            t.style.display = "none";
            t.parentElement!.style.background = `linear-gradient(135deg, ${selected.hex} 0%, ${selected.hex}99 100%)`;
          }}
        />
        <button
          onClick={toggleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-lg shadow backdrop-blur hover:bg-white"
        >
          {wishlisted ? "♥" : "♡"}
        </button>
        <span className="absolute bottom-3 left-3 rounded-full bg-black/30 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
          {saree.region}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight text-neutral-900 dark:text-neutral-50">
            {saree.name}
          </h3>
          <span className="shrink-0 rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            {saree.fabric}
          </span>
        </div>

        {/* Rating + stock */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-amber-500">★ {saree.rating.toFixed(1)}</span>
          <span
            className={`text-xs font-medium ${
              selected.inStock
                ? "text-green-600 dark:text-green-400"
                : "text-neutral-400 dark:text-neutral-500"
            }`}
          >
            {selected.inStock ? "In Stock" : "Sold Out"}
          </span>
        </div>

        <p className="line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
          {saree.description}
        </p>

        {/* Color swatches */}
        <div className="flex gap-1.5">
          {saree.variants.map((v) => (
            <button
              key={v.colorName}
              onClick={() => { setSelected(v); setQuantity(1); }}
              title={v.colorName}
              aria-label={v.colorName}
              className={`h-6 w-6 rounded-full border-2 transition ${
                selected.colorName === v.colorName
                  ? "border-rose-500 scale-110"
                  : "border-transparent hover:border-neutral-400"
              }`}
              style={{ backgroundColor: v.hex }}
            />
          ))}
        </div>

        {/* Price + stepper + add to cart */}
        <div className="mt-auto flex flex-col gap-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
              {formatINR(saree.price)}
            </span>
            {selected.inStock && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className={stepperBtn}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className={stepperBtn}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={!selected.inStock}
            className="w-full rounded-lg bg-rose-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-neutral-300 dark:disabled:bg-neutral-700"
          >
            {!selected.inStock ? "Unavailable" : added ? "Added ✓" : "Add to cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
```

---

## Task 16: Update cart view for variant-aware display

**Files:**
- Modify: `src/components/cart-view.tsx`

- [ ] **Step 1: Replace `src/components/cart-view.tsx`**

```tsx
"use client";

import Link from "next/link";
import { useCart } from "./cart-context";
import { formatINR } from "@/lib/format";

export function CartView() {
  const { items, total, count, setQuantity, remove, clear } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <span className="text-4xl">🛒</span>
        <h1 className="mt-4 text-xl font-semibold text-neutral-900 dark:text-neutral-50">
          Your cart is empty
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Browse the collection and add a few sarees you love.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-lg bg-rose-600 px-5 py-2.5 font-medium text-white hover:bg-rose-700"
        >
          Shop the collection
        </Link>
      </div>
    );
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
          Your Cart ({count})
        </h1>
        <button
          onClick={clear}
          className="text-sm font-medium text-neutral-500 hover:text-rose-600"
        >
          Clear cart
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {items.map(({ saree, variant, quantity }) => (
          <div
            key={`${saree.id}-${variant.colorName}`}
            className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg">
              <img
                src={variant.image}
                alt={saree.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  const t = e.currentTarget;
                  t.style.display = "none";
                  t.parentElement!.style.background = `linear-gradient(135deg, ${variant.hex}, ${variant.hex}88)`;
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-medium text-neutral-900 dark:text-neutral-50">
                {saree.name}
              </h3>
              <p className="text-sm text-neutral-500">
                {variant.colorName} · {saree.fabric} · {formatINR(saree.price)}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setQuantity(saree.id, variant.colorName, quantity - 1)}
                className="h-7 w-7 rounded-md border border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-6 text-center text-sm font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(saree.id, variant.colorName, quantity + 1)}
                className="h-7 w-7 rounded-md border border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <div className="w-24 text-right font-semibold text-neutral-900 dark:text-neutral-50">
              {formatINR(saree.price * quantity)}
            </div>

            <button
              onClick={() => remove(saree.id, variant.colorName)}
              className="ml-1 text-neutral-400 hover:text-rose-600"
              aria-label="Remove item"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col items-end gap-3 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <div className="flex w-full max-w-xs items-center justify-between text-lg">
          <span className="font-medium text-neutral-600 dark:text-neutral-300">Total</span>
          <span className="font-bold text-neutral-900 dark:text-neutral-50">
            {formatINR(total)}
          </span>
        </div>
        <button
          onClick={() => alert("Checkout is not part of this MVP — coming next! 🧾")}
          className="w-full max-w-xs rounded-lg bg-rose-600 px-5 py-3 font-medium text-white hover:bg-rose-700"
        >
          Proceed to checkout
        </button>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type-check — expect clean**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/saree-card.tsx src/components/cart-view.tsx
git commit -m "feat: add color swatches, real images, and wishlist heart to SareeCard; update CartView for variants"
```

---

## Task 17: Final build verification

- [ ] **Step 1: Run production build**

```bash
npm run build
```

Expected: clean build, all routes listed: `/`, `/login`, `/signup`, `/dashboard`, `/cart`, `/account`.

- [ ] **Step 2: Start dev server and verify manually**

```bash
npm run dev
```

Open http://localhost:3000 and check:

| Page | Check |
|---|---|
| Home `/` | Hero + 4 saree cards in Latest Collection + 3 offer banners + About section + footer |
| Footer | Visible on every page — Help Center, Contact, About columns |
| Login `/login` | Works, "Sign up →" link present |
| Signup `/signup` | Works, redirects to dashboard |
| Dashboard `/dashboard` | Saree cards show real photos; color swatches visible |
| Swatch click | Image changes, stock badge updates |
| Wishlist heart | Click ♡ → fills to ♥; click again → empties |
| Add to cart | Adds selected color + quantity to cart |
| Cart `/cart` | Shows variant color name (e.g. "Crimson Red · Pure Silk") and variant image |
| Header avatar | Shows initials, links to `/account` |
| Account `/account` — Profile | Shows name + email; Edit saves new name |
| Account — Orders | Demo user sees 2 mock orders; new users see empty state |
| Account — Wishlist | Shows wishlisted items; "Add to cart" and "Remove" work |
| Account — Addresses | Add address form saves and shows on refresh |
| Logout | Clears session, redirects to `/login` |

- [ ] **Step 3: Push to GitHub**

```bash
git push origin main
```
