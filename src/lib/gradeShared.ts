export const GRADE_OPTIONS = ["", "A", "A-", "B", "C"] as const;

/** A verde, A- giallo, B arancione, C rosso. */
export const GRADE_DOT_COLORS: Record<string, string> = {
  A: "bg-emerald-500",
  "A-": "bg-yellow-400",
  B: "bg-orange-500",
  C: "bg-red-500",
};

const VALID_GRADES = new Set<string>(["A", "A-", "B", "C"]);

/** Valori salvati per esito/voto; stringhe non valide → "". Migra A+→A. */
export function normalizeGrade(raw: string): string {
  let g = raw.trim();
  if (g === "A+") g = "A";
  return VALID_GRADES.has(g) ? g : "";
}
