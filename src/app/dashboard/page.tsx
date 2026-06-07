import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getSarees } from "@/lib/data";
import { SareeCard } from "@/components/saree-card";

// Protected: only logged-in users can see the collection.
export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const sarees = getSarees();
  const available = sarees.filter((s) => s.inStock).length;

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
          The Collection
        </h1>
        <p className="text-sm text-neutral-500">
          {available} of {sarees.length} models in stock — handpicked for you,{" "}
          {user.name}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sarees.map((saree) => (
          <SareeCard key={saree.id} saree={saree} />
        ))}
      </div>
    </section>
  );
}
