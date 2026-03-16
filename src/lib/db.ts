import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "").trim();
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();

function getClient() {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function ensureUsersTable(): Promise<boolean> {
  // Table is created via SQL in Supabase Dashboard (see supabase/schema.sql). No-op here.
  return getClient() !== null;
}

export type User = {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
};

export async function getUserByEmail(email: string): Promise<User | null> {
  const supabase = getClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("flowtern_users")
    .select("id, email, password_hash, created_at")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();
  if (error || !data) return null;
  return data as User;
}

export type CreateUserResult = { user: User } | { error: string; code?: string };

export async function createUser(email: string, passwordHash: string): Promise<CreateUserResult> {
  const supabase = getClient();
  if (!supabase) return { error: "Database not configured.", code: "NO_CLIENT" };
  const { data, error } = await supabase
    .from("flowtern_users")
    .insert({ email: email.toLowerCase().trim(), password_hash: passwordHash })
    .select("id, email, password_hash, created_at")
    .single();
  if (error) {
    console.error("[createUser]", error.message, error.code, error.details);
    return { error: error.message, code: error.code ?? undefined };
  }
  return { user: data as User };
}

export async function getUserCount(): Promise<number> {
  const supabase = getClient();
  if (!supabase) return 0;
  const { count, error } = await supabase
    .from("flowtern_users")
    .select("id", { count: "exact", head: true });
  if (error) return 0;
  return count ?? 0;
}

export function isDbConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseServiceKey);
}

// Sessions: create and lookup by token
export async function createSession(userId: string): Promise<string | null> {
  const supabase = getClient();
  if (!supabase) return null;
  const token = crypto.randomUUID() + "-" + Math.random().toString(36).slice(2, 15);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const { error } = await supabase
    .from("flowtern_sessions")
    .insert({ user_id: userId, token, expires_at: expiresAt });
  if (error) return null;
  return token;
}

export async function getUserIdByToken(token: string | null): Promise<string | null> {
  if (!token?.trim()) return null;
  const supabase = getClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("flowtern_sessions")
    .select("user_id")
    .eq("token", token.trim())
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (error || !data) return null;
  return (data as { user_id: string }).user_id;
}

// Per-user data (enrollments, interviews, internships)
export async function getUserData(userId: string, dataKey: string): Promise<unknown> {
  const supabase = getClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("flowtern_user_data")
    .select("data")
    .eq("user_id", userId)
    .eq("data_key", dataKey)
    .maybeSingle();
  if (error || !data) return null;
  return (data as { data: unknown }).data;
}

export async function setUserData(userId: string, dataKey: string, value: unknown): Promise<boolean> {
  const supabase = getClient();
  if (!supabase) return false;
  const { error } = await supabase
    .from("flowtern_user_data")
    .upsert(
      { user_id: userId, data_key: dataKey, data: value ?? {}, updated_at: new Date().toISOString() },
      { onConflict: "user_id,data_key" }
    );
  return !error;
}
