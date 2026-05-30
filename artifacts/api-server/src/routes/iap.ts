import { Router } from "express";

import { logger } from "../lib/logger";

const iapRouter = Router();

const APPLE_VERIFY_PRODUCTION_URL = "https://buy.itunes.apple.com/verifyReceipt";
const APPLE_VERIFY_SANDBOX_URL = "https://sandbox.itunes.apple.com/verifyReceipt";

const appleSharedSecret = process.env["APPLE_SHARED_SECRET"]?.trim();

if (!appleSharedSecret) {
  logger.warn(
    "APPLE_SHARED_SECRET is not set. iOS IAP receipt verification endpoint will return server configuration errors.",
  );
}

type VerifyReceiptResponse = {
  status?: number;
  environment?: string;
  latest_receipt_info?: Array<Record<string, unknown>>;
  receipt?: {
    in_app?: Array<Record<string, unknown>>;
  };
};

function parseNumberString(value: unknown) {
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

async function verifyWithApple(receiptData: string, url: string) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      "receipt-data": receiptData,
      password: appleSharedSecret,
      "exclude-old-transactions": true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Apple verifyReceipt request failed (${response.status})`);
  }

  return (await response.json()) as VerifyReceiptResponse;
}

iapRouter.post("/iap/ios/verify-subscription", async (req, res) => {
  if (!appleSharedSecret) {
    return res.status(500).json({
      error: "APPLE_SHARED_SECRET must be configured on the server.",
    });
  }

  const receiptData =
    typeof req.body?.receiptData === "string" ? req.body.receiptData.trim() : "";
  const expectedProductId =
    typeof req.body?.productId === "string" ? req.body.productId.trim() : "";

  if (!receiptData) {
    return res.status(400).json({ error: "receiptData is required." });
  }

  try {
    let payload = await verifyWithApple(receiptData, APPLE_VERIFY_PRODUCTION_URL);

    // 21007 means sandbox receipt was sent to production endpoint.
    if (payload.status === 21007) {
      payload = await verifyWithApple(receiptData, APPLE_VERIFY_SANDBOX_URL);
    }

    if (payload.status && payload.status !== 0) {
      return res.status(400).json({
        active: false,
        status: payload.status,
        error: "Apple receipt verification failed.",
      });
    }

    const latest = payload.latest_receipt_info ?? payload.receipt?.in_app ?? [];

    const candidate = [...latest]
      .filter((item) => {
        if (!expectedProductId) return true;
        return String(item.product_id ?? "") === expectedProductId;
      })
      .sort((a, b) => {
        const aExpires = parseNumberString(a.expires_date_ms) ?? 0;
        const bExpires = parseNumberString(b.expires_date_ms) ?? 0;
        return bExpires - aExpires;
      })[0];

    if (!candidate) {
      return res.json({
        active: false,
        environment: payload.environment,
        reason: "NO_MATCHING_PRODUCT",
      });
    }

    const expiresDateMs = parseNumberString(candidate.expires_date_ms);
    const cancellationDateMs = parseNumberString(candidate.cancellation_date_ms);
    const now = Date.now();

    const active =
      expiresDateMs !== null && expiresDateMs > now && cancellationDateMs === null;

    return res.json({
      active,
      productId: String(candidate.product_id ?? ""),
      transactionId: String(candidate.transaction_id ?? ""),
      originalTransactionId: String(candidate.original_transaction_id ?? ""),
      expiresDateMs,
      cancellationDateMs,
      environment: payload.environment,
      status: payload.status ?? 0,
    });
  } catch (error: any) {
    logger.error({ err: error }, "Failed to verify iOS IAP receipt");
    return res.status(500).json({
      error: error?.message ?? "Failed to verify iOS receipt.",
    });
  }
});

export default iapRouter;