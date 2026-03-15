import { NextResponse } from "next/server";

export async function GET() {
  const hasUrl = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  );
  const hasKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  return NextResponse.json({
    supabaseUrl: hasUrl ? "ok" : "mancante",
    serviceRoleKey: hasKey ? "ok" : "mancante",
    loginConfigured: hasUrl && hasKey,
  });
}
