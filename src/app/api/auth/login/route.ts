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
        console.error("Login DB error:", err);
        return NextResponse.json(
          { ok: false, error: "Database error. Check Supabase: key must start with sb_secret_ and table flowtern_users must exist." },
          { status: 503 }
        );
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
  } catch {
    return NextResponse.json(
      { ok: false, error: "Something went wrong." },
      { status: 500 }
    );
  }
}
