export interface Env {
  LIVEKIT_API_KEY: string;
  LIVEKIT_API_SECRET: string;
  LIVEKIT_TOKEN_TTL_SECONDS?: string;
  ALLOWED_ORIGIN?: string;
}

const DEFAULT_TTL_SECONDS = 3600;

function corsHeaders(origin: string | null, allowed: string | undefined) {
  const allowOrigin = !allowed || allowed === "*" ? (origin ?? "*") : allowed;
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  } as Record<string, string>;
}

function base64UrlFromBytes(bytes: ArrayBuffer | Uint8Array) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (let i = 0; i < view.byteLength; i += 1) {
    binary += String.fromCharCode(view[i]!);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlFromString(input: string) {
  return base64UrlFromBytes(new TextEncoder().encode(input));
}

async function signJwtHS256(payload: Record<string, unknown>, secret: string) {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlFromString(JSON.stringify(header));
  const encodedPayload = base64UrlFromString(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signingInput),
  );

  return `${signingInput}.${base64UrlFromBytes(signature)}`;
}

type TokenRequestBody = {
  room?: unknown;
  identity?: unknown;
  name?: unknown;
  metadata?: unknown;
};

function json(body: unknown, init: ResponseInit, headers: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const cors = corsHeaders(origin, env.ALLOWED_ORIGIN);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname === "/health" && request.method === "GET") {
      return json({ ok: true, service: "livekit-worker" }, { status: 200 }, cors);
    }

    if (url.pathname !== "/livekit/token") {
      return json({ error: "Not found" }, { status: 404 }, cors);
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, { status: 405 }, cors);
    }

    if (!env.LIVEKIT_API_KEY || !env.LIVEKIT_API_SECRET) {
      return json(
        { error: "Worker is missing LIVEKIT_API_KEY or LIVEKIT_API_SECRET secrets." },
        { status: 500 },
        cors,
      );
    }

    let body: TokenRequestBody;
    try {
      body = (await request.json()) as TokenRequestBody;
    } catch {
      return json({ error: "Body must be JSON." }, { status: 400 }, cors);
    }

    const room = typeof body.room === "string" ? body.room.trim() : "";
    const identity = typeof body.identity === "string" ? body.identity.trim() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!room) return json({ error: "room is required." }, { status: 400 }, cors);
    if (!identity) return json({ error: "identity is required." }, { status: 400 }, cors);

    const ttlRaw = Number(env.LIVEKIT_TOKEN_TTL_SECONDS ?? DEFAULT_TTL_SECONDS);
    const ttl = Number.isFinite(ttlRaw) && ttlRaw > 0 ? ttlRaw : DEFAULT_TTL_SECONDS;
    const now = Math.floor(Date.now() / 1000);

    const payload: Record<string, unknown> = {
      iss: env.LIVEKIT_API_KEY,
      sub: identity,
      nbf: now - 10,
      exp: now + ttl,
      video: {
        roomJoin: true,
        room,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
      },
    };

    if (name) payload.name = name;
    if (body.metadata !== undefined) {
      payload.metadata =
        typeof body.metadata === "string" ? body.metadata : JSON.stringify(body.metadata);
    }

    try {
      const token = await signJwtHS256(payload, env.LIVEKIT_API_SECRET);
      return json({ token, room, identity }, { status: 200 }, cors);
    } catch (error) {
      return json(
        { error: (error as Error)?.message ?? "Failed to mint LiveKit token." },
        { status: 500 },
        cors,
      );
    }
  },
};
