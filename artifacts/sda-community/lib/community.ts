import { fetchRecentPosts } from "@/lib/posts";
import { supabase } from "@/lib/supabase";

export interface CommunityItem {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  createdAt: string;
}

export interface CommunityPostItem {
  id: string;
  authorName: string;
  authorAvatarUrl?: string;
  caption: string;
  createdAt: string;
  mediaType: "image" | "video";
  mediaUrl?: string;
}

export async function fetchCommunities(limit = 40): Promise<CommunityItem[]> {
  const { data, error } = await supabase
    .from("communities")
    .select("id, name, description, member_count, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  // If the table doesn't exist yet, return empty list rather than crashing
  if (error) return [];

  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name ?? "Community",
    description: row.description ?? "",
    memberCount: row.member_count ?? 0,
    createdAt: row.created_at,
  }));
}

export async function fetchCommunityFeed(limit = 80): Promise<CommunityPostItem[]> {
  const posts = await fetchRecentPosts(limit);

  return posts.map((post) => ({
    id: post.id,
    authorName: post.authorName,
    authorAvatarUrl: post.authorAvatarUrl,
    caption: post.caption,
    createdAt: post.createdAt,
    mediaType: post.mediaType,
    mediaUrl: post.mediaUrl,
  }));
}
