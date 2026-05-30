import { useStripe, PaymentSheetError } from "@stripe/stripe-react-native";
import { Alert } from "react-native";

const STRIPE_FALLBACK_PUBLISHABLE_KEY = "pk_test_51NqtHuCQ4lj9Byd7Rv8bE9qPlQ0XuSSbJVsevW9WZXHOkpL9CqQwaiGkQewCNLSqHZrlpo4kjZaLLKMmIZowvJxi007wStbAkw";

const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ||
  STRIPE_FALLBACK_PUBLISHABLE_KEY;

export function useStripeCheckout() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  async function createPaymentIntent(params: {
    amount: number;
    currency: string;
    customerId?: string;
  }): Promise<{ clientSecret: string; customerId: string; ephemeralKey?: string } | null> {
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error("Failed to create payment intent");
      return await res.json();
    } catch (err: any) {
      Alert.alert("Payment Error", err?.message ?? "Unable to reach payment server.");
      return null;
    }
  }

  async function createSubscription(params: {
    priceId: string;
    customerId?: string;
    userId?: string;
    email?: string;
  }): Promise<{ clientSecret: string; customerId: string; ephemeralKey?: string; subscriptionId: string } | null> {
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/create-subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error("Failed to create subscription");
      return await res.json();
    } catch (err: any) {
      Alert.alert("Subscription Error", err?.message ?? "Unable to reach payment server.");
      return null;
    }
  }

  async function openCheckout(options: {
    clientSecret: string;
    customerId?: string;
    ephemeralKey?: string;
    merchantDisplayName: string;
    applePay?: boolean;
    googlePay?: boolean;
  }) {
    const { error: initError } = await initPaymentSheet({
      paymentIntentClientSecret: options.clientSecret,
      customerId:
        options.customerId && options.ephemeralKey ? options.customerId : undefined,
      customerEphemeralKeySecret: options.ephemeralKey,
      merchantDisplayName: options.merchantDisplayName,
      allowsDelayedPaymentMethods: false,
      applePay: options.applePay ? { merchantCountryCode: "US" } : undefined,
      googlePay: options.googlePay
        ? { merchantCountryCode: "US", currencyCode: "USD", testEnv: __DEV__ }
        : undefined,
      style: "alwaysDark",
    });

    if (initError) {
      Alert.alert("Payment Setup Error", initError.message);
      return { error: initError };
    }

    const { error: presentError } = await presentPaymentSheet();
    if (presentError) {
      if (presentError.code === PaymentSheetError.Canceled) {
        return { canceled: true };
      }
      Alert.alert("Payment Failed", presentError.message);
      return { error: presentError };
    }

    return { success: true };
  }

  return { createPaymentIntent, createSubscription, openCheckout };
}

export { STRIPE_PUBLISHABLE_KEY };
