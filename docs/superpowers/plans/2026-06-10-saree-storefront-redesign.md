# Saree Storefront Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the existing SareeSutra MVP with a proper home/about page, signup flow, two-level category filtering (occasion → fabric), customer ratings, quantity selector on product cards, and stock availability display.

**Architecture:** The data layer gains two new fields (`occasion`, `rating`) on the `Saree` type; the dashboard page is split into a server component (data fetch + auth) and a new `DashboardClient` client component (filter state + grid). Signup adds a `registerUser` helper to `auth.ts` and a `signupAction` to `actions.ts`, following the exact same pattern as the existing login flow.

**Tech Stack:** Next.js 16 App Router, React 19 (`useActionState`), TypeScript, Tailwind CSS v4, in-memory auth/data

---

## File Map

| Action | File | Purpose |
|---|---|---|
| Modify | `src/lib/types.ts` | Add `occasion` and `rating` to `Saree` |
| Modify | `src/lib/data.ts` | Seed all 10 sarees with new fields |
| Modify | `src/lib/auth.ts` | Add `registerUser()` helper |
| Modify | `src/app/actions.ts` | Add `signupAction` + `SignupState` type |
| Modify | `src/app/page.tsx` | Rewrite as Home/About page with Login + Sign Up CTAs |
| Modify | `src/app/login/page.tsx` | Add "Sign up" link below form |
| Modify | `src/app/dashboard/page.tsx` | Delegate rendering to `DashboardClient` |
| Modify | `src/components/saree-card.tsx` | Add rating, stock badge, quantity stepper |
| Create | `src/app/signup/page.tsx` | Signup form page |
| Create | `src/components/category-filter.tsx` | Two-row occasion + fabric pill filter |
| Create | `src/components/dashboard-client.tsx` | Client component owning filter state + grid |

---

## Task 1: Update Saree type

**Files:**
- Modify: `src/lib/types.ts`

- [ ] **Step 1: Replace the contents of `src/lib/types.ts`**

```ts
// Core domain types. Kept framework-agnostic so the data/auth layer can later
// be swapped for a real DB (e.g. Supabase) without touching the UI.

export type Occasion = "Bridal" | "Casual" | "Party" | "Office";

export type Saree = {
  id: string;
  name: string;
  fabric: string;
  region: string;
  price: number;
  color: string;
  image: string;
  description: string;
  inStock: boolean;
  occasion: Occasion;
  rating: number; // static float, e.g. 4.3
};

export type User = {
  id: string;
  name: string;
  email: string;
};

export type CartItem = {
  saree: Saree;
  quantity: number;
};
```

- [ ] **Step 2: Verify TypeScript sees the new fields**

```bash
cd /Users/lakshmisupriya/Projects/test-project
npx tsc --noEmit 2>&1 | head -20
```

Expected: errors about `data.ts` missing `occasion`/`rating` (correct — next task fixes them). No other errors.

---

## Task 2: Seed occasion and rating into saree data

**Files:**
- Modify: `src/lib/data.ts`

- [ ] **Step 1: Replace the contents of `src/lib/data.ts`**

