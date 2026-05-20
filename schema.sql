-- ============================================================
--  erha (SDA Community) – Full Database Schema
--  Generated: 2026-05-17
--  Engine: PostgreSQL 15+
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Enums ────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM (
  'member', 'deacon', 'elder', 'pastor', 'youth_leader', 'admin'
);

CREATE TYPE post_flair AS ENUM (
  'announcement', 'prayer', 'devotional',
  'testimony', 'question', 'discussion', 'event'
);

CREATE TYPE meeting_status AS ENUM (
  'scheduled', 'live', 'ended', 'cancelled'
);

CREATE TYPE notification_type AS ENUM (
  'like', 'comment', 'follow', 'mention',
  'meeting_invite', 'message', 'prayer_request'
);

-- ── Users ─────────────────────────────────────────────────────

CREATE TABLE users (
  id              SERIAL PRIMARY KEY,
  username        VARCHAR(50)  NOT NULL UNIQUE,
  email           VARCHAR(255) NOT NULL UNIQUE,
  password_hash   TEXT         NOT NULL,
  display_name    VARCHAR(100) NOT NULL,
  bio             TEXT,
  avatar_url      TEXT,
  role            user_role    NOT NULL DEFAULT 'member',
  is_verified     BOOLEAN      NOT NULL DEFAULT FALSE,
  church_branch   VARCHAR(150),
  reading_streak  INTEGER      NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email    ON users(email);

-- ── Follows ───────────────────────────────────────────────────

CREATE TABLE follows (
  id           SERIAL PRIMARY KEY,
  follower_id  INTEGER NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  following_id INTEGER NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (follower_id, following_id)
);

CREATE INDEX idx_follows_follower  ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);

-- ── Communities ───────────────────────────────────────────────

