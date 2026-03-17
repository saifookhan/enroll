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
          className="p-1.5 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
          aria-label={t("logOut")}
          title={t("logOut")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
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
