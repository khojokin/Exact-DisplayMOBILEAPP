import { supabase } from "@/lib/supabase";

export interface StoryItem {
  id: string;
  userId: string;
  content: string;
  mediaUrl?: string;
  createdAt: string;
  expiresAt?: string;
  authorName: string;
  authorAvatarUrl?: string;
}

export async function fetchRecentStories(limit = 50): Promise<StoryItem[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("stories")
    .select("id, user_id, content, media_url, created_at, expires_at")
    .gt("expires_at", now)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  const rows = data ?? [];
  const userIds = Array.from(new Set(rows.map((row: any) => row.user_id).filter(Boolean)));

  const { data: profiles } = userIds.length
    ? await supabase.from("profiles").select("id, full_name, avatar_url").in("id", userIds)
    : { data: [] as any[] };

  const nameMap = new Map<string, { fullName: string; avatarUrl?: string }>();
  for (const profile of profiles ?? []) {
    nameMap.set((profile as any).id, {
      fullName: (profile as any).full_name ?? "Member",
      avatarUrl: (profile as any).avatar_url ?? undefined,
    });
  }

  return rows.map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    content: row.content ?? "",
    mediaUrl: row.media_url ?? undefined,
    createdAt: row.created_at,
    expiresAt: row.expires_at ?? undefined,
    authorName: nameMap.get(row.user_id)?.fullName ?? "Member",
    authorAvatarUrl: nameMap.get(row.user_id)?.avatarUrl,
  }));
}

export async function fetchStoryById(storyId: string): Promise<StoryItem | null> {
  const { data: story, error } = await supabase
    .from("stories")
    .select("id, user_id, content, media_url, created_at, expires_at")
    .eq("id", storyId)
    .maybeSingle();

  if (error) throw error;
  if (!story) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", (story as any).user_id)
    .maybeSingle();

  return {
    id: (story as any).id,
    userId: (story as any).user_id,
    content: (story as any).content ?? "",
    mediaUrl: (story as any).media_url ?? undefined,
    createdAt: (story as any).created_at,
    expiresAt: (story as any).expires_at ?? undefined,
    authorName: (profile as any)?.full_name ?? "Member",
    authorAvatarUrl: (profile as any)?.avatar_url ?? undefined,
  };
}
