"use client";

import Link from "next/link";
import { useCart } from "./cart-context";
import { formatINR } from "@/lib/format";
import { FabricSwatch } from "./fabric-swatch";

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
              <FabricSwatch hex={variant.hex} />
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
