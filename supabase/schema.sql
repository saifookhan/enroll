-- Run this once in Supabase: SQL Editor → New query → paste and run.
-- Creates the table used by FlowTern login/register.

CREATE TABLE IF NOT EXISTS flowtern_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Optional: enable RLS and restrict access (your API uses the service role key, which bypasses RLS).
-- ALTER TABLE flowtern_users ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Service role only" ON flowtern_users FOR ALL USING (false);
