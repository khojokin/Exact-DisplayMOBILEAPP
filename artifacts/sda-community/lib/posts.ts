import { supabase } from "@/lib/supabase";

export type PostMediaType = "image" | "video";

export interface FeedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  caption: string;
  mediaType: PostMediaType;
  mediaPath: string;
  mediaUrl: string;
  createdAt: string;
}

interface DbPost {
  id: string;
  user_id: string;
  content: string | null;
  media_urls: string[] | null;
  media_type: PostMediaType | null;
  created_at: string;
}

interface DbProfile {
  id: string;
  display_name?: string | null;
  full_name?: string | null;
  username?: string | null;
  avatar_url?: string | null;
}

const POSTS_BUCKET = (process.env.EXPO_PUBLIC_SUPABASE_POSTS_BUCKET ?? "post-media").trim() || "post-media";

function shortUser(userId: string) {
  if (!userId) return "Member";
  return `Member ${userId.slice(0, 6)}`;
}

function resolveExtension(fileName: string | null | undefined, mimeType: string | null | undefined, fallback: PostMediaType) {
  const fromName = fileName?.split(".").pop()?.toLowerCase();
  if (fromName) return fromName;

  if (mimeType?.includes("jpeg")) return "jpg";
  if (mimeType?.includes("png")) return "png";
  if (mimeType?.includes("heic")) return "heic";
  if (mimeType?.includes("mp4")) return "mp4";
  if (mimeType?.includes("quicktime")) return "mov";

  return fallback === "video" ? "mp4" : "jpg";
}

function getPublicUrl(path: string) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const { data } = supabase.storage.from(POSTS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function getProfileMap(userIds: string[]) {
  if (!userIds.length) return new Map<string, DbProfile>();

  const { data, error } = await supabase
    .from("profiles")
    .select("id,display_name,full_name,username,avatar_url")
    .in("id", userIds);

  if (error || !data) return new Map<string, DbProfile>();

  return new Map((data as DbProfile[]).map((profile) => [profile.id, profile]));
}

function toFeedPost(row: DbPost, profile?: DbProfile): FeedPost {
  const authorName = profile?.display_name || profile?.full_name || profile?.username || shortUser(row.user_id);
  const firstUrl = row.media_urls?.[0] ?? "";
  const mediaType: PostMediaType = row.media_type ?? (firstUrl.match(/\.(mp4|mov|avi)$/i) ? "video" : "image");

  return {
    id: row.id,
    authorId: row.user_id,
    authorName,
    authorAvatarUrl: profile?.avatar_url ?? undefined,
    caption: row.content ?? "",
    mediaType,
    mediaPath: firstUrl,
    mediaUrl: getPublicUrl(firstUrl),
    createdAt: row.created_at,
  };
}

export async function fetchRecentPosts(limit = 40): Promise<FeedPost[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("id,user_id,content,media_type,media_urls,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  const rows = (data ?? []) as DbPost[];
  const userIds = Array.from(new Set(rows.map((row) => row.user_id)));
  const profileMap = await getProfileMap(userIds);

  return rows.map((row) => toFeedPost(row, profileMap.get(row.user_id)));
}

export async function fetchPostsByUserId(userId: string, limit = 120): Promise<FeedPost[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("id,user_id,content,media_type,media_urls,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  const rows = (data ?? []) as DbPost[];
  const profileMap = await getProfileMap([userId]);

  return rows.map((row) => toFeedPost(row, profileMap.get(row.user_id)));
}

export async function uploadPostMedia(params: {
  userId: string;
  uri: string;
  mimeType?: string | null;
  fileName?: string | null;
  mediaType: PostMediaType;
}) {
  const extension = resolveExtension(params.fileName, params.mimeType, params.mediaType);
  const path = `${params.userId}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;

  const response = await fetch(params.uri);
  const blob = await response.blob();

  const { error } = await supabase.storage.from(POSTS_BUCKET).upload(path, blob, {
    cacheControl: "3600",
    contentType: params.mimeType ?? undefined,
    upsert: false,
  });

  if (error) throw error;

  return path;
}

export async function createPost(params: {
  userId: string;
  caption: string;
  mediaType: PostMediaType;
  mediaPath: string;
}) {
  const { data, error } = await supabase
    .from("posts")
    .insert({
      user_id: params.userId,
      content: params.caption,
      media_type: params.mediaType,
      media_urls: params.mediaPath ? [params.mediaPath] : [],
    })
    .select("id,user_id,content,media_type,media_urls,created_at")
    .single();

  if (error) throw error;

  return data as DbPost;
}
