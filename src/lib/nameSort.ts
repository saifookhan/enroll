import type { Locale } from "@/lib/translations";

export type NameSortMode = "firstName" | "lastName";

/**
 * Estrae la chiave per ordinare.
 * - `en`: tipico "First Last" → nome = prima parola, cognome = ultima.
 * - `it`: tipico in classe "Cognome Nome" → cognome = prima parola, nome = ultima.
 */
export function nameSortKey(
  full: string,
  mode: NameSortMode,
  lang: Locale = "en"
): string {
  const t = full.trim().toLowerCase();
  if (!t) return "";
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0];

  if (lang === "it") {
    return mode === "firstName" ? parts[parts.length - 1] : parts[0];
  }
  return mode === "firstName" ? parts[0] : parts[parts.length - 1];
}

function isEmptyDisplayName(full: string) {
  return !full.trim();
}

/**
 * Ordina per nome/cognome; le righe senza nome (slot vuoti) restano sempre in fondo.
 */
export function compareByNameSort(
  a: string,
  b: string,
  mode: NameSortMode,
  lang: Locale = "en"
): number {
  const emptyA = isEmptyDisplayName(a);
  const emptyB = isEmptyDisplayName(b);
  if (emptyA && emptyB) return 0;
  if (emptyA) return 1;
  if (emptyB) return -1;

  const collator = new Intl.Collator(lang === "it" ? "it" : "en", {
    sensitivity: "base",
  });

  const ak = nameSortKey(a, mode, lang);
  const bk = nameSortKey(b, mode, lang);
  const c = collator.compare(ak, bk);
  if (c !== 0) return c;
  return collator.compare(a.trim(), b.trim());
}
