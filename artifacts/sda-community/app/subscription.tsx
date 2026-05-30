import React, { useMemo, useRef, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-expo";
import * as InAppPurchases from "expo-in-app-purchases";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useSubscription } from "@/hooks/useSubscription";
import { useStripeCheckout } from "@/lib/stripe";

type Step = "plans" | "checkout" | "success";
type PaidPlan = "premium";
type CheckoutMethod = "card" | "apple" | "google";

const PLAN_CONFIG: Record<PaidPlan, { label: string; price: string; color: string; perks: string[]; stripePriceId: string }> = {
  premium: {
    label: "PREMIUM",
    price: "$6.99 / month",
    color: "#D4AF37",
    perks: ["Everything in Plus", "Advanced privacy controls", "Creator analytics dashboard"],
    stripePriceId: process.env.EXPO_PUBLIC_STRIPE_PREMIUM_PRICE_ID ?? "",
  },
};

export default function SubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const { userId } = useAuth();
  const { user } = useUser();
  const { setPlan, syncFromSupabase } = useSubscription();
  const { createSubscription, openCheckout } = useStripeCheckout();
  const isIos = Platform.OS === "ios";
  const iosPremiumProductId = (process.env.EXPO_PUBLIC_IOS_PREMIUM_PRODUCT_ID ?? "").trim();
  const [step, setStep] = useState<Step>("plans");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.84)).current;

  const premiumPlan = PLAN_CONFIG.premium;
  const perksToActivate = useMemo(() => premiumPlan.perks, []);

  async function verifyIosReceipt(receiptData: string) {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    if (!apiUrl) {
      throw new Error("API URL is not configured.");
    }

    const response = await fetch(`${apiUrl}/api/iap/ios/verify-subscription`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        receiptData,
        productId: iosPremiumProductId || undefined,
        userId: userId ?? undefined,
      }),
    });

    const payload = (await response.json()) as { active?: boolean; error?: string };
    if (!response.ok) {
      throw new Error(payload.error ?? "Could not verify iOS subscription.");
    }

    return Boolean(payload.active);
  }

  async function completeSubscriptionActivation(paymentLabel: string) {
    await setPlan("premium");
    if (userId) {
      await syncFromSupabase(userId);
    }
    setIsSubmitting(false);
    setStep("success");
    scaleAnim.setValue(0.84);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
      tension: 90,
    }).start();
    Alert.alert(`${paymentLabel} Complete`, `${premiumPlan.label} has been activated.`);
  }

  async function startIosIapCheckout() {
    if (!iosPremiumProductId) {
      Alert.alert(
        "iOS Product Not Configured",
        "Missing EXPO_PUBLIC_IOS_PREMIUM_PRODUCT_ID.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await InAppPurchases.connectAsync();
      const products = await InAppPurchases.getProductsAsync([iosPremiumProductId]);

      if (
        products.responseCode !== InAppPurchases.IAPResponseCode.OK ||
        !products.results?.length
      ) {
        throw new Error("Premium product is not available on the App Store account.");
      }

      const purchase = await new Promise<any>((resolve, reject) => {
        let handled = false;

        InAppPurchases.setPurchaseListener(({ responseCode, results, errorCode }) => {
          if (handled) return;

          if (responseCode === InAppPurchases.IAPResponseCode.OK && results?.length) {
            handled = true;
            resolve(results[0]);
            InAppPurchases.setPurchaseListener(() => {});
            return;
          }

          if (responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED) {
            handled = true;
            reject(new Error("Purchase canceled."));
            InAppPurchases.setPurchaseListener(() => {});
            return;
          }

          if (responseCode === InAppPurchases.IAPResponseCode.ERROR) {
            handled = true;
            reject(new Error(errorCode ? String(errorCode) : "Purchase failed."));
            InAppPurchases.setPurchaseListener(() => {});
          }
        });

        InAppPurchases.purchaseItemAsync(iosPremiumProductId).catch((error) => {
          if (handled) return;
          handled = true;
          reject(error);
          InAppPurchases.setPurchaseListener(() => {});
        });
      });

      if (!purchase) {
        throw new Error("Purchase did not return a transaction.");
      }

      const receiptData = typeof purchase.transactionReceipt === "string"
        ? purchase.transactionReceipt
        : "";
      if (!receiptData) {
        throw new Error("Could not read iOS purchase receipt.");
      }

      const isValid = await verifyIosReceipt(receiptData);
      if (!isValid) {
        throw new Error("Subscription could not be verified.");
      }

      await InAppPurchases.finishTransactionAsync(purchase, false);
      await completeSubscriptionActivation("In-App Purchase");
    } catch (err: any) {
      setIsSubmitting(false);
      Alert.alert("Purchase Error", err?.message ?? "Unable to complete iOS purchase.");
    } finally {
      InAppPurchases.setPurchaseListener(() => {});
      InAppPurchases.disconnectAsync().catch(() => undefined);
    }
  }

  async function restoreIosPurchases() {
    if (!iosPremiumProductId) {
      Alert.alert("iOS Product Not Configured", "Missing EXPO_PUBLIC_IOS_PREMIUM_PRODUCT_ID.");
      return;
    }

    setIsRestoring(true);

    try {
      await InAppPurchases.connectAsync();
      const history = await InAppPurchases.getPurchaseHistoryAsync({ androidSkuKind: true } as any);

      if (history.responseCode !== InAppPurchases.IAPResponseCode.OK || !history.results?.length) {
        throw new Error("No previous purchases were found.");
      }

      const candidate = history.results.find(
        (item) =>
          item.productId === iosPremiumProductId &&
          typeof item.transactionReceipt === "string" &&
          item.transactionReceipt.length > 0,
      );

      if (!candidate?.transactionReceipt) {
        throw new Error("No restorable Premium subscription was found.");
      }

      const isValid = await verifyIosReceipt(candidate.transactionReceipt);
      if (!isValid) {
        throw new Error("Could not verify an active subscription to restore.");
      }

      await completeSubscriptionActivation("Restore");
    } catch (err: any) {
      Alert.alert("Restore Failed", err?.message ?? "Could not restore purchases.");
    } finally {
      setIsRestoring(false);
      InAppPurchases.disconnectAsync().catch(() => undefined);
    }
  }

  async function startCheckout(method: CheckoutMethod) {
    if (isIos) {
      await startIosIapCheckout();
      return;
    }

    if (!premiumPlan.stripePriceId) {
      Alert.alert("Stripe not configured", "Missing EXPO_PUBLIC_STRIPE_PREMIUM_PRICE_ID.");
      return;
    }

    setIsSubmitting(true);
    try {
      const sub = await createSubscription({
        priceId: premiumPlan.stripePriceId,
        userId: userId ?? undefined,
        email: user?.primaryEmailAddress?.emailAddress,
      });
      if (!sub) {
        setIsSubmitting(false);
        return;
      }

      const result = await openCheckout({
        clientSecret: sub.clientSecret,
        customerId: sub.customerId,
        ephemeralKey: sub.ephemeralKey,
        merchantDisplayName: "SDA Community Premium",
        applePay: method === "apple",
        googlePay: method === "google",
      });

      if (result.canceled) {
        setIsSubmitting(false);
        return;
      }

      if (result.error) {
        setIsSubmitting(false);
        return;
      }

      if (method === "card") {
        await completeSubscriptionActivation("Payment");
      } else if (method === "apple") {
        await completeSubscriptionActivation("Apple Pay");
      } else {
        await completeSubscriptionActivation("Google Pay");
      }
    } catch (err: any) {
      setIsSubmitting(false);
      Alert.alert("Checkout Error", err?.message ?? "Something went wrong.");
    }
  }

  function handleBack() {
    if (step === "checkout") {
      setStep("plans");
      return;
    }
    if (step === "success") {
      setStep("plans");
      return;
    }
    router.back();
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription</Text>
        <View style={{ width: 36 }} />
      </View>

      {step === "plans" && (
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
          <Text style={styles.heroTitle}>Go Premium, Stay Blessed</Text>
          <Text style={styles.heroSubtitle}>
            Unlock a richer SDA community experience with faith-focused creator tools and privacy controls.
          </Text>

          <View
            style={[
              styles.planCard,
              { borderColor: premiumPlan.color, shadowColor: premiumPlan.color },
            ]}
          >
            <Text style={styles.bestValue}>BEST VALUE</Text>
            <View style={styles.planTopRow}>
              <Text style={[styles.planLabel, { color: premiumPlan.color }]}>{premiumPlan.label}</Text>
            </View>
            <Text style={styles.planPrice}>{premiumPlan.price}</Text>
            {premiumPlan.perks.map((perk) => (
              <View style={styles.perkRow} key={perk}>
                <Ionicons name="checkmark-circle" size={16} color={premiumPlan.color} />
                <Text style={styles.perkText}>{perk}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep("checkout")}>
            <Text style={styles.primaryBtnText}>Continue with {premiumPlan.label}</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {step === "checkout" && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 50 }]}>
            <Text style={styles.checkoutTitle}>Secure checkout</Text>
            <Text style={styles.checkoutPlan}>{premiumPlan.label} Membership</Text>

            <View style={styles.checkoutHeroCard}>
              <Text style={styles.checkoutHeroPrice}>{premiumPlan.price}</Text>
              <Text style={styles.checkoutHeroNote}>Cancel anytime from Settings.</Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryHeading}>Order summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Plan</Text>
                <Text style={styles.summaryValue}>Premium monthly</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Renewal</Text>
                <Text style={styles.summaryValue}>Every 30 days</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Due now</Text>
                <Text style={styles.totalValue}>$6.99</Text>
              </View>
            </View>

            <View style={styles.walletCard}>
              <Text style={styles.walletTitle}>Choose payment</Text>
              <TouchableOpacity
                  style={[styles.cardBtn, (isSubmitting || isIos) && { opacity: 0.6 }]}
                onPress={() => startCheckout("card")}
                  disabled={isSubmitting}
              >
                <Ionicons name="card-outline" size={18} color="#FFF" />
                  <Text style={styles.cardBtnText}>
                    {isIos ? (isSubmitting ? "Processing..." : "Continue with Apple") : isSubmitting ? "Processing..." : "Pay with card"}
                  </Text>
              </TouchableOpacity>
              <View style={styles.walletRow}>
                <TouchableOpacity
                    style={[styles.walletBtn, (isSubmitting || isIos) && { opacity: 0.6 }]}
                  onPress={() => startCheckout("apple")}
                    disabled={isSubmitting || isIos}
                >
                  <Ionicons name="logo-apple" size={18} color="#FFF" />
                  <Text style={styles.walletBtnText}>Apple Pay</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.walletBtn, (isSubmitting || isIos) && { opacity: 0.6 }]}
                  onPress={() => startCheckout("google")}
                    disabled={isSubmitting || isIos}
                >
                  <Ionicons name="logo-google" size={18} color="#FFF" />
                  <Text style={styles.walletBtnText}>Google Pay</Text>
                </TouchableOpacity>
              </View>
            </View>

              {isIos && (
                <View style={styles.configWarningCard}>
                  <Ionicons name="information-circle-outline" size={18} color="#8AB4FF" />
                  <Text style={styles.configWarningText}>
                    iOS subscriptions use Apple In-App Purchase.
                  </Text>
                </View>
              )}

            <Text style={styles.altPayText}>
              {isIos
                ? "Subscriptions on iOS are processed by Apple In-App Purchase."
                : "Payments are handled by Stripe using encrypted checkout. Your subscription activates immediately after confirmation."}
            </Text>

            {!premiumPlan.stripePriceId && (
              <View style={styles.configWarningCard}>
                <Ionicons name="warning-outline" size={18} color="#FFB020" />
                <Text style={styles.configWarningText}>
                  Missing EXPO_PUBLIC_STRIPE_PREMIUM_PRICE_ID. Add your Stripe Price ID in .env to enable checkout.
                </Text>
              </View>
            )}

            {isIos && !iosPremiumProductId && (
              <View style={styles.configWarningCard}>
                <Ionicons name="warning-outline" size={18} color="#FFB020" />
                <Text style={styles.configWarningText}>
                  Missing EXPO_PUBLIC_IOS_PREMIUM_PRODUCT_ID. Add your App Store product ID in .env.
                </Text>
              </View>
            )}

            {isIos && (
              <TouchableOpacity
                style={[styles.restoreBtn, isRestoring && { opacity: 0.6 }]}
                onPress={restoreIosPurchases}
                disabled={isRestoring}
              >
                <Ionicons name="refresh" size={16} color="#D4AF37" />
                <Text style={styles.restoreBtnText}>{isRestoring ? "Restoring..." : "Restore Purchases"}</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {step === "success" && (
        <View style={[styles.successContainer, { paddingBottom: insets.bottom + 36 }]}>
          <Animated.View style={[styles.successCard, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.successIconWrap}>
              <Ionicons name="checkmark" size={34} color="#0A0A0A" />
            </View>
            <Text style={styles.successTitle}>Subscription Activated</Text>
            <Text style={styles.successSubtitle}>Welcome to {PLAN_CONFIG.premium.label}. Your perks are now live.</Text>

            <View style={styles.successPerks}>
              {perksToActivate.map((perk) => (
                <View key={perk} style={styles.perkRow}>
                  <Ionicons name="sparkles" size={14} color="#D4AF37" />
                  <Text style={styles.perkText}>{perk}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace("/(tabs)/profile")}>
            <Text style={styles.primaryBtnText}>Go to Profile</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  content: { paddingHorizontal: 16, paddingTop: 8, gap: 12 },

  heroTitle: { color: "#FFF", fontSize: 28, fontWeight: "800", lineHeight: 34 },
  heroSubtitle: { color: "#9A9AA0", fontSize: 14, lineHeight: 21, marginBottom: 6 },

  planCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2C2C2E",
    backgroundColor: "#141416",
    padding: 16,
    gap: 8,
  },
  bestValue: {
    alignSelf: "flex-start",
    fontSize: 10,
    fontWeight: "800",
    color: "#111",
    backgroundColor: "#D4AF37",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  planTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  planLabel: { fontSize: 18, fontWeight: "800", letterSpacing: 0.5 },
  currentPlan: {
    color: "#B8F5CB",
    fontSize: 11,
    fontWeight: "700",
    backgroundColor: "#1B3C28",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  planPrice: { color: "#FFF", fontSize: 16, fontWeight: "700", marginBottom: 2 },
  perkRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  perkText: { color: "#D6D6DA", fontSize: 13 },

  primaryBtn: {
    marginTop: 10,
    backgroundColor: "#4B7BEC",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
  },
  primaryBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },

  checkoutTitle: { color: "#FFF", fontSize: 24, fontWeight: "800" },
  checkoutPlan: { color: "#D4AF37", fontSize: 14, fontWeight: "700", marginBottom: 2 },
  checkoutHeroCard: {
    borderRadius: 16,
    backgroundColor: "#111826",
    borderWidth: 1,
    borderColor: "#223354",
    paddingVertical: 16,
    paddingHorizontal: 14,
    gap: 4,
  },
  checkoutHeroPrice: { color: "#FFFFFF", fontSize: 24, fontWeight: "800" },
  checkoutHeroNote: { color: "#A8B6D9", fontSize: 12, fontWeight: "600" },
  walletCard: {
    borderRadius: 16,
    backgroundColor: "#151518",
    borderWidth: 1,
    borderColor: "#2C2C2E",
    padding: 12,
    gap: 8,
  },
  walletTitle: { color: "#D6D6DA", fontSize: 13, fontWeight: "700" },
  summaryCard: {
    borderRadius: 16,
    backgroundColor: "#131316",
    borderWidth: 1,
    borderColor: "#2C2C2E",
    padding: 14,
    gap: 10,
  },
  summaryHeading: { color: "#E5E7EB", fontSize: 13, fontWeight: "700", marginBottom: 4 },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  summaryLabel: { color: "#8E8E93", fontSize: 12, fontWeight: "600" },
  summaryValue: { color: "#FFF", fontSize: 12, fontWeight: "700", flex: 1, textAlign: "right" },
  summaryDivider: { height: 1, backgroundColor: "#2A2A2E", marginVertical: 2 },
  totalLabel: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  totalValue: { color: "#D4AF37", fontSize: 16, fontWeight: "800" },
  walletRow: { flexDirection: "row", gap: 10 },
  cardBtn: {
    backgroundColor: "#4B7BEC",
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  cardBtnText: { color: "#FFF", fontSize: 14, fontWeight: "700" },
  walletBtn: {
    flex: 1,
    backgroundColor: "#0F0F11",
    borderWidth: 1,
    borderColor: "#2C2C2E",
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  walletBtnText: { color: "#FFF", fontSize: 14, fontWeight: "700" },
  altPayText: { color: "#7A7A80", fontSize: 12, textAlign: "center", marginTop: 2 },
  restoreBtn: {
    marginTop: 8,
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#4D3C13",
    backgroundColor: "#1F1A0D",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  restoreBtnText: { color: "#D4AF37", fontSize: 13, fontWeight: "700" },
  configWarningCard: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#8A6420",
    backgroundColor: "#2D220F",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  configWarningText: { flex: 1, color: "#FFDA8A", fontSize: 12, lineHeight: 17 },
  inputCard: {
    borderRadius: 16,
    backgroundColor: "#151518",
    borderWidth: 1,
    borderColor: "#2C2C2E",
    padding: 14,
  },
  inputLabel: { color: "#9A9AA0", fontSize: 12, fontWeight: "600", marginBottom: 6, marginTop: 4 },
  input: {
    backgroundColor: "#0F0F11",
    color: "#FFF",
    borderWidth: 1,
    borderColor: "#2C2C2E",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  splitRow: { flexDirection: "row", gap: 10 },

  successContainer: { flex: 1, justifyContent: "center", paddingHorizontal: 16, gap: 16 },
  successCard: {
    borderRadius: 18,
    backgroundColor: "#141416",
    borderWidth: 1,
    borderColor: "#2C2C2E",
    padding: 18,
    gap: 12,
  },
  successIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#D4AF37",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  successTitle: { color: "#FFF", fontSize: 20, fontWeight: "800", textAlign: "center" },
  successSubtitle: { color: "#B9B9BE", fontSize: 14, textAlign: "center", lineHeight: 20 },
  successPerks: { gap: 8, marginTop: 6 },
});
