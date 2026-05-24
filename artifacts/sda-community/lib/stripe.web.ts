import { Alert } from "react-native";

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

export function useStripeCheckout() {
  async function createPaymentIntent(_params: {
    amount: number;
    currency: string;
    customerId?: string;
  }) {
    Alert.alert("Payment", "Payment is only available in the mobile app.");
    return null;
  }

  async function createSubscription(_params: {
    priceId: string;
    customerId?: string;
    userId?: string;
    email?: string;
  }) {
    Alert.alert("Subscription", "Subscription management is only available in the mobile app.");
    return null;
  }

  async function openCheckout(_options: {
    clientSecret: string;
    customerId?: string;
    ephemeralKey?: string;
    merchantDisplayName: string;
    applePay?: boolean;
    googlePay?: boolean;
  }) {
    Alert.alert("Payment", "Payment is only available in the mobile app.");
    return { error: new Error("Web not supported") };
  }

  return { createPaymentIntent, createSubscription, openCheckout };
}

export { STRIPE_PUBLISHABLE_KEY };
