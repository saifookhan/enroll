"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

export default function NavLinks() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const linkClass = (path: string, matchPrefix?: boolean) => {
    const isActive = matchPrefix
      ? pathname === path || pathname.startsWith(path + "/")
      : pathname === path;
    return `text-sm font-medium border-b-2 transition-colors ${
      isActive
        ? "border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50"
        : "border-transparent text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
    }`;
  };

  return (
    <div className="flex gap-6">
      <Link href="/" className={linkClass("/")}>
        {t("home")}
      </Link>
      <Link href="/enrollments-2027" className={linkClass("/enrollments-2027", true)}>
        {t("enrollments")}
      </Link>
      <Link href="/interviews" className={linkClass("/interviews", true)}>
        {t("interviews")}
      </Link>
      <Link href="/internships" className={linkClass("/internships", true)}>
        {t("internships")}
      </Link>
    </div>
  );
}
