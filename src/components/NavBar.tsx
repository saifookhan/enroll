"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import FlowTernLogo from "./FlowTernLogo";
import LanguageToggle from "./LanguageToggle";
import NavLinks from "./NavLinks";
import NavRight from "./NavRight";
import ThemeToggle from "./ThemeToggle";

function NavRightFallback() {
  return (
    <div className="flex items-center gap-4">
      <span className="h-9 w-14 rounded-md bg-zinc-200 dark:bg-zinc-700" />
      <span className="h-9 w-20 rounded-md bg-zinc-200 dark:bg-zinc-700" />
      <span className="h-5 w-12 rounded bg-zinc-200 dark:bg-zinc-700" />
    </div>
  );
}

const MINIMAL_NAV_PATHS = ["/", "/register", "/forgot-password"];

export default function NavBar() {
  const pathname = usePathname();
  const useMinimalNav = MINIMAL_NAV_PATHS.includes(pathname);
  const { t } = useLanguage();

  if (useMinimalNav) {
    return (
      <nav className="border-b border-zinc-200/50 bg-white/80 backdrop-blur dark:border-zinc-800/50 dark:bg-zinc-900/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-6 py-3">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            {t("home")}
          </Link>
          <div className="flex items-center gap-2">
            <Suspense fallback={<span className="h-9 w-14 rounded-md bg-zinc-200 dark:bg-zinc-700" />}>
              <LanguageToggle />
            </Suspense>
            <Suspense fallback={<span className="h-9 w-20 rounded-md bg-zinc-200 dark:bg-zinc-700" />}>
              <ThemeToggle />
            </Suspense>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-8 px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 hover:opacity-90 flex items-center">
            <FlowTernLogo size={28} markOnly />
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
