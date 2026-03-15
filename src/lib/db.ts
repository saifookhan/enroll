import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

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

export async function createUser(email: string, passwordHash: string): Promise<User | null> {
  const supabase = getClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("flowtern_users")
    .insert({ email: email.toLowerCase().trim(), password_hash: passwordHash })
    .select("id, email, password_hash, created_at")
    .single();
  if (error) return null;
  return data as User;
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
