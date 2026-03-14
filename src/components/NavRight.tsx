"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "./ThemeToggle";

export default function NavRight() {
  const { isLoggedIn, logout } = useAuth();

  return (
    <div className="flex items-center gap-4">
      <ThemeToggle />
      {isLoggedIn ? (
        <button
          type="button"
          onClick={() => logout()}
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          Log out
        </button>
      ) : (
        <Link
          href="/login"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          Log in
        </Link>
      )}
    </div>
  );
}
