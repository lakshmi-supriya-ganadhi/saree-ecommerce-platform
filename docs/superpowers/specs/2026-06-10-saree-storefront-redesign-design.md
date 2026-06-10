# Saree Storefront Redesign — Design Spec

**Date:** 2026-06-10
**Scope:** Extend the existing Next.js MVP with a proper home/about page, signup flow, two-level category filtering, customer ratings, quantity selector on product cards, and stock display.

---

## 1. Data Layer

### Type changes (`src/lib/types.ts`)
Add two fields to `Saree`:
```ts
occasion: "Bridal" | "Casual" | "Party" | "Office";
rating: number; // static float, e.g. 4.3
```

### Seeded data (`src/lib/data.ts`)
Each of the 10 existing sarees gets an `occasion` and `rating` value:

| Saree | Occasion | Rating |
|---|---|---|
| Kanchipuram Bridal Silk | Bridal | 4.8 |
| Banarasi Zari Weave | Bridal | 4.6 |
| Patola Double Ikat | Bridal | 4.9 |
| Mysore Crepe Silk | Casual | 4.2 |
| Tussar Silk Print | Casual | 4.0 |
| Ikat Cotton Handloom | Casual | 3.9 |
| Handloom Linen | Office | 4.1 |
| Chanderi Cotton-Silk | Office | 4.3 |
| Georgette Designer Drape | Party | 4.4 |
| Organza Floral Saree | Party | 4.5 |

---

## 2. Auth / Signup

### New server action (`src/app/actions.ts`)
Add `signupAction` alongside existing `loginAction` and `logoutAction`.

- **Inputs:** name, email, password, confirmPassword (from FormData)
- **Validation:** all fields required, passwords must match, email must not already exist in `USERS`
- **On success:** push new user object to the runtime `USERS` array, call `createSession(user.id)`, redirect to `/dashboard`
- **On failure:** return `{ error: string }`

The `USERS` array in `src/lib/auth.ts` is already a `const` array — `.push()` works fine on it without any change. A helper `registerUser(name, email, password): User | null` is added to `auth.ts` — returns the new user or `null` if the email is taken. Since `actions.ts` runs server-side (`"use server"`), it can import from `auth.ts` (`"server-only"`) without issues.

---

## 3. Pages

### `/` — Home / About page (rewrite)
- Hero section: brand name, tagline, short paragraph about the brand story
- Two CTA buttons side by side: **Log In** and **Sign Up**
- Logged-in users still redirect immediately to `/dashboard`

### `/login` — Login page (minor change)
- Add a "Don't have an account? Sign up →" link below the form card

### `/signup` — Signup page (new)
- Fields: Name, Email, Password, Confirm Password
- Inline error display (same pattern as login page)
- "Already have an account? Log in →" link below the card
- On success: session created, redirect to `/dashboard`

### `/dashboard` — Dashboard (extend)
- Server component fetches sarees + current user, passes sarees to `DashboardClient`
- `DashboardClient` (new client component) owns filter state and renders:
  1. `CategoryFilter` component
  2. Filtered saree grid of `SareeCard` components

### `/cart` — No changes

---

## 4. Components

### `CategoryFilter` (new, `src/components/category-filter.tsx`)
- Client component (`"use client"`)
- **Props:** `sarees: Saree[]`, `selected: { occasion: string; fabric: string }`, `onChange: (occasion, fabric) => void`
- **Row 1:** Occasion pills — All, Bridal, Casual, Party, Office
- **Row 2:** Fabric pills — derived from sarees that match the selected occasion. Resets to "All" when occasion changes.
- Active pill is visually highlighted (rose background)

### `DashboardClient` (new, `src/components/dashboard-client.tsx`)
- Client component (`"use client"`)
- **Props:** `sarees: Saree[]`, `userName: string`
- Holds `occasion` and `fabric` filter state (both default to `"All"`)
- Filters saree list: first by occasion (if not "All"), then by fabric (if not "All")
- Renders `CategoryFilter` + filtered count summary + saree grid

### `SareeCard` (extend, `src/components/saree-card.tsx`)
- Add **star rating** display below the saree name: e.g. `★ 4.3`
- Add **stock badge**: "In Stock" (green) or "Sold Out" (grey) — replaces the existing "Sold out" absolute-positioned badge
- Add **quantity stepper** (− / count / +) above the "Add to cart" button, min 1, disabled when out of stock
- "Add to cart" calls `add(saree)` `quantity` times (existing cart context handles dedup/increment correctly since `add` increments if already in cart)

### `Header` — No changes

---

## 5. Data Flow Summary

```
/dashboard (server)
  └─ getCurrentUser() → redirect if null
  └─ getSarees() → passes sarees[] + user.name to DashboardClient

DashboardClient (client)
  └─ holds { occasion, fabric } state
  └─ renders CategoryFilter (updates state on pill click)
  └─ renders filtered SareeCard grid

SareeCard (client)
  └─ holds local quantity state
  └─ calls useCart().add(saree) × quantity on button click
```

---

## 6. What Is Not Changing
- Cart page and CartView component
- Header component
- Session / cookie mechanism
- `localStorage` cart persistence
- Tailwind CSS v4 setup
- Overall rose/neutral colour palette