```ts
import type { Saree } from "./types";

const SAREES: Saree[] = [
  {
    id: "kanchi-red",
    name: "Kanchipuram Bridal Silk",
    fabric: "Pure Silk",
    region: "Kanchipuram",
    price: 18999,
    color: "#b91c1c",
    image: "",
    description:
      "Handwoven pure mulberry silk with a contrast zari border and traditional temple motifs.",
    inStock: true,
    occasion: "Bridal",
    rating: 4.8,
  },
  {
    id: "banarasi-gold",
    name: "Banarasi Zari Weave",
    fabric: "Katan Silk",
    region: "Banarasi",
    price: 15499,
    color: "#a16207",
    image: "",
    description:
      "Classic Banarasi with intricate gold zari brocade — a timeless wedding heirloom.",
    inStock: true,
    occasion: "Bridal",
    rating: 4.6,
  },
  {
    id: "mysore-teal",
    name: "Mysore Crepe Silk",
    fabric: "Crepe Silk",
    region: "Mysore",
    price: 7999,
    color: "#0f766e",
    image: "",
    description:
      "Lightweight, lustrous crepe silk in deep teal — soft drape for everyday elegance.",
    inStock: true,
    occasion: "Casual",
    rating: 4.2,
  },
  {
    id: "chanderi-pink",
    name: "Chanderi Cotton-Silk",
    fabric: "Chanderi",
    region: "Madhya Pradesh",
    price: 4999,
    color: "#db2777",
    image: "",
    description:
      "Sheer Chanderi with delicate buti work and a glossy finish — ideal for daytime functions.",
    inStock: true,
    occasion: "Office",
    rating: 4.3,
  },
  {
    id: "georgette-navy",
    name: "Georgette Designer Drape",
    fabric: "Georgette",
    region: "Surat",
    price: 3499,
    color: "#1e3a8a",
    image: "",
    description:
      "Flowy georgette with sequin embellishments — modern party-ready styling.",
    inStock: true,
    occasion: "Party",
    rating: 4.4,
  },
  {
    id: "linen-olive",
    name: "Handloom Linen",
    fabric: "Linen",
    region: "West Bengal",
    price: 2899,
    color: "#4d7c0f",
    image: "",
    description:
      "Breathable handloom linen with a subtle slub texture — effortless office wear.",
    inStock: true,
    occasion: "Office",
    rating: 4.1,
  },
  {
    id: "patola-maroon",
    name: "Patola Double Ikat",
    fabric: "Silk",
    region: "Patan, Gujarat",
    price: 24999,
    color: "#7f1d1d",
    image: "",
    description:
      "Rare double-ikat Patola, hand-dyed and woven over months — a collector's piece.",
    inStock: false,
    occasion: "Bridal",
    rating: 4.9,
  },
  {
    id: "tussar-mustard",
    name: "Tussar Silk Print",
    fabric: "Tussar Silk",
    region: "Bhagalpur",
    price: 6499,
    color: "#ca8a04",
    image: "",
    description:
      "Natural tussar with hand-block prints and a rich golden sheen.",
    inStock: true,
    occasion: "Casual",
    rating: 4.0,
  },
  {
    id: "cotton-indigo",
    name: "Ikat Cotton Handloom",
    fabric: "Cotton",
    region: "Pochampally",
    price: 2199,
    color: "#3730a3",
    image: "",
    description:
      "Geometric Pochampally ikat in indigo — durable, comfortable, everyday cotton.",
    inStock: true,
    occasion: "Casual",
    rating: 3.9,
  },
  {
    id: "organza-lavender",
    name: "Organza Floral Saree",
    fabric: "Organza",
    region: "Bengaluru",
    price: 5499,
    color: "#7c3aed",
    image: "",
    description:
      "Crisp organza with digital floral prints and a satin border — light and dreamy.",
    inStock: true,
    occasion: "Party",
    rating: 4.5,
  },
];

export function getSarees(): Saree[] {
  return SAREES;
}

export function getSaree(id: string): Saree | undefined {
  return SAREES.find((s) => s.id === id);
}
```

- [ ] **Step 2: Verify no type errors remain from Task 1**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors (or only errors in files not yet updated — none should remain after this step).

- [ ] **Step 3: Commit**

```bash
git add src/lib/types.ts src/lib/data.ts
git commit -m "feat: add occasion and rating fields to Saree type and data"
```

---

## Task 3: Add registerUser helper to auth

**Files:**
- Modify: `src/lib/auth.ts`

- [ ] **Step 1: Replace the contents of `src/lib/auth.ts`**

