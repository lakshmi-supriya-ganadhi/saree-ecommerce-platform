"use client";

import Link from "next/link";
import type { User } from "@/lib/types";
import { useCart } from "./cart-context";
import { logoutAction } from "@/app/actions";

export function Header({ user }: { user: User | null }) {
  const { count } = useCart();

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
              <span className="hidden text-neutral-400 sm:inline">|</span>
              <span className="hidden text-neutral-500 sm:inline">
                Hi, {user.name}
              </span>
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
