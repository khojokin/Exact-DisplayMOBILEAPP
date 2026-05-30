import crypto from "node:crypto";
import { Router } from "express";

import { logger } from "../lib/logger";

const liveKitApiKey = process.env["LIVEKIT_API_KEY"]?.trim();
const liveKitApiSecret = process.env["LIVEKIT_API_SECRET"]?.trim();
const defaultTtlSeconds = Number(process.env["LIVEKIT_TOKEN_TTL_SECONDS"] ?? 3600);

if (!liveKitApiKey || !liveKitApiSecret) {
  logger.warn(
    "LIVEKIT_API_KEY or LIVEKIT_API_SECRET is not set. LiveKit token endpoint will return server configuration errors.",
  );
}

const liveKitRouter = Router();

type TokenRequestBody = {
  room?: unknown;
  identity?: unknown;
  name?: unknown;
  metadata?: unknown;
};

function base64Url(input: Buffer | string) {
  const source = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return source
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function signJwtHS256(payload: Record<string, unknown>, secret: string) {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedPayload = base64Url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac("sha256", secret)
    .update(signingInput)
    .digest();

  return `${signingInput}.${base64Url(signature)}`;
}

liveKitRouter.post("/livekit/token", async (req, res) => {
  if (!liveKitApiKey || !liveKitApiSecret) {
    return res.status(500).json({
      error: "LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be configured on the server.",
    });
  }

  const body = (req.body ?? {}) as TokenRequestBody;
  const room = typeof body.room === "string" ? body.room.trim() : "";
  const identity = typeof body.identity === "string" ? body.identity.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!room) {
    return res.status(400).json({ error: "room is required." });
  }

  if (!identity) {
    return res.status(400).json({ error: "identity is required." });
  }

  const now = Math.floor(Date.now() / 1000);
  const ttl = Number.isFinite(defaultTtlSeconds) && defaultTtlSeconds > 0 ? defaultTtlSeconds : 3600;

  const payload: Record<string, unknown> = {
    iss: liveKitApiKey,
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

  if (name) {
    payload.name = name;
  }

  if (body.metadata !== undefined) {
    payload.metadata =
      typeof body.metadata === "string" ? body.metadata : JSON.stringify(body.metadata);
  }

  try {
    const token = signJwtHS256(payload, liveKitApiSecret);
    return res.json({ token });
  } catch (error: any) {
    logger.error({ err: error }, "Failed to mint LiveKit access token");
    return res.status(500).json({ error: error?.message ?? "Failed to create LiveKit token." });
  }
});

export default liveKitRouter;