CREATE TABLE communities (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  slug          VARCHAR(100) NOT NULL UNIQUE,
  description   TEXT,
  icon_name     VARCHAR(50),
  color         VARCHAR(7),
  banner_url    TEXT,
  member_count  INTEGER      NOT NULL DEFAULT 0,
  created_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Community members ─────────────────────────────────────────

CREATE TABLE community_members (
  id           SERIAL PRIMARY KEY,
  community_id INTEGER NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id      INTEGER NOT NULL REFERENCES users(id)       ON DELETE CASCADE,
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (community_id, user_id)
);

CREATE INDEX idx_cm_community ON community_members(community_id);
CREATE INDEX idx_cm_user      ON community_members(user_id);

-- ── Posts ─────────────────────────────────────────────────────

CREATE TABLE posts (
  id            SERIAL PRIMARY KEY,
  author_id     INTEGER      NOT NULL REFERENCES users(id)       ON DELETE CASCADE,
  community_id  INTEGER              REFERENCES communities(id)  ON DELETE SET NULL,
  content       TEXT         NOT NULL,
  flair         post_flair,
  image_url     TEXT,
  upvotes       INTEGER      NOT NULL DEFAULT 0,
  downvotes     INTEGER      NOT NULL DEFAULT 0,
  comment_count INTEGER      NOT NULL DEFAULT 0,
  is_pinned     BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_posts_author    ON posts(author_id);
CREATE INDEX idx_posts_community ON posts(community_id);
CREATE INDEX idx_posts_created   ON posts(created_at DESC);

-- ── Votes ─────────────────────────────────────────────────────

CREATE TABLE votes (
  id         SERIAL PRIMARY KEY,
  post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  value      SMALLINT NOT NULL CHECK (value IN (1, -1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, user_id)
);

-- ── Comments ──────────────────────────────────────────────────

CREATE TABLE comments (
  id         SERIAL PRIMARY KEY,
  post_id    INTEGER NOT NULL REFERENCES posts(id)    ON DELETE CASCADE,
  author_id  INTEGER NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  parent_id  INTEGER          REFERENCES comments(id) ON DELETE CASCADE,
  content    TEXT    NOT NULL,
  upvotes    INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comments_post   ON comments(post_id);
CREATE INDEX idx_comments_author ON comments(author_id);

-- ── Saved posts ───────────────────────────────────────────────

CREATE TABLE saved_posts (
  id       SERIAL PRIMARY KEY,
  user_id  INTEGER NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  post_id  INTEGER NOT NULL REFERENCES posts(id)  ON DELETE CASCADE,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, post_id)
);

-- ── Conversations ─────────────────────────────────────────────

CREATE TABLE conversations (
  id            SERIAL PRIMARY KEY,
  is_group      BOOLEAN      NOT NULL DEFAULT FALSE,
  group_name    VARCHAR(100),
  group_color   VARCHAR(7),
  created_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Conversation participants ──────────────────────────────────

CREATE TABLE conversation_participants (
  id              SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         INTEGER NOT NULL REFERENCES users(id)         ON DELETE CASCADE,
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_read_at    TIMESTAMPTZ,
  UNIQUE (conversation_id, user_id)
);

CREATE INDEX idx_cp_conversation ON conversation_participants(conversation_id);
CREATE INDEX idx_cp_user         ON conversation_participants(user_id);

-- ── Messages ──────────────────────────────────────────────────

CREATE TABLE messages (
  id              SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       INTEGER NOT NULL REFERENCES users(id)         ON DELETE SET NULL,
  content         TEXT    NOT NULL,
  image_url       TEXT,
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender       ON messages(sender_id);
CREATE INDEX idx_messages_created      ON messages(created_at DESC);

-- ── Meetings ──────────────────────────────────────────────────

CREATE TABLE meetings (
  id           SERIAL PRIMARY KEY,
  title        VARCHAR(200) NOT NULL,
  description  TEXT,
  host_id      INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  meeting_code VARCHAR(20)  NOT NULL UNIQUE,
  passcode     VARCHAR(20),
  status       meeting_status NOT NULL DEFAULT 'scheduled',
  scheduled_at TIMESTAMPTZ,
  started_at   TIMESTAMPTZ,
  ended_at     TIMESTAMPTZ,
  is_recorded  BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meetings_host      ON meetings(host_id);
CREATE INDEX idx_meetings_scheduled ON meetings(scheduled_at);

-- ── Meeting participants ───────────────────────────────────────

CREATE TABLE meeting_participants (
  id         SERIAL PRIMARY KEY,
  meeting_id INTEGER NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  is_muted   BOOLEAN NOT NULL DEFAULT FALSE,
  has_video  BOOLEAN NOT NULL DEFAULT TRUE,
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at    TIMESTAMPTZ,
  UNIQUE (meeting_id, user_id)
);

-- ── Church events ─────────────────────────────────────────────

CREATE TABLE church_events (
  id            SERIAL PRIMARY KEY,
  title         VARCHAR(200) NOT NULL,
  description   TEXT,
  location      VARCHAR(255),
  starts_at     TIMESTAMPTZ  NOT NULL,
  ends_at       TIMESTAMPTZ,
  color         VARCHAR(7),
  created_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_starts ON church_events(starts_at);

-- ── Notifications ─────────────────────────────────────────────

CREATE TABLE notifications (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER           NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  actor_id    INTEGER                    REFERENCES users(id)    ON DELETE SET NULL,
  type        notification_type NOT NULL,
  post_id     INTEGER                    REFERENCES posts(id)    ON DELETE CASCADE,
  comment_id  INTEGER                    REFERENCES comments(id) ON DELETE CASCADE,
  meeting_id  INTEGER                    REFERENCES meetings(id) ON DELETE CASCADE,
  is_read     BOOLEAN           NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user    ON notifications(user_id);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ── Stories ───────────────────────────────────────────────────

CREATE TABLE stories (
  id          SERIAL PRIMARY KEY,
  author_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  media_url   TEXT    NOT NULL,
  caption     TEXT,
  expires_at  TIMESTAMPTZ NOT NULL,
  view_count  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stories_author  ON stories(author_id);
CREATE INDEX idx_stories_expires ON stories(expires_at);

-- ── AI chat history ───────────────────────────────────────────

CREATE TABLE ai_chats (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role       VARCHAR(10) NOT NULL CHECK (role IN ('user', 'ai')),
  content    TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_chats_user ON ai_chats(user_id);

-- ── Auto-update updated_at trigger ────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Seed data (development) ───────────────────────────────────

INSERT INTO users (username, email, password_hash, display_name, role, is_verified, church_branch)
VALUES
  ('pastor_james',   'james@sdacommunity.app',  crypt('password', gen_salt('bf')), 'Pastor James Osei',   'pastor',      TRUE,  'Main Sanctuary'),
  ('elder_ruth',     'ruth@sdacommunity.app',   crypt('password', gen_salt('bf')), 'Elder Ruth Nakamura', 'elder',       TRUE,  'Main Sanctuary'),
  ('grace_ade',      'grace@sdacommunity.app',  crypt('password', gen_salt('bf')), 'Grace Adetokunbo',    'youth_leader',FALSE, 'Youth Wing'),
  ('david_mensah',   'david@sdacommunity.app',  crypt('password', gen_salt('bf')), 'David Mensah',        'deacon',      FALSE, 'Main Sanctuary'),
  ('samuel_boateng', 'samuel@sdacommunity.app', crypt('password', gen_salt('bf')), 'Samuel Boateng',      'member',      FALSE, 'East Branch'),
  ('maria_santos',   'maria@sdacommunity.app',  crypt('password', gen_salt('bf')), 'Maria Santos',        'member',      FALSE, 'Main Sanctuary');

INSERT INTO communities (name, slug, description, color, member_count)
VALUES
  ('SDA Community',          'sda-community',         'The main Seventh-day Adventist community hub.',      '#6B7B5A', 12400),
  ('SDA Youth Network',      'sda-youth',             'A space for young Adventists to connect and grow.',  '#3B5BDB', 3200),
  ('Prayer Warriors',        'prayer-warriors',       'Daily intercessory prayer and requests.',            '#6B4F9B', 1800),
  ('SDA Music Ministry',     'sda-music',             'Worship, hymns, and music for the glory of God.',   '#8B3A8B', 940),
  ('Sabbath School Teachers','sabbath-school-teachers','Resources and discussions for SS teachers.',        '#B8860B', 620),
  ('Health & Wellness',      'health-wellness',       'Living the Adventist health message.',               '#0E7B5B', 1100);

INSERT INTO posts (author_id, community_id, content, flair, upvotes, comment_count)
VALUES
  (1, 1, 'Sabbath Service this week will be held at our main sanctuary at 9:30 AM.',       'announcement', 78,  14),
  (2, 1, 'Please pray for my mother who is going in for surgery tomorrow morning.',         'prayer',       45,   8),
  (2, 1, '"Be still and know that I am God" (Psalm 46:10). A beautiful reminder today.',   'devotional',  134,  22),
  (3, 1, 'Our children''s ministry is looking for Sabbath School teachers!',               'announcement', 56,  11),
  (5, 1, '"I can do all things through Christ who strengthens me" – Philippians 4:13.',    'devotional',  210,  31);
