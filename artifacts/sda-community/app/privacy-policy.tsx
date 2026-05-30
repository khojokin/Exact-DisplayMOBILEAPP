import React from "react";
import {
  Image,
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

export default function PrivacyPolicyScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <View style={[styles.header, { paddingTop: topPad }]}> 
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}> 
        <View style={styles.logoWrap}>
          <Image source={require("@/assets/images/sda-logo.png")} style={styles.logo} resizeMode="contain" />
          <Text style={styles.subTitle}>SDA Community</Text>
          <Text style={styles.meta}>Effective Date: May 26, 2026</Text>
        </View>

        <Section
          title="1. Information We Collect"
          body="We collect account information you provide such as name, email address, username, profile details, posts, messages, and activity inside SDA Community. We also collect limited device and usage data required to keep the app secure and reliable."
        />

        <Section
          title="2. How We Use Information"
          body="We use your data to provide core features including login, community feeds, messaging, calls, subscriptions, moderation, support, and security. We do not sell your personal data."
        />

        <Section
          title="3. Calls, Messages, and Media"
          body="Call and messaging features process content needed to deliver communication features. Audio/video call session metadata may be processed for connection quality and abuse prevention."
        />

        <Section
          title="4. Subscriptions and Payments"
          body="Payments are processed by platform billing providers and payment processors. We do not store full card numbers in the app. Purchase receipts may be verified on our server to activate subscriptions."
        />

        <Section
          title="5. Data Sharing"
          body="We share data only with service providers that help operate SDA Community (for example authentication, infrastructure, and payments), or when required by law."
        />

        <Section
          title="6. Your Controls"
          body="You can edit profile information, manage privacy settings, and request account deletion from within the app."
        />

        <Section
          title="7. Contact"
          body="For privacy questions, contact: privacy@sdacommunity.app"
        />
      </ScrollView>
    </View>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardBody}>{body}</Text>
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
    paddingBottom: 12,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  content: { paddingHorizontal: 16, paddingTop: 8 },
  logoWrap: { alignItems: "center", marginBottom: 16 },
  logo: { width: 64, height: 64, marginBottom: 10 },
  subTitle: { color: "#FFF", fontSize: 20, fontWeight: "800" },
  meta: { color: "#8E8E93", fontSize: 12, marginTop: 4 },
  card: {
    backgroundColor: "#111",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2C2C2E",
  },
  cardTitle: { color: "#FFF", fontSize: 15, fontWeight: "700", marginBottom: 8 },
  cardBody: { color: "#C7C7CC", fontSize: 13, lineHeight: 20 },
});
