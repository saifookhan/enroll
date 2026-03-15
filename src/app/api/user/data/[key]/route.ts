import { NextResponse } from "next/server";
import { getUserIdByToken, getUserData, setUserData } from "@/lib/db";

function getToken(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7).trim() || null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const key = (await params).key?.trim();
  if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });
  const token = getToken(_request);
  const userId = await getUserIdByToken(token);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await getUserData(userId, key);
  return NextResponse.json(data === null ? {} : data);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const key = (await params).key?.trim();
  if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });
  const token = getToken(request);
  const userId = await getUserIdByToken(token);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const ok = await setUserData(userId, key, body);
  if (!ok) return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
