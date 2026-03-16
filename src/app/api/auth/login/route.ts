import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { createSession, ensureUsersTable, getUserByEmail, isDbConfigured } from "@/lib/db";

const LOGIN_EMAIL = process.env.LOGIN_EMAIL ?? "";
const LOGIN_PASSWORD = process.env.LOGIN_PASSWORD ?? "";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    // Use database if configured
    if (isDbConfigured()) {
      let user;
      try {
        await ensureUsersTable();
        user = await getUserByEmail(email);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("Login DB error:", message);
        const friendly =
          message.toLowerCase().includes("invalid") && (message.toLowerCase().includes("api key") || message.toLowerCase().includes("apikey"))
            ? "Invalid Supabase API key. In .env.local set SUPABASE_SERVICE_ROLE_KEY to the service role key (Project Settings → API → service_role secret), not the anon key. Remove any extra spaces or newlines."
            : "Database error. Check Supabase: use the service role key and ensure table flowtern_users exists.";
        return NextResponse.json({ ok: false, error: friendly }, { status: 503 });
      }
      if (user && (await compare(password, user.password_hash))) {
        const token = await createSession(user.id);
        return NextResponse.json({
          ok: true,
          userId: user.id,
          token: token ?? undefined,
        });
      }
      return NextResponse.json(
        { ok: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Fallback: env-based single user
    if (!LOGIN_EMAIL || !LOGIN_PASSWORD) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Login is not configured. Set Supabase env vars (and add a user) or LOGIN_EMAIL and LOGIN_PASSWORD in environment variables.",
        },
        { status: 503 }
      );
    }

    if (email === LOGIN_EMAIL && password === LOGIN_PASSWORD) {
      return NextResponse.json({ ok: true, userId: "env-user", token: undefined });
    }

    return NextResponse.json(
      { ok: false, error: "Invalid email or password." },
      { status: 401 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const lower = message.toLowerCase();
    const friendly =
      lower.includes("invalid") && (lower.includes("api key") || lower.includes("apikey"))
        ? "Invalid Supabase API key. In .env.local set SUPABASE_SERVICE_ROLE_KEY to the service role key (Project Settings → API → service_role secret), not the anon key."
        : "Something went wrong.";
    return NextResponse.json({ ok: false, error: friendly }, { status: 500 });
  }
}
