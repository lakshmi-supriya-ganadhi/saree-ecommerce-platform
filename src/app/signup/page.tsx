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
