import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { ensureUsersTable, createUser, getUserByEmail, getUserCount, isDbConfigured } from "@/lib/db";

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

    // Only allow registration when there are no users (first user) or when SETUP_SECRET is provided
    const setupSecret = process.env.SETUP_SECRET ?? "";
    if (count > 0 && !setupSecret) {
      return NextResponse.json(
        { ok: false, error: "Registration is closed." },
        { status: 403 }
      );
    }

    const secretFromBody = typeof body.setupSecret === "string" ? body.setupSecret : "";
    if (count > 0 && setupSecret && secretFromBody !== setupSecret) {
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
    await createUser(email, passwordHash);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Something went wrong." },
      { status: 500 }
    );
  }
}
