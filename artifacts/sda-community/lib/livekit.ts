export const LIVEKIT_URL = (process.env.EXPO_PUBLIC_LIVEKIT_URL ?? "").trim();
export const LIVEKIT_TOKEN = (process.env.EXPO_PUBLIC_LIVEKIT_TOKEN ?? "").trim();
export const LIVEKIT_TOKEN_ENDPOINT = (process.env.EXPO_PUBLIC_LIVEKIT_TOKEN_ENDPOINT ?? "").trim();
const LIVEKIT_ROOM_PREFIX = (process.env.EXPO_PUBLIC_LIVEKIT_ROOM_PREFIX ?? "SDACommunity").trim();

function normalizeRoomCode(value: string) {
  return value.trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "");
}

export function buildLiveKitRoomName(roomCodeRaw: string) {
  const roomCode = normalizeRoomCode(roomCodeRaw);
  if (!roomCode) return "";
  return `${LIVEKIT_ROOM_PREFIX}-${roomCode}`;
}

export function getLiveKitServerUrl() {
  return LIVEKIT_URL || undefined;
}

function buildLiveKitUrl(roomCode: string, audioOnly: boolean) {
  const encodedWsUrl = encodeURIComponent(LIVEKIT_URL);
  const encodedRoom = encodeURIComponent(`${LIVEKIT_ROOM_PREFIX}-${roomCode}`);
  const encodedToken = encodeURIComponent(LIVEKIT_TOKEN);

  const base = `https://meet.livekit.io/custom?liveKitUrl=${encodedWsUrl}&room=${encodedRoom}&token=${encodedToken}`;
  return audioOnly ? `${base}&audio=true` : `${base}&audio=false`;
}

export function buildJitsiMeetingUrl(roomCode: string, audioOnly: boolean) {
  const base = `https://meet.jit.si/${LIVEKIT_ROOM_PREFIX}-${roomCode}`;
  const hash = audioOnly
    ? "#config.startWithVideoMuted=true&config.prejoinPageEnabled=true"
    : "#config.startWithVideoMuted=false&config.prejoinPageEnabled=true";
  return `${base}${hash}`;
}

export function buildConferenceUrl(roomCodeRaw: string, audioOnly: boolean) {
  const roomCode = normalizeRoomCode(roomCodeRaw);
  if (!roomCode) return "";

  if (LIVEKIT_URL && LIVEKIT_TOKEN) {
    return buildLiveKitUrl(roomCode, audioOnly);
  }

  return buildJitsiMeetingUrl(roomCode, audioOnly);
}

export function isLiveKitConfigured() {
  return Boolean(LIVEKIT_URL && (LIVEKIT_TOKEN || LIVEKIT_TOKEN_ENDPOINT));
}

type LiveKitTokenRequest = {
  roomCode: string;
  identity: string;
  displayName?: string;
  metadata?: Record<string, unknown>;
};

export async function resolveLiveKitAccessToken({
  roomCode,
  identity,
  displayName,
  metadata,
}: LiveKitTokenRequest) {
  if (!LIVEKIT_URL) {
    throw new Error("Missing EXPO_PUBLIC_LIVEKIT_URL");
  }

  const roomName = buildLiveKitRoomName(roomCode);
  if (!roomName) {
    throw new Error("Could not build room name");
  }

  if (LIVEKIT_TOKEN_ENDPOINT) {
    const response = await fetch(LIVEKIT_TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        room: roomName,
        identity,
        name: displayName,
        metadata,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token endpoint failed (${response.status})`);
    }

    const payload = (await response.json()) as {
      token?: string;
      accessToken?: string;
    };

    const token = payload.token ?? payload.accessToken;
    if (!token) {
      throw new Error("Token endpoint returned no token");
    }

    return { token, roomName, serverUrl: LIVEKIT_URL };
  }

  if (!LIVEKIT_TOKEN) {
    throw new Error("Missing EXPO_PUBLIC_LIVEKIT_TOKEN or EXPO_PUBLIC_LIVEKIT_TOKEN_ENDPOINT");
  }

  return {
    token: LIVEKIT_TOKEN,
    roomName,
    serverUrl: LIVEKIT_URL,
  };
}
