import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { createSession, ensureUsersTable, createUser, getUserByEmail, getUserCount, isDbConfigured } from "@/lib/db";

export async function POST(request: Request) {
  try {
    if (!isDbConfigured()) {
      return NextResponse.json(
        { ok: false, error: "Database not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { ok: false, error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    await ensureUsersTable();
    const count = await getUserCount();

    const setupSecret = (process.env.SETUP_SECRET ?? "").trim();
    const allowOpenRegistration = process.env.ALLOW_OPEN_REGISTRATION === "true" || process.env.ALLOW_OPEN_REGISTRATION === "1";

    // Allow: first user ever, or open registration enabled, or valid setup key
    if (count > 0 && !allowOpenRegistration && !setupSecret) {
      return NextResponse.json(
        { ok: false, error: "Registration is closed." },
        { status: 403 }
      );
    }

    const secretFromBody = typeof body.setupSecret === "string" ? body.setupSecret.trim() : "";
    if (count > 0 && !allowOpenRegistration && setupSecret && secretFromBody !== setupSecret) {
      return NextResponse.json(
        { ok: false, error: "Invalid setup key." },
        { status: 403 }
      );
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { ok: false, error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 10);
    const result = await createUser(email, passwordHash);
    if ("error" in result) {
      const code = result.code;
      const err = result.error;
      const errLower = err.toLowerCase();
      const msg =
        errLower.includes("invalid") && (errLower.includes("api key") || errLower.includes("apikey"))
          ? "Invalid Supabase API key. In .env.local set SUPABASE_SERVICE_ROLE_KEY to the service role key (Project Settings → API → service_role secret), not the anon key. Remove any extra spaces or newlines."
          : code === "23505"
            ? "An account with this email already exists."
            : code === "42501" || errLower.includes("policy") || errLower.includes("permission")
              ? "Database denied access. In Supabase: turn off RLS for flowtern_users or add a policy that allows insert with the service role."
              : err.includes("does not exist") || err.includes("relation")
                ? "Users table missing. Run the SQL in supabase/schema.sql in the Supabase SQL Editor."
                : err;
      return NextResponse.json({ ok: false, error: msg }, { status: 500 });
    }
    const { user } = result;
    const token = await createSession(user.id);
    return NextResponse.json({ ok: true, userId: user.id, token: token ?? undefined });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Something went wrong." },
      { status: 500 }
    );
  }
}
