"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import FlowTernLogo from "./FlowTernLogo";
import NavLinks from "./NavLinks";
import NavRight from "./NavRight";
import ThemeToggle from "./ThemeToggle";

function NavRightFallback() {
  return (
    <div className="flex items-center gap-4">
      <span className="inline-flex rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-xs text-zinc-500 dark:text-zinc-400" aria-hidden>
        Light · Dark
      </span>
      <Link href="/" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
        Log in
      </Link>
    </div>
  );
}

export default function NavBar() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (isHome) {
    return (
      <nav className="border-b border-zinc-200/50 bg-white/80 backdrop-blur dark:border-zinc-800/50 dark:bg-zinc-900/80">
        <div className="mx-auto flex max-w-5xl items-center justify-end px-6 py-3">
          <Suspense fallback={<span className="h-9 w-20 rounded-md bg-zinc-200 dark:bg-zinc-700" />}>
            <ThemeToggle />
          </Suspense>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-8 px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 hover:opacity-90">
            <FlowTernLogo size={28} />
          </Link>
          <NavLinks />
        </div>
        <Suspense fallback={<NavRightFallback />}>
          <NavRight />
        </Suspense>
      </div>
    </nav>
  );
}
