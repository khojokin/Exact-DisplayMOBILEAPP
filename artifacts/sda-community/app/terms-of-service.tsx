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

export default function TermsOfServiceScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <View style={[styles.header, { paddingTop: topPad }]}> 
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}> 
        <View style={styles.logoWrap}>
          <Image source={require("@/assets/images/sda-logo.png")} style={styles.logo} resizeMode="contain" />
          <Text style={styles.subTitle}>SDA Community</Text>
          <Text style={styles.meta}>Effective Date: May 26, 2026</Text>
        </View>

        <Section
          title="1. Acceptance"
          body="By creating an account or using SDA Community, you agree to these Terms and our Privacy Policy."
        />

        <Section
          title="2. Account Responsibilities"
          body="You are responsible for maintaining the security of your account credentials and for activity under your account."
        />

        <Section
          title="3. Community Standards"
          body="You agree not to post unlawful, abusive, or infringing content. We may moderate content and suspend accounts that violate safety or community rules."
        />

        <Section
          title="4. Subscriptions"
          body="Subscription features may renew automatically according to the platform billing terms unless canceled. Refunds are managed by the applicable app marketplace policies."
        />

        <Section
          title="5. Calls and Live Features"
          body="You are responsible for your conduct during calls, meetings, and live sessions. Recording or sharing private conversations without consent may violate local laws."
        />

        <Section
          title="6. Service Availability"
          body="We may update, pause, or discontinue features at any time to improve reliability, security, or compliance."
        />

        <Section
          title="7. Limitation of Liability"
          body="To the maximum extent permitted by law, SDA Community is provided on an as-is basis without warranties of uninterrupted availability."
        />

        <Section
          title="8. Contact"
          body="For legal questions, contact: legal@sdacommunity.app"
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
