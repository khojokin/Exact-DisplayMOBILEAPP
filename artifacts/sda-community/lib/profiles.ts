import { supabase } from "@/lib/supabase";

export interface AppProfile {
  id: string;
  fullName: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
}

function normalize(text: string) {
  return text.trim().toLowerCase();
}

export async function fetchProfileById(userId: string): Promise<AppProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,full_name,username,bio,avatar_url")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: (data as any).id,
    fullName: (data as any).full_name ?? "Member",
    username: (data as any).username ?? undefined,
    bio: (data as any).bio ?? undefined,
    avatarUrl: (data as any).avatar_url ?? undefined,
  };
}

export async function fetchProfileByNameOrId(input: string): Promise<AppProfile | null> {
  const normalized = normalize(input);

  const byId = await fetchProfileById(input);
  if (byId) return byId;

  const { data, error } = await supabase
    .from("profiles")
    .select("id,full_name,username,bio,avatar_url")
    .or(`full_name.ilike.%${normalized}%,username.ilike.%${normalized}%`)
    .limit(20);

  if (error) throw error;

  const rows = (data ?? []) as any[];
  if (!rows.length) return null;

  const exact =
    rows.find((row) => normalize(row.full_name ?? "") === normalized) ||
    rows.find((row) => normalize(row.username ?? "") === normalized) ||
    rows[0];

  return {
    id: exact.id,
    fullName: exact.full_name ?? "Member",
    username: exact.username ?? undefined,
    bio: exact.bio ?? undefined,
    avatarUrl: exact.avatar_url ?? undefined,
  };
}

export interface ProfileUpsertInput {
  id: string;
  fullName?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
}

// Idempotent upsert keyed by Clerk user ID. Safe to call on every app launch.
// Only fills empty columns on conflict so an existing username/bio isn't overwritten.
export async function upsertProfile(input: ProfileUpsertInput): Promise<void> {
  if (!input.id) return;

  const payload = {
    id: input.id,
    full_name: input.fullName?.trim() || null,
    username: input.username?.trim() || null,
    avatar_url: input.avatarUrl || null,
  };

  const { error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id", ignoreDuplicates: false });

  if (error) throw error;
}

export async function fetchSuggestedProfiles(excludeIds: string[], limit = 12): Promise<AppProfile[]> {
  const query = supabase
    .from("profiles")
    .select("id,full_name,username,bio,avatar_url")
    .order("created_at", { ascending: false })
    .limit(limit + excludeIds.length);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? [])
    .filter((row: any) => !excludeIds.includes(row.id))
    .slice(0, limit)
    .map((row: any) => ({
      id: row.id,
      fullName: row.full_name ?? "Member",
      username: row.username ?? undefined,
      bio: row.bio ?? undefined,
      avatarUrl: row.avatar_url ?? undefined,
    }));
}
