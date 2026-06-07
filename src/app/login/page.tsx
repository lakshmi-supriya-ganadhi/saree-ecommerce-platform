"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/actions";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <section className="mx-auto max-w-sm py-10">
      <div className="rounded-2xl border border-rose-100 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Log in to browse and shop the collection.
        </p>

        <form action={formAction} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              Email
            </span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              defaultValue="demo@saree.shop"
              required
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              Password
            </span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              defaultValue="saree123"
              required
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50"
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
            {pending ? "Logging in…" : "Log in"}
          </button>
        </form>

        <div className="mt-6 rounded-lg bg-rose-50 px-4 py-3 text-xs text-rose-800 dark:bg-neutral-800 dark:text-rose-200">
          <p className="font-semibold">Demo credentials</p>
          <p>Email: demo@saree.shop · Password: saree123</p>
        </div>
      </div>
    </section>
  );
}
