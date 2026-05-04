-- Wipe all application rows; keeps tables, indexes, and alembic_version.
-- Run in Supabase SQL editor or psql. If a table does not exist yet, skip that line.
-- Order: children before parents.

BEGIN;

TRUNCATE TABLE
  post_votes,
  replies,
  posts,
  messages,
  mood_check_ins,
  user_follows,
  users
RESTART IDENTITY CASCADE;

-- Optional: only if this table exists in your DB (from migration 20260503_06):
-- TRUNCATE TABLE follow_requests RESTART IDENTITY CASCADE;

COMMIT;
