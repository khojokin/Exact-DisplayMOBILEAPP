import { buildConferenceUrl, buildLiveKitRoomName, resolveLiveKitAccessToken } from "@/lib/livekit";
import { supabase } from "@/lib/supabase";

export interface PodcastSession {
  id: string;
  title: string;
  roomCode: string;
  hostName: string;
  createdAt: string;
  status: "live" | "scheduled" | "ended";
}

export async function fetchPodcastSessions(limit = 60): Promise<PodcastSession[]> {
  const { data, error } = await supabase
    .from("podcast_sessions")
    .select("id, title, room_code, host_name, created_at, status")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    title: row.title ?? "Podcast Session",
    roomCode: row.room_code,
    hostName: row.host_name ?? "Host",
    createdAt: row.created_at,
    status: (row.status ?? "scheduled") as PodcastSession["status"],
  }));
}

export async function createPodcastSession(input: {
  title: string;
  hostName: string;
  hostIdentity: string;
}): Promise<PodcastSession> {
  const roomCode = buildLiveKitRoomName(`podcast-${input.title}`);

  const { data, error } = await supabase
    .from("podcast_sessions")
    .insert({
      title: input.title,
      room_code: roomCode,
      host_name: input.hostName,
      host_identity: input.hostIdentity,
      status: "live",
    })
    .select("id, title, room_code, host_name, created_at, status")
    .single();

  if (error) throw error;

  return {
    id: (data as any).id,
    title: (data as any).title,
    roomCode: (data as any).room_code,
    hostName: (data as any).host_name,
    createdAt: (data as any).created_at,
    status: (data as any).status,
  };
}

export async function resolvePodcastJoinUrl(input: {
  roomCode: string;
  userIdentity: string;
  userName?: string;
  asHost?: boolean;
}) {
  await resolveLiveKitAccessToken({
    roomCode: input.roomCode,
    identity: input.userIdentity,
    displayName: input.userName,
    metadata: { role: input.asHost ? "host" : "listener" },
  });

  return buildConferenceUrl(input.roomCode, Boolean(input.asHost));
}
