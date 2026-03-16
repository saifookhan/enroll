import { NextResponse } from "next/server";

export async function GET() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "").trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
  const hasUrl = Boolean(url);
  const hasKey = Boolean(key);
  // Supabase keys: newer format sb_secret_... (~42 chars) or legacy JWT eyJ... (200+ chars).
  const keyLength = key.length;
  const isNewFormat = key.startsWith("sb_secret_");
  const isLegacyJwt = key.startsWith("eyJ");
  const keyHint = !hasKey
    ? "missing"
    : isNewFormat || isLegacyJwt
      ? "ok"
      : keyLength < 150
        ? "unusually short; use service_role secret from Project Settings → API"
        : "ok";
  return NextResponse.json({
    supabaseUrl: hasUrl ? "ok" : "missing",
    supabaseUrlLength: url.length,
    serviceRoleKey: hasKey ? "set" : "missing",
    serviceRoleKeyLength: keyLength,
    serviceRoleKeyHint: keyHint,
    keyFormat: isNewFormat ? "sb_secret_ (new)" : isLegacyJwt ? "eyJ (legacy JWT)" : "unknown",
    loginConfigured: hasUrl && hasKey,
  });
}
