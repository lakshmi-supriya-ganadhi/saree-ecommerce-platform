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
