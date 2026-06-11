import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getFeaturedSarees } from "@/lib/data";
import { OFFERS } from "@/lib/offers";
import { formatINR } from "@/lib/format";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const featured = getFeaturedSarees(4);

  return (
    <div className="mx-auto max-w-4xl">
      {/* Hero */}
      <section className="flex flex-col items-center gap-6 py-16 text-center">
        <span className="text-6xl">🥻</span>
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Handwoven sarees,{" "}
          <span className="text-rose-600">delivered.</span>
        </h1>
        <p className="max-w-md text-lg text-neutral-600 dark:text-neutral-400">
          Discover authentic Kanchipuram silks, Banarasi weaves, Chanderi
          cottons and more — curated from master weavers across India.
        </p>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="rounded-lg border border-rose-600 px-6 py-3 font-medium text-rose-600 transition hover:bg-rose-50 dark:hover:bg-neutral-900"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-rose-600 px-6 py-3 font-medium text-white transition hover:bg-rose-700"
          >
            Sign up
          </Link>
        </div>
      </section>

      {/* Latest Collection */}
      <section className="mt-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
            Latest Collection
          </h2>
          <Link
            href="/login"
            className="text-sm font-medium text-rose-600 hover:text-rose-700"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {featured.map((saree) => (
            <Link
              key={saree.id}
              href="/login"
              className="group overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={saree.variants[0].image}
                  alt={saree.name}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-50">
                  {saree.name}
                </p>
                <p className="text-sm font-bold text-rose-600">
                  {formatINR(saree.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Offers */}
      <section className="mt-10">
        <h2 className="mb-4 text-xl font-bold text-neutral-900 dark:text-neutral-50">
          Offers &amp; Promotions
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {OFFERS.map((offer) => (
            <div
              key={offer.id}
              className={`rounded-2xl border p-6 ${offer.bgColor} ${offer.borderColor}`}
            >
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${offer.accentColor} bg-white/60`}
              >
                {offer.badge}
              </span>
              <h3 className={`mt-3 text-lg font-bold ${offer.accentColor}`}>
                {offer.title}
              </h3>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                {offer.subtitle}
              </p>
              <Link
                href="/login"
                className={`mt-4 inline-block text-sm font-semibold ${offer.accentColor} hover:underline`}
              >
                Shop now →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="mt-10 grid gap-6 rounded-2xl border border-rose-100 bg-white p-8 dark:border-neutral-800 dark:bg-neutral-900 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <span className="text-3xl">🧵</span>
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">Master Weavers</h2>
          <p className="text-sm text-neutral-500">
            Every saree is handcrafted by artisans who have perfected their craft over generations.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-3xl">🇮🇳</span>
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">Across India</h2>
          <p className="text-sm text-neutral-500">
            From the silk looms of Kanchipuram to the zari workshops of Varanasi — authentic
            origin, guaranteed.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-3xl">📦</span>
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">Delivered to You</h2>
          <p className="text-sm text-neutral-500">
            Carefully packaged and shipped to your doorstep, wherever you are.
          </p>
        </div>
      </section>
    </div>
  );
}
