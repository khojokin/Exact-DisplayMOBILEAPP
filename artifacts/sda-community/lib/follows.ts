import { supabase } from "@/lib/supabase";

export async function followUser(followerId: string, followingId: string): Promise<void> {
  const { error: followError } = await supabase
    .from("follows")
    .insert({ follower_id: followerId, following_id: followingId });
  if (followError && followError.code !== "23505") throw followError;

  await supabase.from("notifications").insert({
    user_id: followingId,
    actor_id: followerId,
    type: "follow",
    is_read: false,
  });
}

export async function unfollowUser(followerId: string, followingId: string): Promise<void> {
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", followingId);
  if (error) throw error;

  await supabase
    .from("notifications")
    .delete()
    .eq("user_id", followingId)
    .eq("actor_id", followerId)
    .eq("type", "follow");
}

export async function getFollowingIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId);
  if (error) throw error;
  return (data ?? []).map((row: any) => row.following_id as string);
}

export async function checkIsFollowing(followerId: string, followingId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", followerId)
    .eq("following_id", followingId);
  if (error) return false;
  return (count ?? 0) > 0;
}
