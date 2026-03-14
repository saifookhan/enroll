"use client";

import { useTheme } from "@/contexts/ThemeContext";

type Theme = "light" | "dark" | "system";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="flex rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 p-0.5"
      suppressHydrationWarning
    >
      {(["light", "dark", "system"] as const).map((t: Theme) => (
        <button
          key={t}
          type="button"
          onClick={() => setTheme(t)}
          className={`rounded px-2.5 py-1 text-xs font-medium capitalize transition ${
            theme === t
              ? "bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-zinc-50"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
