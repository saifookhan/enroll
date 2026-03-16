"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";

export default function NavRight() {
  const { isLoggedIn, logout } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-4">
      <LanguageToggle />
      <ThemeToggle />
      {isLoggedIn ? (
        <button
          type="button"
          onClick={() => logout()}
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          {t("logOut")}
        </button>
      ) : (
        <Link
          href="/"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          {t("logIn")}
        </Link>
      )}
    </div>
  );
}
