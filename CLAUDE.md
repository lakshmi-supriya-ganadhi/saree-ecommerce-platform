# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

# SareeSutra — project guide

A Next.js storefront MVP for a handwoven sarees business. Users log in, browse
the saree collection (dashboard), and add items to a cart.

## Commands
- `npm run dev` — dev server at http://localhost:3000
- `npm run build` — production build; also runs TypeScript type-checking and lint
- `npm run lint` — ESLint only
- No test suite is configured.

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 (`@import "tailwindcss"` in `src/app/globals.css`)
- No external services — all data and auth are in-memory

## Architecture

The app enforces a hard server/client boundary via `import "server-only"` in
`src/lib/auth.ts` and `src/lib/session.ts`. Never import these modules in Client
Components (`"use client"`).

**Data and auth layer (`src/lib/`):**
- `types.ts` — domain types (`Saree`, `User`, `CartItem`)
- `data.ts` — in-memory saree catalogue; exports `getSarees()` and `getSaree(id)`. **Swap these for DB queries to go live.**
- `auth.ts` — in-memory users + session helpers (`authenticate`, `getCurrentUser`, `createSession`, `destroySession`). `getCurrentUser()` is the auth gate. Server-only.
- `session.ts` — HMAC-signed stateless cookie token using `SESSION_SECRET`. Server-only.
- `format.ts` — `formatINR()` for ₹ INR formatting

**App layer:**
- `src/app/actions.ts` — server actions: `loginAction`, `logoutAction`
- `src/components/cart-context.tsx` — client-side cart state (React context + `localStorage`). `CartProvider` wraps the entire app in `layout.tsx`, so `useCart()` is available in any Client Component without extra setup.
- Pages: `/` (landing), `/login`, `/dashboard` (protected), `/cart` (protected)

## Conventions
- Protect a server component by calling `await getCurrentUser()` and `redirect("/login")` if null — see `dashboard/page.tsx`.
- All data and auth access must go through `src/lib/*`. UI components never touch storage directly — this containment is what makes a future Supabase migration tractable.
- Format prices with `formatINR()` from `src/lib/format.ts`.

## Auth
- Demo: `demo@saree.shop` / `saree123`
- Admin: `admin@saree.shop` / `admin123`
- `.env.local` must define `SESSION_SECRET` for stable sessions across restarts (gitignored). Falls back to an insecure dev-only default if absent.

## Upgrade path (planned)
1. Replace `lib/data.ts` with Supabase/Postgres queries.
2. Replace seeded users + cookie session with Supabase Auth (or NextAuth).
3. Persist carts server-side per user; add checkout (Stripe).
