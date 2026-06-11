import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-12 sm:grid-cols-3">
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Help Center
          </h3>
          <ul className="flex flex-col gap-2 text-sm text-neutral-600 dark:text-neutral-300">
            {["FAQ", "Shipping Policy", "Returns & Exchanges", "Track Order"].map((item) => (
              <li key={item}>
                <Link href="#" className="hover:text-rose-600 transition-colors">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Contact Us
          </h3>
          <ul className="flex flex-col gap-2 text-sm text-neutral-600 dark:text-neutral-300">
            <li>
              <a
                href="mailto:support@sareesutra.com"
                className="hover:text-rose-600 transition-colors"
              >
                support@sareesutra.com
              </a>
            </li>
            <li>+91 98765 43210</li>
            <li>Bengaluru, Karnataka, India</li>
            <li className="pt-1 text-xs text-neutral-400">Mon–Sat, 10am–6pm IST</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            About SareeSutra
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Curating authentic handwoven sarees from master weavers across India since 2020.
            Every piece tells a story.
          </p>
          <div className="mt-4 flex gap-4 text-sm">
            <a href="#" className="text-neutral-500 hover:text-rose-600 transition-colors">
              Instagram
            </a>
            <a href="#" className="text-neutral-500 hover:text-rose-600 transition-colors">
              Facebook
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-100 px-4 py-4 text-center text-xs text-neutral-400 dark:border-neutral-800">
        © 2026 SareeSutra. All rights reserved.
      </div>
    </footer>
  );
}
