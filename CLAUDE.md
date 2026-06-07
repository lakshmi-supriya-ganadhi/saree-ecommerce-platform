@AGENTS.md

# SareeSutra — project guide

A Next.js storefront MVP for a handwoven sarees business. Users log in, browse
the saree collection (dashboard), and add items to a cart.

## Commands
- `npm run dev` — dev server at http://localhost:3000
- `npm run build` — production build (also runs TypeScript + lint)
- `npm run lint` — eslint

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 (`@import "tailwindcss"` in `src/app/globals.css`)
- No external services yet — see "Upgrade path"

## Architecture
- `src/lib/types.ts` — domain types (`Saree`, `User`, `CartItem`)
- `src/lib/data.ts` — seeded saree catalogue. Single source of truth for
  products. **Swap these functions for DB queries to go live.**
- `src/lib/auth.ts` — seeded users + session helpers (`getCurrentUser`,
  `createSession`, `destroySession`). `getCurrentUser()` is the auth gate.
- `src/lib/session.ts` — HMAC-signed cookie token (uses `SESSION_SECRET`).
- `src/app/actions.ts` — server actions: `loginAction`, `logoutAction`.
- `src/components/cart-context.tsx` — client cart state, persisted to
  `localStorage`. Use `useCart()`.
- Pages: `/` (landing), `/login`, `/dashboard` (protected), `/cart` (protected).

## Conventions
- Protect a page by calling `await getCurrentUser()` in the server component and
  `redirect("/login")` if null (see `dashboard/page.tsx`).
- Keep data/auth access behind `src/lib/*` so the UI never touches storage
  directly — this is what makes the Supabase upgrade contained.
- Format money with `formatINR()` from `src/lib/format.ts` (₹ INR).
- Demo login: `demo@saree.shop` / `saree123`.

## Env
- `.env.local` holds `SESSION_SECRET` (required for stable sessions; gitignored).

## Upgrade path (planned)
1. Replace `lib/data.ts` with Supabase/Postgres queries.
2. Replace seeded users + cookie session with Supabase Auth (or NextAuth).
3. Persist carts server-side per user; add checkout (Stripe).
