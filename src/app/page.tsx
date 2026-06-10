import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-4xl">
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

      <section className="mt-4 grid gap-6 rounded-2xl border border-rose-100 bg-white p-8 dark:border-neutral-800 dark:bg-neutral-900 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <span className="text-3xl">🧵</span>
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">Master Weavers</h2>
          <p className="text-sm text-neutral-500">
            Every saree is handcrafted by artisans who have perfected their
            craft over generations.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-3xl">🇮🇳</span>
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">Across India</h2>
          <p className="text-sm text-neutral-500">
            From the silk looms of Kanchipuram to the zari workshops of
            Varanasi — authentic origin, guaranteed.
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
