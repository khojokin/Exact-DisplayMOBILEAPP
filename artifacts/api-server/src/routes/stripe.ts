import { Router, type Request } from "express";
import Stripe from "stripe";

import { logger } from "../lib/logger";

type StripeRequest = Request & { rawBody?: Buffer };

const stripeSecretKey = process.env["STRIPE_SECRET_KEY"];

if (!stripeSecretKey) {
  logger.warn(
    "STRIPE_SECRET_KEY is not set. Stripe routes will return server configuration errors."
  );
}

const stripe = new Stripe(stripeSecretKey ?? "sk_test_placeholder", {
  apiVersion: "2024-06-20",
});

const stripeRouter = Router();

function requireStripeConfig() {
  return Boolean(process.env["STRIPE_SECRET_KEY"]);
}

stripeRouter.post("/stripe/webhook", async (req: StripeRequest, res) => {
  const webhookSecret = process.env["STRIPE_WEBHOOK_SECRET"];

  if (!requireStripeConfig() || !webhookSecret) {
    return res
      .status(500)
      .json({ error: "Stripe webhook is not configured on the server." });
  }

  const signature = req.headers["stripe-signature"];
  if (!signature || typeof signature !== "string") {
    return res.status(400).json({ error: "Missing Stripe signature header." });
  }

  if (!req.rawBody) {
    return res.status(400).json({ error: "Missing raw request payload." });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, signature, webhookSecret);
  } catch (error: any) {
    logger.warn({ err: error }, "Invalid Stripe webhook signature");
    return res.status(400).json({ error: error?.message ?? "Invalid webhook" });
  }

  switch (event.type) {
    case "invoice.paid":
    case "invoice.payment_failed":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      logger.info({ type: event.type, id: event.id }, "Handled Stripe webhook event");
      break;
    default:
      logger.debug({ type: event.type }, "Unhandled Stripe webhook event type");
  }

  return res.json({ received: true });
});

stripeRouter.post("/create-payment-intent", async (req, res) => {
  if (!requireStripeConfig()) {
    return res
      .status(500)
      .json({ error: "STRIPE_SECRET_KEY is not configured on the server." });
  }

  try {
    const amount = Number(req.body?.amount);
    const currency = String(req.body?.currency ?? "usd").toLowerCase();

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: "amount must be a positive number." });
    }

    const customerId =
      typeof req.body?.customerId === "string" && req.body.customerId.trim()
        ? req.body.customerId.trim()
        : undefined;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,
      automatic_payment_methods: { enabled: true },
    });

    return res.json({
      clientSecret: paymentIntent.client_secret,
      customerId: paymentIntent.customer ?? customerId ?? null,
    });
  } catch (error: any) {
    logger.error({ err: error }, "Failed to create Stripe payment intent");
    return res
      .status(500)
      .json({ error: error?.message ?? "Failed to create payment intent." });
  }
});

stripeRouter.post("/create-subscription", async (req, res) => {
  if (!requireStripeConfig()) {
    return res
      .status(500)
      .json({ error: "STRIPE_SECRET_KEY is not configured on the server." });
  }

  try {
    const priceId =
      typeof req.body?.priceId === "string" ? req.body.priceId.trim() : "";
    const email =
      typeof req.body?.email === "string" && req.body.email.trim()
        ? req.body.email.trim()
        : undefined;

    if (!priceId) {
      return res.status(400).json({ error: "priceId is required." });
    }

    let customerId =
      typeof req.body?.customerId === "string" && req.body.customerId.trim()
        ? req.body.customerId.trim()
        : undefined;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          appUserId: String(req.body?.userId ?? ""),
        },
      });
      customerId = customer.id;
    }

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customerId },
      { apiVersion: "2024-06-20" }
    );

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
    });

    const paymentIntent = (subscription.latest_invoice as Stripe.Invoice | null)
      ?.payment_intent as Stripe.PaymentIntent | null;

    if (!paymentIntent?.client_secret) {
      return res.status(500).json({
        error: "Stripe did not return a payment intent client secret.",
      });
    }

    return res.json({
      clientSecret: paymentIntent.client_secret,
      customerId,
      ephemeralKey: ephemeralKey.secret,
      subscriptionId: subscription.id,
    });
  } catch (error: any) {
    logger.error({ err: error }, "Failed to create Stripe subscription");
    return res
      .status(500)
      .json({ error: error?.message ?? "Failed to create subscription." });
  }
});

export default stripeRouter;
