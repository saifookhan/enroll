-- Run this once in Supabase: SQL Editor → New query → paste and run.
-- Creates tables for FlowTern: users, sessions, and per-user data.

CREATE TABLE IF NOT EXISTS flowtern_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS flowtern_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES flowtern_users(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days')
);

CREATE TABLE IF NOT EXISTS flowtern_user_data (
  user_id uuid NOT NULL REFERENCES flowtern_users(id) ON DELETE CASCADE,
  data_key text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, data_key)
);

CREATE INDEX IF NOT EXISTS flowtern_sessions_token_idx ON flowtern_sessions(token);
CREATE INDEX IF NOT EXISTS flowtern_sessions_expires_at_idx ON flowtern_sessions(expires_at);
