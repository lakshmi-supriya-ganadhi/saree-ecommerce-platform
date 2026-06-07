import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

// Landing page. Logged-in users go straight to the collection.
export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center gap-6 py-16 text-center">
      <span className="text-5xl">🥻</span>
      <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
        Handwoven sarees, <span className="text-rose-600">delivered.</span>
      </h1>
      <p className="max-w-md text-neutral-600 dark:text-neutral-400">
        Discover authentic Kanchipuram silks, Banarasi weaves, Chanderi cottons
        and more — curated from master weavers across India.
      </p>
      <Link
        href="/login"
        className="rounded-lg bg-rose-600 px-6 py-3 font-medium text-white transition hover:bg-rose-700"
      >
        Log in to shop the collection
      </Link>
    </section>
  );
}
