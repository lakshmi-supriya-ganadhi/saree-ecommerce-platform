# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

# SareeSutra — project guide

A Next.js storefront MVP for a handwoven sarees business. Users sign up or log in, browse the saree collection, wishlist items, and add them to a cart. An account page shows order history, saved addresses, and a wishlist view.

## Commands
- `npm run dev` — dev server at http://localhost:3000
- `npm run build` — production build; also runs TypeScript type-checking and lint
- `npm run lint` — ESLint only
- `npm run start` — serve the production build
- No test suite is configured.

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 (`@import "tailwindcss"` in `src/app/globals.css`); dark mode uses `dark:` variants throughout (system-preference, no manual toggle)
- No external services — all data and auth are in-memory and reset on server restart

## Architecture

The app enforces a hard server/client boundary via `import "server-only"` in `src/lib/auth.ts` and `src/lib/session.ts`. Never import these modules in Client Components (`"use client"`).

**Data and auth layer (`src/lib/`):**
- `types.ts` — domain types: `Saree`, `ColorVariant`, `Occasion`, `User`, `CartItem`, `WishlistItem`, `Order`, `Address`
- `data.ts` — in-memory saree catalogue; exports `getSarees()`, `getSaree(id)`, `getFeaturedSarees(count)`. **Swap for DB queries to go live.**
- `auth.ts` — in-memory users + session helpers (`authenticate`, `registerUser`, `updateUserName`, `getCurrentUser`, `createSession`, `destroySession`). `getCurrentUser()` is the auth gate. Server-only.
- `user-store.ts` — server-only; holds mock `Order` records (seeded for user `u1` only) and a runtime `Map` for addresses. Exports `getOrders`, `getAddresses`, `addAddress`. Resets on server restart.
- `session.ts` — HMAC-signed stateless cookie token using `SESSION_SECRET`. Server-only.
- `format.ts` — `formatINR()` for ₹ INR formatting
- `offers.ts` — static `OFFERS` array (promotional banners); not server-only, safe to import anywhere

**App layer:**
- `src/app/actions.ts` — all server actions: `loginAction`, `signupAction`, `logoutAction`, `updateProfileAction`, `addAddressAction`. Each returns a typed state shape (`{ error?, success? }`); client components consume these via `useActionState(action, {})`.
- `src/components/cart-context.tsx` — client-side cart state (React context + `localStorage`). `CartProvider` wraps the app in `layout.tsx`.
- `src/components/wishlist-context.tsx` — client-side wishlist state (React context + `localStorage`). `WishlistProvider` wraps the app alongside `CartProvider`. Wishlist is keyed by `sareeId` — one entry per saree.
- Pages: `/` (landing), `/login`, `/signup`, `/dashboard` (protected), `/cart` (protected), `/account` (protected)

**`/account` page pattern:**
The server component (`account/page.tsx`) fetches `user`, `orders`, and `addresses` server-side, then passes all as props to `AccountClient` — a tabbed Client Component (Profile, Orders, Wishlist, Addresses). Wishlist data comes from `useWishlist()` client-side; orders and addresses come from server props.

## Conventions
- Protect a server page by calling `await getCurrentUser()` and `redirect("/login")` if null — see `dashboard/page.tsx` and `account/page.tsx`.
- All data and auth access must go through `src/lib/*`. UI components never touch storage directly.
- Format prices with `formatINR()` from `src/lib/format.ts`.
- Server actions use `useActionState` on the client for pending/error/success states — follow the pattern in `account-client.tsx`.

## Auth
- Demo: `demo@saree.shop` / `saree123`
- Admin: `admin@saree.shop` / `admin123`
- New accounts can be created via `/signup` (in-memory only, resets on restart)
- `.env.local` must define `SESSION_SECRET` for stable sessions across restarts (gitignored). Falls back to an insecure dev-only default if absent.

## Upgrade path (planned)
1. Replace `lib/data.ts` with Supabase/Postgres queries.
2. Replace seeded users + cookie session with Supabase Auth (or NextAuth).
3. Persist carts and wishlists server-side per user; add checkout (Stripe).
