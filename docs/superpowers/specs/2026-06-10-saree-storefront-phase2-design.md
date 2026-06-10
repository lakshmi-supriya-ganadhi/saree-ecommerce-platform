# Saree Storefront Phase 2 — Design Spec

**Date:** 2026-06-10
**Scope:** Home page enhancements (latest collection, offers, footer), account page with profile/orders/wishlist/addresses, saree color variants with real images, and wishlist heart on saree cards.

---

## 1. Data Layer

### Type changes (`src/lib/types.ts`)

```ts
export type ColorVariant = {
  colorName: string;  // e.g. "Crimson Red"
  hex: string;        // e.g. "#b91c1c"
  image: string;      // Unsplash photo URL
  inStock: boolean;
};

export type Saree = {
  id: string;
  name: string;
  fabric: string;
  region: string;
  price: number;
  variants: ColorVariant[];   // replaces flat color + image fields
  description: string;
  inStock: boolean;           // true if at least one variant is inStock
  occasion: Occasion;
  rating: number;
};

export type CartItem = {
  saree: Saree;
  variant: ColorVariant;      // which color was added
  quantity: number;
};

export type WishlistItem = {
  saree: Saree;
  variant: ColorVariant;      // which color was wishlisted
};

export type Order = {
  id: string;
  date: string;               // ISO date string
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

### Updated saree data (`src/lib/data.ts`)
All 10 sarees get `variants: ColorVariant[]` with 2–3 options each. The flat `color` and `image` fields are removed. `inStock` is derived from whether any variant is in stock. Unsplash photo URLs are sourced at implementation time.

**Variant plan:**
| Saree | Variants |
|---|---|
| Kanchipuram Bridal Silk | Crimson Red, Emerald Green, Royal Blue |
| Banarasi Zari Weave | Gold, Maroon, Ivory |
| Mysore Crepe Silk | Teal, Purple, Rose |
| Chanderi Cotton-Silk | Pink, Mint, Peach |
| Georgette Designer Drape | Navy, Coral, Black |
| Handloom Linen | Olive, Beige, Grey |
| Patola Double Ikat | Maroon (out of stock), Indigo (out of stock) |
| Tussar Silk Print | Mustard, Rust, Sage |
| Ikat Cotton Handloom | Indigo, Terracotta, White |
| Organza Floral Saree | Lavender, Blush, Teal |

### New data files

**`src/lib/offers.ts`** — 3 static offer objects:
```ts
export type Offer = {
  id: string;
  badge: string;       // e.g. "LIMITED TIME"
  title: string;       // e.g. "Monsoon Sale"
  subtitle: string;    // e.g. "20% off all silk sarees"
  bgColor: string;     // Tailwind bg class e.g. "bg-rose-50"
  accentColor: string; // Tailwind text class e.g. "text-rose-700"
};
```
Offers:
1. Monsoon Sale — 20% off all silk sarees (rose theme)
2. Free Shipping — on orders above ₹5,000 (amber theme)
3. Festive Edit — New Diwali collection arrived (purple theme)

**`src/lib/account-data.ts`** — mock data for demo user:
- 2 seeded past orders for `u1` (demo user)
- Empty address and wishlist arrays (populated during session via server actions)

**`src/lib/user-store.ts`** — runtime mutable store for per-user session data:
- `getOrders(userId): Order[]`
- `getAddresses(userId): Address[]`
- `addAddress(userId, address): void`

**`src/lib/auth.ts`** gains one new export:
- `updateUserName(userId, name: string): boolean` — finds the user in the USERS array and updates their name in-place. Returns false if user not found.

---

## 2. New Server Actions (`src/app/actions.ts`)

Add alongside existing actions:
- `updateProfileAction(formData)` — updates name for current user in-memory
- `addAddressAction(formData)` — adds address to user's runtime store

---

## 3. Wishlist Context (`src/components/wishlist-context.tsx`)

Same pattern as `cart-context.tsx`:
- Client component (`"use client"`)
- State: `WishlistItem[]`, persisted to `localStorage` under key `saree_wishlist`
- Exports: `WishlistProvider`, `useWishlist()`
- API: `add(saree, variant)`, `remove(sareeId)`, `has(sareeId): boolean`, `items`
- `WishlistProvider` added to `layout.tsx` alongside `CartProvider`

---

## 4. Home Page (`src/app/page.tsx`)

New sections added below the existing hero (logged-out view only — logged-in users still redirect to `/dashboard`):

**Section: Latest Collection**
- Server-rendered
- Shows 4 featured sarees (first 4 from `getSarees()`) in a horizontal scroll row
- Each item: variant image, saree name, price, fabric badge
- "View All →" link to `/login` (since browsing requires login)

**Section: Offers**
- 3 offer cards in a responsive grid (1-col mobile, 3-col desktop)
- Each card: badge chip, title, subtitle, "Shop Now →" link

**Footer** — added to `src/app/layout.tsx` (renders for all pages/users):
- 3 columns: Help Center | Contact Us | About SareeSutra
- Help Center links: FAQ, Shipping Policy, Returns & Exchanges, Track Order (all `href="#"` for now)
- Contact: `support@sareesutra.com`, `+91 98765 43210`, Bengaluru, India
- About: 2-line brand blurb, Instagram + Facebook links (`href="#"`)
- Bottom bar: © 2026 SareeSutra. All rights reserved.

---

## 5. Header (`src/components/header.tsx`)

When logged in, replace "Hi, {name}" text with a **circular avatar** showing the user's initials (e.g. "P" for Priya), rose background, links to `/account`. Logout button stays to the right.

When logged out, header unchanged.

---

## 6. Account Page (`src/app/account/page.tsx` + `src/components/account-client.tsx`)

**`/account`** — protected server component:
- Calls `getCurrentUser()`, redirects to `/login` if null
- Fetches orders and addresses from `user-store.ts`
- Passes all data to `AccountClient`

**`AccountClient`** — client component with 4 tabs:

| Tab | Content |
|---|---|
| **Profile** | Name, email (read-only). "Edit" button reveals inline form with name field. On submit calls `updateProfileAction`. |
| **Orders** | List of orders. Each: order ID, date, status badge, item list, total. Empty state: "No orders yet." |
| **Wishlist** | Grid of `WishlistItem` cards — image, name, variant color, price, "Add to Cart" button, "♡ Remove" button. Uses `useWishlist()`. Empty state: "Your wishlist is empty." |
| **Saved Addresses** | List of saved addresses. "Add New Address" button reveals inline form. On submit calls `addAddressAction`. |

---

## 7. SareeCard (`src/components/saree-card.tsx`)

**New elements:**
- **Image**: `<img>` with `src={selectedVariant.image}`, `object-cover`, fallback to color gradient on error
- **Heart icon** (top-right of image area): `♡` / `♥` toggles wishlist via `useWishlist().add/remove`. Rose when wishlisted.
- **Color swatch row** (below image, above title): small circles (24×24px) filled with `variant.hex`. Active swatch has a 2px rose ring. Clicking changes `selectedVariant` state.
- **Stock** reflects `selectedVariant.inStock`
- **Add to cart** calls `useCart().add(saree, variant)` — updated signature

**Cart context update** (`src/components/cart-context.tsx`):
- `add(saree: Saree, variant: ColorVariant)` — updated signature
- Dedup key: `${saree.id}-${variant.colorName}`
- Cart page shows variant color name: "Kanchipuram Bridal Silk — Crimson Red"

---

## 8. What Is Not Changing
- Login / logout flow
- Session / cookie mechanism
- Dashboard category filtering
- Signup flow
- `src/lib/session.ts`
- Tailwind CSS v4 setup and rose/neutral colour palette