```ts
import "server-only";
import { cookies } from "next/headers";
import type { User } from "./types";
import { signSession, verifySession } from "./session";

export const SESSION_COOKIE = "saree_session";

const USERS: (User & { password: string })[] = [
  {
    id: "u1",
    name: "Priya",
    email: "demo@saree.shop",
    password: "saree123",
  },
  {
    id: "u2",
    name: "Admin",
    email: "admin@saree.shop",
    password: "admin123",
  },
];

/** Validate credentials. Returns the user (without password) or null. */
export function authenticate(email: string, password: string): User | null {
  const match = USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase().trim(),
  );
  if (!match || match.password !== password) return null;
  const { password: _pw, ...user } = match;
  return user;
}

/**
 * Register a new user at runtime (in-memory only — resets on server restart).
 * Returns the new user or null if the email is already taken.
 */
export function registerUser(
  name: string,
  email: string,
  password: string,
): User | null {
  const normalised = email.toLowerCase().trim();
  if (USERS.find((u) => u.email === normalised)) return null;
  const newUser = {
    id: `u${USERS.length + 1}`,
    name: name.trim(),
    email: normalised,
    password,
  };
  USERS.push(newUser);
  const { password: _pw, ...user } = newUser;
  return user;
}

/** Read the current user from the session cookie, or null if signed out. */
export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const userId = verifySession(store.get(SESSION_COOKIE)?.value);
  if (!userId) return null;
  const match = USERS.find((u) => u.id === userId);
  if (!match) return null;
  const { password: _pw, ...user } = match;
  return user;
}

/** Write the session cookie for a user (called from a server action). */
export async function createSession(userId: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, signSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

/** Clear the session cookie. */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
```

- [ ] **Step 2: Verify no type errors**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

---

## Task 4: Add signupAction server action

**Files:**
- Modify: `src/app/actions.ts`

- [ ] **Step 1: Replace the contents of `src/app/actions.ts`**

```ts
"use server";

import { redirect } from "next/navigation";
import { authenticate, createSession, destroySession, registerUser } from "@/lib/auth";

export type LoginState = { error?: string };
export type SignupState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Please enter both email and password." };
  }

  const user = authenticate(email, password);
  if (!user) {
    return { error: "Invalid email or password." };
  }

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

  if (!name || !email || !password || !confirmPassword) {
    return { error: "All fields are required." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const user = registerUser(name, email, password);
  if (!user) {
    return { error: "An account with this email already exists." };
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
```

- [ ] **Step 2: Verify no type errors**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/auth.ts src/app/actions.ts
git commit -m "feat: add registerUser helper and signupAction server action"
```

---

## Task 5: Create signup page

**Files:**
- Create: `src/app/signup/page.tsx`

- [ ] **Step 1: Create `src/app/signup/page.tsx`**

```tsx
"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction, type SignupState } from "@/app/actions";

