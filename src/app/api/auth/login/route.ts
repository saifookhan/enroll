import { NextResponse } from "next/server";

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

    if (!LOGIN_EMAIL || !LOGIN_PASSWORD) {
      return NextResponse.json(
        { ok: false, error: "Login is not configured. Set LOGIN_EMAIL and LOGIN_PASSWORD in environment variables." },
        { status: 503 }
      );
    }

    if (email === LOGIN_EMAIL && password === LOGIN_PASSWORD) {
      return NextResponse.json({ ok: true });
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
