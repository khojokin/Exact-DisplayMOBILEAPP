-- =============================================================
-- SDA Community – Supabase Schema
-- Run this in your Supabase SQL Editor (Project → SQL Editor)
-- =============================================================

-- ── Shared helper: auto-update updated_at on every table ──────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ── profiles ──────────────────────────────────────────────────
-- id = Clerk user ID (e.g. "user_2abc123"), NOT a Supabase UUID.
-- This table is the single source of truth for user display data.
CREATE TABLE IF NOT EXISTS profiles (
  id             text PRIMARY KEY,          -- Clerk user ID
  full_name      text,
  username       text UNIQUE,
  bio            text,
  avatar_url     text,
  website        text,
  phone          text,
  is_private     boolean NOT NULL DEFAULT false,
  is_verified    boolean NOT NULL DEFAULT false,
  follower_count integer NOT NULL DEFAULT 0,
  following_count integer NOT NULL DEFAULT 0,
  post_count     integer NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- NOTE: RLS is intentionally left OFF for profiles because auth is
-- handled by Clerk (not Supabase Auth). Row-level security will not
-- work with auth.uid() here. Control writes via the service-role key
-- in your server/edge functions and rely on the anon key for reads.

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ── follows ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS follows (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id  text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (follower_id, following_id)
);
CREATE INDEX IF NOT EXISTS follows_follower_idx  ON follows(follower_id);
CREATE INDEX IF NOT EXISTS follows_following_idx ON follows(following_id);


-- ── posts ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content     text,
  media_urls  text[],
  media_type  text CHECK (media_type IN ('image', 'video', 'audio', 'none')) DEFAULT 'none',
  like_count  integer NOT NULL DEFAULT 0,
  comment_count integer NOT NULL DEFAULT 0,
  share_count integer NOT NULL DEFAULT 0,
  is_pinned   boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS posts_user_idx ON posts(user_id);
CREATE INDEX IF NOT EXISTS posts_created_idx ON posts(created_at DESC);

DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ── likes ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS likes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);
CREATE INDEX IF NOT EXISTS likes_post_idx ON likes(post_id);


-- ── comments ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id  uuid REFERENCES comments(id) ON DELETE CASCADE,
  content    text NOT NULL,
  like_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS comments_post_idx ON comments(post_id);

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ── subscriptions (Stripe-backed) ─────────────────────────────

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free','plus','premium')),
  stripe_customer_id text,
  stripe_subscription_id text,
  status text CHECK (status IN ('active','canceled','past_due','incomplete','trialing')),
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- NOTE: RLS disabled on subscriptions for same reason as profiles —
-- writes should come from your server/webhook using the service-role key.

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ── conversations / direct messages ───────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text DEFAULT 'Conversation',
  is_group    boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS conversation_participants (
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_read_at    timestamptz,
  joined_at       timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);
CREATE INDEX IF NOT EXISTS conversation_participants_user_idx ON conversation_participants(user_id);

CREATE TABLE IF NOT EXISTS messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content         text,
  media_url       text,
  media_type      text CHECK (media_type IN ('text','image','video','audio','voice')) DEFAULT 'text',
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS messages_conversation_idx ON messages(conversation_id, created_at DESC);


-- ── communities ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS communities (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  description  text,
  cover_url    text,
  is_private   boolean NOT NULL DEFAULT false,
  member_count integer NOT NULL DEFAULT 0,
  created_by   text REFERENCES profiles(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS update_communities_updated_at ON communities;
CREATE TRIGGER update_communities_updated_at
  BEFORE UPDATE ON communities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS community_members (
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id      text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role         text NOT NULL DEFAULT 'member' CHECK (role IN ('member','moderator','admin')),
  joined_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (community_id, user_id)
);


-- ── stories ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content     text,
  media_url   text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL DEFAULT (now() + interval '24 hours')
);
CREATE INDEX IF NOT EXISTS stories_expires_idx ON stories(expires_at DESC);
CREATE INDEX IF NOT EXISTS stories_user_idx ON stories(user_id);


-- ── notifications ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  actor_id   text REFERENCES profiles(id) ON DELETE SET NULL,
  type       text NOT NULL,
  target_id  text,
  is_read    boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_unread_idx ON notifications(user_id, is_read) WHERE is_read = false;


-- ── podcast_sessions ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS podcast_sessions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  room_code     text NOT NULL UNIQUE,
  host_name     text,
  host_identity text,
  status        text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('live','scheduled','ended')),
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS podcast_sessions_status_idx ON podcast_sessions(status, created_at DESC);


-- ── reports (moderation) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id   text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type   text NOT NULL CHECK (target_type IN ('post','comment','profile','message','community')),
  target_id     text NOT NULL,
  reason        text,
  status        text NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewing','resolved','dismissed')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  resolved_at   timestamptz,
  resolved_by   text REFERENCES profiles(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS reports_reporter_idx ON reports(reporter_id, created_at DESC);
CREATE INDEX IF NOT EXISTS reports_status_idx ON reports(status, created_at DESC);


-- ── admin_users ───────────────────────────────────────────────
-- A row here grants admin privileges to the Clerk user.
-- Bootstrapping: insert the first admin manually via SQL editor
-- using their Clerk user ID (e.g. "user_2abc123").
CREATE TABLE IF NOT EXISTS admin_users (
  user_id    text PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  role       text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin','super_admin','moderator')),
  granted_at timestamptz NOT NULL DEFAULT now(),
  granted_by text
);


-- ── app_config ────────────────────────────────────────────────
-- Public, NON-SECRET configuration the admin can edit at runtime.
-- DO NOT put Stripe sk_ keys, OpenAI keys, LiveKit API secrets,
-- or Supabase service-role keys in this table — they would be
-- readable by anyone with the anon key. Those belong in
-- Cloudflare Worker secrets / api-server env only.
--
-- This table is for: publishable keys, feature flags, URLs,
-- copy/text, and similar non-sensitive runtime config.
CREATE TABLE IF NOT EXISTS app_config (
  key          text PRIMARY KEY,
  value        jsonb NOT NULL DEFAULT '{}'::jsonb,
  description  text,
  category     text NOT NULL DEFAULT 'general',
  updated_at   timestamptz NOT NULL DEFAULT now(),
  updated_by   text REFERENCES profiles(id) ON DELETE SET NULL
);
DROP TRIGGER IF EXISTS update_app_config_updated_at ON app_config;
CREATE TRIGGER update_app_config_updated_at
  BEFORE UPDATE ON app_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed config rows so the admin screen has something to show.
-- Values can be edited from the admin panel at runtime.
INSERT INTO app_config (key, value, description, category) VALUES
  ('stripe_publishable_key',  '"pk_test_..."'::jsonb,                 'Stripe publishable key (safe to expose).',                              'payments'),
  ('livekit_url',             '"wss://your-project.livekit.cloud"'::jsonb, 'WebSocket URL of the LiveKit project (safe to expose).',          'calling'),
  ('livekit_token_endpoint',  '"https://sda-livekit-token.kingsfordkojo7.workers.dev/livekit/token"'::jsonb, 'Worker URL that mints LiveKit tokens.', 'calling'),
  ('feature_voice_messages',  'false'::jsonb,                          'Toggle voice-recording in DM.',                                        'features'),
  ('feature_live_streaming',  'false'::jsonb,                          'Toggle the Go Live button on the home tab.',                          'features'),
  ('feature_communities',     'true'::jsonb,                           'Toggle the Communities tab.',                                          'features')
ON CONFLICT (key) DO NOTHING;
