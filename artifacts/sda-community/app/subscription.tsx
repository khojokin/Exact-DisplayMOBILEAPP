import React, { useMemo, useRef, useState } from "react";
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
import { supabase } from "@/lib/supabase";

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
  const { setPlan, syncFromSupabase } = useSubscription();
  const { createSubscription, openCheckout } = useStripeCheckout();
  const [step, setStep] = useState<Step>("plans");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.84)).current;

  const premiumPlan = PLAN_CONFIG.premium;
  const perksToActivate = useMemo(() => premiumPlan.perks, []);

  async function startCheckout(method: CheckoutMethod) {
    if (!premiumPlan.stripePriceId) {
      Alert.alert("Stripe not configured", "Missing EXPO_PUBLIC_STRIPE_PREMIUM_PRICE_ID.");
      return;
    }

    setIsSubmitting(true);
    try {
      const sub = await createSubscription({
        priceId: premiumPlan.stripePriceId,
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

      await setPlan("premium");
      await syncFromSupabase(userId);
      setIsSubmitting(false);
      setStep("success");
      scaleAnim.setValue(0.84);
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 90,
      }).start();

      if (method === "card") {
        Alert.alert("Payment Complete", `${premiumPlan.label} is now active.`);
      } else if (method === "apple") {
        Alert.alert("Apple Pay Complete", `${premiumPlan.label} has been activated.`);
      } else {
        Alert.alert("Google Pay Complete", `${premiumPlan.label} has been activated.`);
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
            <Text style={styles.checkoutTitle}>Checkout</Text>
            <Text style={styles.checkoutPlan}>{premiumPlan.label} • {premiumPlan.price}</Text>

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Billing method</Text>
                <Text style={styles.summaryValue}>Debit or credit card</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Plan</Text>
                <Text style={styles.summaryValue}>Monthly premium</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Stripe Price ID</Text>
                <Text style={styles.summaryValue} numberOfLines={1}>{premiumPlan.stripePriceId || "Not configured"}</Text>
              </View>
            </View>

            <View style={styles.walletCard}>
              <Text style={styles.walletTitle}>Payment options</Text>
              <TouchableOpacity
                style={[styles.cardBtn, isSubmitting && { opacity: 0.6 }]}
                onPress={() => startCheckout("card")}
                disabled={isSubmitting}
              >
                <Ionicons name="card-outline" size={18} color="#FFF" />
                <Text style={styles.cardBtnText}>{isSubmitting ? "Processing..." : "Pay with debit or credit card"}</Text>
              </TouchableOpacity>
              <View style={styles.walletRow}>
                <TouchableOpacity
                  style={[styles.walletBtn, isSubmitting && { opacity: 0.6 }]}
                  onPress={() => startCheckout("apple")}
                  disabled={isSubmitting}
                >
                  <Ionicons name="logo-apple" size={18} color="#FFF" />
                  <Text style={styles.walletBtnText}>Apple Pay</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.walletBtn, isSubmitting && { opacity: 0.6 }]}
                  onPress={() => startCheckout("google")}
                  disabled={isSubmitting}
                >
                  <Ionicons name="logo-google" size={18} color="#FFF" />
                  <Text style={styles.walletBtnText}>Google Pay</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.altPayText}>Stripe opens a secure payment sheet for card entry and saves the subscription to your account.</Text>
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
    backgroundColor: "#151518",
    borderWidth: 1,
    borderColor: "#2C2C2E",
    padding: 14,
    gap: 10,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  summaryLabel: { color: "#8E8E93", fontSize: 12, fontWeight: "600" },
  summaryValue: { color: "#FFF", fontSize: 12, fontWeight: "700", flex: 1, textAlign: "right" },
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
