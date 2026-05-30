-- Church Social production schema for Supabase Postgres
-- Run in Supabase SQL editor.

create extension if not exists pgcrypto;

-- Enum types
create type public.media_type as enum ('image', 'video');
create type public.notification_type as enum ('like', 'comment', 'follow', 'message', 'announcement', 'event');
create type public.church_role as enum ('member', 'elder', 'pastor', 'admin', 'moderator');

-- USERS
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  display_name text not null,
  bio text default ''::text,
  avatar_url text,
  verified boolean not null default false,
  church_role public.church_role not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint username_len check (char_length(username) between 3 and 30),
  constraint username_format check (username ~ '^[A-Za-z0-9_\.]+$')
);

create unique index if not exists users_username_ci_key on public.users (lower(username));

-- POSTS
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  caption text default ''::text,
  media_type public.media_type not null,
  media_path text not null,
  media_blurhash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_user_id_idx on public.posts(user_id);
create index if not exists posts_created_at_idx on public.posts(created_at desc);

-- COMMENTS
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint comment_len check (char_length(body) between 1 and 1000)
);

create index if not exists comments_post_id_idx on public.comments(post_id);

-- LIKES
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

-- BOOKMARKS
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

-- FOLLOWS
create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.users(id) on delete cascade,
  following_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint no_self_follow check (follower_id <> following_id),
  unique (follower_id, following_id)
);

create index if not exists follows_follower_idx on public.follows(follower_id);
create index if not exists follows_following_idx on public.follows(following_id);

-- MESSAGES
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.users(id) on delete cascade,
  receiver_id uuid not null references public.users(id) on delete cascade,
  body text,
  media_path text,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint message_body_or_media check (
    (body is not null and char_length(body) > 0) or media_path is not null
  )
);

create index if not exists messages_thread_idx on public.messages(sender_id, receiver_id, created_at desc);

-- NOTIFICATIONS
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  actor_id uuid references public.users(id) on delete set null,
  notification_type public.notification_type not null,
  entity_id uuid,
  message text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx on public.notifications(user_id, created_at desc);

-- CHURCH EVENTS
create table if not exists public.church_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  livestream_url text,
  created_by uuid not null references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint valid_event_time check (ends_at is null or ends_at >= starts_at)
);

-- PRAYER REQUESTS
create table if not exists public.prayer_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  body text not null,
  is_anonymous boolean not null default false,
  is_answered boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- REPORTS (moderation)
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.users(id) on delete cascade,
  target_user_id uuid references public.users(id) on delete set null,
  target_post_id uuid references public.posts(id) on delete set null,
  reason text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

-- ANNOUNCEMENTS (admin)
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  created_by uuid not null references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Realtime publication
alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.likes;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;

-- Helpers
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.users u
    where u.id = uid and u.church_role in ('admin', 'moderator', 'pastor')
  );
$$;

-- Trigger for updated_at
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_touch_updated_at on public.users;
create trigger users_touch_updated_at before update on public.users
for each row execute function public.touch_updated_at();

drop trigger if exists posts_touch_updated_at on public.posts;
create trigger posts_touch_updated_at before update on public.posts
for each row execute function public.touch_updated_at();

drop trigger if exists prayer_touch_updated_at on public.prayer_requests;
create trigger prayer_touch_updated_at before update on public.prayer_requests
for each row execute function public.touch_updated_at();

-- Enable RLS
alter table public.users enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.bookmarks enable row level security;
alter table public.follows enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.church_events enable row level security;
alter table public.prayer_requests enable row level security;
alter table public.reports enable row level security;
alter table public.announcements enable row level security;

-- USERS policies
create policy users_select_public on public.users
for select to authenticated
using (true);

create policy users_insert_self on public.users
for insert to authenticated
with check (auth.uid() = id);

create policy users_update_self on public.users
for update to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- POSTS policies
create policy posts_select_auth on public.posts
for select to authenticated
using (true);

create policy posts_insert_self on public.posts
for insert to authenticated
with check (auth.uid() = user_id);

create policy posts_update_owner_or_admin on public.posts
for update to authenticated
using (auth.uid() = user_id or public.is_admin(auth.uid()))
with check (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy posts_delete_owner_or_admin on public.posts
for delete to authenticated
using (auth.uid() = user_id or public.is_admin(auth.uid()));

-- COMMENTS policies
create policy comments_select_auth on public.comments
for select to authenticated
using (true);

create policy comments_insert_self on public.comments
for insert to authenticated
with check (auth.uid() = user_id);

create policy comments_delete_owner_or_admin on public.comments
for delete to authenticated
using (auth.uid() = user_id or public.is_admin(auth.uid()));

-- LIKES policies
create policy likes_select_auth on public.likes
for select to authenticated
using (true);

create policy likes_insert_self on public.likes
for insert to authenticated
with check (auth.uid() = user_id);

create policy likes_delete_self on public.likes
for delete to authenticated
using (auth.uid() = user_id);

-- BOOKMARKS policies
create policy bookmarks_select_own on public.bookmarks
for select to authenticated
using (auth.uid() = user_id);

create policy bookmarks_insert_self on public.bookmarks
for insert to authenticated
with check (auth.uid() = user_id);

create policy bookmarks_delete_self on public.bookmarks
for delete to authenticated
using (auth.uid() = user_id);

-- FOLLOWS policies
create policy follows_select_auth on public.follows
for select to authenticated
using (true);

create policy follows_insert_self on public.follows
for insert to authenticated
with check (auth.uid() = follower_id);

create policy follows_delete_self on public.follows
for delete to authenticated
using (auth.uid() = follower_id);

-- MESSAGES policies
create policy messages_select_participants on public.messages
for select to authenticated
using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy messages_insert_sender on public.messages
for insert to authenticated
with check (auth.uid() = sender_id);

create policy messages_update_receiver on public.messages
for update to authenticated
using (auth.uid() = receiver_id)
with check (auth.uid() = receiver_id);

-- NOTIFICATIONS policies
create policy notifications_select_own on public.notifications
for select to authenticated
using (auth.uid() = user_id);

create policy notifications_update_own on public.notifications
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- CHURCH EVENTS policies
create policy events_select_auth on public.church_events
for select to authenticated
using (true);

create policy events_insert_admin on public.church_events
for insert to authenticated
with check (public.is_admin(auth.uid()) and created_by = auth.uid());

create policy events_update_admin on public.church_events
for update to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy events_delete_admin on public.church_events
for delete to authenticated
using (public.is_admin(auth.uid()));

-- PRAYER REQUEST policies
create policy prayer_select_auth on public.prayer_requests
for select to authenticated
using (true);

create policy prayer_insert_self on public.prayer_requests
for insert to authenticated
with check (auth.uid() = user_id);

create policy prayer_update_owner_or_admin on public.prayer_requests
for update to authenticated
using (auth.uid() = user_id or public.is_admin(auth.uid()))
with check (auth.uid() = user_id or public.is_admin(auth.uid()));

-- REPORTS policies
create policy reports_insert_auth on public.reports
for insert to authenticated
with check (auth.uid() = reporter_id);

create policy reports_select_admin on public.reports
for select to authenticated
using (public.is_admin(auth.uid()));

-- ANNOUNCEMENTS policies
create policy announcements_select_auth on public.announcements
for select to authenticated
using (true);

create policy announcements_insert_admin on public.announcements
for insert to authenticated
with check (public.is_admin(auth.uid()) and created_by = auth.uid());

create policy announcements_update_admin on public.announcements
for update to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy announcements_delete_admin on public.announcements
for delete to authenticated
using (public.is_admin(auth.uid()));
