import { NextResponse } from "next/server";
import { getUserIdByToken, getUserData, setUserData } from "@/lib/db";
import { validateUserDataPost } from "@/lib/userDataValidation";

function validKeyOr400(key: string): NextResponse | null {
  if (!/^[a-zA-Z][a-zA-Z0-9._-]{0,79}$/.test(key)) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }
  return null;
}

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
  const badKey = validKeyOr400(key);
  if (badKey) return badKey;
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
  const badKeyPost = validKeyOr400(key);
  if (badKeyPost) return badKeyPost;
  const token = getToken(request);
  const userId = await getUserIdByToken(token);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rawBody = await request.text();
  const validated = validateUserDataPost(key, rawBody);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: validated.status });
  }
  const ok = await setUserData(userId, key, validated.value);
  if (!ok) return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
