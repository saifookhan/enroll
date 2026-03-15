"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLinks() {
  const pathname = usePathname();

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
        Home
      </Link>
      <Link href="/enrollments-2027" className={linkClass("/enrollments-2027", true)}>
        Enrollments
      </Link>
      <Link href="/interviews" className={linkClass("/interviews", true)}>
        Interviews
      </Link>
      <Link href="/internships" className={linkClass("/internships", true)}>
        Internships
      </Link>
    </div>
  );
}
