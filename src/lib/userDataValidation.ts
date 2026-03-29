/** Limite dimensione body (caratteri UTF-8) per evitare payload enormi. */
export const MAX_USER_DATA_BODY_CHARS = 600_000;

const MAX_KEY_LENGTH = 80;
const MAX_ARRAY_ITEMS = 2000;
const MAX_CLASS_NAME_LEN = 200;

function isValidDataKey(key: string): boolean {
  if (!key || key.length > MAX_KEY_LENGTH) return false;
  return /^[a-zA-Z][a-zA-Z0-9._-]*$/.test(key);
}

export type ValidatePostResult =
  | { ok: true; value: unknown }
  | { ok: false; error: string; status: number };

/**
 * Valida chiave e JSON del POST /api/user/data/[key].
 * Tipi attesi: `view` stringa; `internships-class-names` oggetto; altre chiavi note → array.
 */
export function validateUserDataPost(key: string, rawBody: string): ValidatePostResult {
  if (!isValidDataKey(key)) {
    return { ok: false, error: "Invalid key", status: 400 };
  }
  if (rawBody.length > MAX_USER_DATA_BODY_CHARS) {
    return { ok: false, error: "Payload too large", status: 413 };
  }

  let value: unknown;
  try {
    value = JSON.parse(rawBody);
  } catch {
    return { ok: false, error: "Invalid JSON", status: 400 };
  }

  if (key === "view") {
    if (typeof value !== "string" || !["list", "grid", "compact"].includes(value)) {
      return { ok: false, error: "Invalid view value", status: 400 };
    }
    return { ok: true, value };
  }

  if (key === "internships-class-names") {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      return { ok: false, error: "Invalid body", status: 400 };
    }
    const o = value as Record<string, unknown>;
    if (typeof o.class1 !== "string" || typeof o.class2 !== "string") {
      return { ok: false, error: "Invalid class names", status: 400 };
    }
    if (o.class1.length > MAX_CLASS_NAME_LEN || o.class2.length > MAX_CLASS_NAME_LEN) {
      return { ok: false, error: "Class name too long", status: 400 };
    }
    return { ok: true, value };
  }

  if (!Array.isArray(value)) {
    return { ok: false, error: "Expected JSON array", status: 400 };
  }
  if (value.length > MAX_ARRAY_ITEMS) {
    return { ok: false, error: "Too many items", status: 400 };
  }

  return { ok: true, value };
}
