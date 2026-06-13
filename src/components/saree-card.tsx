"use client";

import { useState } from "react";
import type { ColorVariant, Saree } from "@/lib/types";
import { formatINR } from "@/lib/format";
import { useCart } from "./cart-context";
import { useWishlist } from "./wishlist-context";
import { FabricSwatch } from "./fabric-swatch";

export function SareeCard({ saree }: { saree: Saree }) {
  const { add } = useCart();
  const { add: wishlistAdd, remove: wishlistRemove, has } = useWishlist();
  const [selected, setSelected] = useState<ColorVariant>(saree.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const wishlisted = has(saree.id);

  function handleAdd() {
    for (let i = 0; i < quantity; i++) add(saree, selected);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  function toggleWishlist() {
    if (wishlisted) wishlistRemove(saree.id);
    else wishlistAdd(saree, selected);
  }

  const stepperBtn =
    "h-7 w-7 rounded-md border border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800";

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
      <div className="relative h-48 overflow-hidden">
        <FabricSwatch hex={selected.hex} className="h-full w-full transition duration-300 group-hover:scale-105" />
        <button
          onClick={toggleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-lg shadow backdrop-blur hover:bg-white"
        >
          {wishlisted ? "♥" : "♡"}
        </button>
        <span className="absolute bottom-3 left-3 rounded-full bg-black/30 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
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
              selected.inStock
                ? "text-green-600 dark:text-green-400"
                : "text-neutral-400 dark:text-neutral-500"
            }`}
          >
            {selected.inStock ? "In Stock" : "Sold Out"}
          </span>
        </div>

        <p className="line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
          {saree.description}
        </p>

        <div className="flex gap-1.5">
          {saree.variants.map((v) => (
            <button
              key={v.colorName}
              onClick={() => {
                setSelected(v);
                setQuantity(1);
              }}
              title={v.colorName}
              aria-label={v.colorName}
              className={`h-6 w-6 rounded-full border-2 transition ${
                selected.colorName === v.colorName
                  ? "scale-110 border-rose-500"
                  : "border-transparent hover:border-neutral-400"
              }`}
              style={{ backgroundColor: v.hex }}
            />
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
              {formatINR(saree.price)}
            </span>
            {selected.inStock && (
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
            disabled={!selected.inStock}
            className="w-full rounded-lg bg-rose-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-neutral-300 dark:disabled:bg-neutral-700"
          >
            {!selected.inStock ? "Unavailable" : added ? "Added ✓" : "Add to cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