const initialState: SignupState = {};

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signupAction, initialState);

  const inputClass =
    "rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50";

  return (
    <section className="mx-auto max-w-sm py-10">
      <div className="rounded-2xl border border-rose-100 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
          Create an account
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Sign up to browse and shop the collection.
        </p>

        <form action={formAction} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-neutral-700 dark:text-neutral-300">Name</span>
            <input name="name" type="text" autoComplete="name" required className={inputClass} />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-neutral-700 dark:text-neutral-300">Email</span>
            <input name="email" type="email" autoComplete="email" required className={inputClass} />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-neutral-700 dark:text-neutral-300">Password</span>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              Confirm Password
            </span>
            <input
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className={inputClass}
            />
          </label>

          {state.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-lg bg-rose-600 px-4 py-2.5 font-medium text-white transition hover:bg-rose-700 disabled:opacity-60"
          >
            {pending ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-rose-600 hover:text-rose-700">
            Log in →
          </Link>
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify no type errors**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/signup/page.tsx
git commit -m "feat: add signup page"
```

---

## Task 6: Rewrite home page as About/Home

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace the contents of `src/app/page.tsx`**

```tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-4xl">
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

      <section className="mt-4 grid gap-6 rounded-2xl border border-rose-100 bg-white p-8 dark:border-neutral-800 dark:bg-neutral-900 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <span className="text-3xl">🧵</span>
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">Master Weavers</h2>
          <p className="text-sm text-neutral-500">
            Every saree is handcrafted by artisans who have perfected their
            craft over generations.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-3xl">🇮🇳</span>
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">Across India</h2>
          <p className="text-sm text-neutral-500">
            From the silk looms of Kanchipuram to the zari workshops of
            Varanasi — authentic origin, guaranteed.
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
git commit -m "feat: rewrite home page with about section and login/signup CTAs"
```

---

## Task 7: Add signup link to login page

**Files:**
- Modify: `src/app/login/page.tsx`

- [ ] **Step 1: Add `import Link from "next/link"` at the top of `src/app/login/page.tsx`** (it doesn't have one yet).

After the existing imports, add:
```tsx
import Link from "next/link";
```

- [ ] **Step 2: Add signup link after the demo credentials box**

After the closing `</div>` of the demo credentials box (the rose-50 div), add:

```tsx
        <p className="mt-4 text-center text-sm text-neutral-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-rose-600 hover:text-rose-700">
            Sign up →
          </Link>
        </p>
```

- [ ] **Step 3: Verify no type errors**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/login/page.tsx
git commit -m "feat: add sign up link to login page"
```

---

## Task 8: Create CategoryFilter component

**Files:**
- Create: `src/components/category-filter.tsx`

- [ ] **Step 1: Create `src/components/category-filter.tsx`**

```tsx
"use client";

import type { Occasion, Saree } from "@/lib/types";

const OCCASIONS: (Occasion | "All")[] = ["All", "Bridal", "Casual", "Party", "Office"];

type Props = {
  sarees: Saree[];
  occasion: Occasion | "All";
  fabric: string;
  onChange: (occasion: Occasion | "All", fabric: string) => void;
};

export function CategoryFilter({ sarees, occasion, fabric, onChange }: Props) {
  const fabrics = [
    "All",
    ...Array.from(
      new Set(
        (occasion === "All" ? sarees : sarees.filter((s) => s.occasion === occasion)).map(
          (s) => s.fabric,
        ),
      ),
    ).sort(),
  ];

  const pill = "rounded-full px-4 py-1.5 text-sm font-medium transition cursor-pointer";
  const active = "bg-rose-600 text-white";
  const inactive =
    "bg-neutral-100 text-neutral-700 hover:bg-rose-50 hover:text-rose-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {OCCASIONS.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o, "All")}
            className={`${pill} ${occasion === o ? active : inactive}`}
          >
            {o}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {fabrics.map((f) => (
          <button
            key={f}
            onClick={() => onChange(occasion, f)}
            className={`${pill} ${fabric === f ? active : inactive}`}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify no type errors**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

---

## Task 9: Create DashboardClient component

**Files:**
- Create: `src/components/dashboard-client.tsx`

- [ ] **Step 1: Create `src/components/dashboard-client.tsx`**

```tsx
"use client";

import { useState } from "react";
import type { Occasion, Saree } from "@/lib/types";
import { CategoryFilter } from "./category-filter";
import { SareeCard } from "./saree-card";

type Props = {
  sarees: Saree[];
  userName: string;
};

export function DashboardClient({ sarees, userName }: Props) {
  const [occasion, setOccasion] = useState<Occasion | "All">("All");
  const [fabric, setFabric] = useState<string>("All");

  const filtered = sarees
    .filter((s) => occasion === "All" || s.occasion === occasion)
    .filter((s) => fabric === "All" || s.fabric === fabric);

  return (
    <section>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
          The Collection
        </h1>
        <p className="text-sm text-neutral-500">
          {filtered.length} of {sarees.length} sarees — handpicked for you, {userName}.
        </p>
      </div>

      <div className="mb-6">
        <CategoryFilter
          sarees={sarees}
          occasion={occasion}
          fabric={fabric}
          onChange={(o, f) => {
            setOccasion(o);
            setFabric(f);
          }}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-center text-neutral-500">
          No sarees match the selected filters.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((saree) => (
            <SareeCard key={saree.id} saree={saree} />
          ))}
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Verify no type errors**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/category-filter.tsx src/components/dashboard-client.tsx
git commit -m "feat: add CategoryFilter and DashboardClient components"
```

---

## Task 10: Update dashboard page to use DashboardClient

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Replace the contents of `src/app/dashboard/page.tsx`**

```tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getSarees } from "@/lib/data";
import { DashboardClient } from "@/components/dashboard-client";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const sarees = getSarees();

  return <DashboardClient sarees={sarees} userName={user.name} />;
}
```

- [ ] **Step 2: Verify no type errors**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: wire DashboardClient into dashboard page"
```

---

## Task 11: Update SareeCard with rating, stock badge, and quantity stepper

**Files:**
- Modify: `src/components/saree-card.tsx`

- [ ] **Step 1: Replace the contents of `src/components/saree-card.tsx`**

```tsx
"use client";

import { useState } from "react";
import type { Saree } from "@/lib/types";
import { formatINR } from "@/lib/format";
import { useCart } from "./cart-context";

export function SareeCard({ saree }: { saree: Saree }) {
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    for (let i = 0; i < quantity; i++) {
      add(saree);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  const stepperBtn =
    "h-7 w-7 rounded-md border border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800";

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
      <div
        className="relative flex h-48 items-end p-3"
        style={{
          background: `linear-gradient(135deg, ${saree.color} 0%, ${saree.color}99 60%, #00000022 100%)`,
        }}
      >
        <span className="rounded-full bg-black/30 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
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

        <div className="flex items-center gap-3">
          <span className="text-sm text-amber-500">★ {saree.rating.toFixed(1)}</span>
          <span
            className={`text-xs font-medium ${
              saree.inStock
                ? "text-green-600 dark:text-green-400"
                : "text-neutral-400 dark:text-neutral-500"
            }`}
          >
            {saree.inStock ? "In Stock" : "Sold Out"}
          </span>
        </div>

        <p className="line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
          {saree.description}
        </p>

        <div className="mt-auto flex flex-col gap-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
              {formatINR(saree.price)}
            </span>
            {saree.inStock && (
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
            disabled={!saree.inStock}
            className="w-full rounded-lg bg-rose-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-neutral-300 dark:disabled:bg-neutral-700"
          >
            {!saree.inStock ? "Unavailable" : added ? "Added ✓" : "Add to cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Verify no type errors**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/saree-card.tsx
git commit -m "feat: add rating, stock badge, and quantity stepper to SareeCard"
```

---

## Task 12: Final build verification and manual test

- [ ] **Step 1: Run production build**

```bash
npm run build
```

Expected: build completes with no errors. TypeScript and ESLint run as part of this.

- [ ] **Step 2: Start dev server and manually verify**

```bash
npm run dev
```

Open http://localhost:3000 and verify:

| Check | Expected |
|---|---|
| Home page | Hero with "Log in" (outlined) and "Sign up" (rose) buttons + 3-column about section |
| Login page | Existing form + "Sign up →" link below demo credentials box |
| Signup page (`/signup`) | Name, Email, Password, Confirm Password form |
| Sign up with new credentials | Redirects to `/dashboard` |
| Log in with new credentials | Redirects to `/dashboard` |
| Log in with wrong password | "Invalid email or password." error |
| Signup with mismatched passwords | "Passwords do not match." error |
| Signup with existing email | "An account with this email already exists." error |
| Dashboard | Two rows of pills (occasion top, fabric bottom) + saree grid |
| Click "Bridal" pill | Shows only Bridal sarees; fabric row updates to matching fabrics |
| Click a fabric pill | Further filters the grid |
| Click "All" occasion | Resets both filters |
| SareeCard | Shows ★ rating, "In Stock"/"Sold Out" badge, −/count/+ stepper, "Add to cart" button |
| Quantity stepper | − doesn't go below 1; adding 3 units shows count 3 in cart header |
| Sold-out card | No stepper shown, "Unavailable" button, greyed out |
| Logout button | Visible in header on all pages after login |

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete saree storefront redesign"
```
