-- CF deepen Phase 5 — apply with wrangler d1 migrations when binding exists.
-- Mirrors src/lib/social-store.ts + agent profile overrides.

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'agent', 'guest')),
  name TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  target_type TEXT NOT NULL DEFAULT 'listing',
  target_id TEXT NOT NULL,
  body TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ratings (
  id TEXT PRIMARY KEY,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  quote TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS verified_clients (
  email TEXT PRIMARY KEY,
  verified_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS agent_profiles (
  email TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  role_title TEXT,
  bio TEXT,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_comments_target ON comments (target_id);
CREATE INDEX IF NOT EXISTS idx_ratings_target ON ratings (target_id);
