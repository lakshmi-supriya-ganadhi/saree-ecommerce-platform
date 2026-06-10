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
