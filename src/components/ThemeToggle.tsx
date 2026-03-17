"use client";

import { useTheme } from "@/contexts/ThemeContext";

type Theme = "light" | "dark";

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="flex rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 p-0.5"
      suppressHydrationWarning
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={`rounded p-1.5 transition ${
          theme === "light"
            ? "bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-zinc-50"
            : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        }`}
        title="Light"
        aria-label="Light mode"
      >
        <SunIcon />
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={`rounded p-1.5 transition ${
          theme === "dark"
            ? "bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-zinc-50"
            : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        }`}
        title="Dark"
        aria-label="Dark mode"
      >
        <MoonIcon />
      </button>
    </div>
  );
}
