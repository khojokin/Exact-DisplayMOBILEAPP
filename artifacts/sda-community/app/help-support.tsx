import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Platform, StatusBar,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

const FAQS = [
  { q: "How do I join a community group?", a: "Go to the Community tab and tap 'Join' on any group. You'll immediately have access to that group's posts and events." },
  { q: "Can I make my account private?", a: "Yes! Go to Settings → Privacy and enable 'Private Account'. Only approved followers will see your posts." },
  { q: "How do I report inappropriate content?", a: "Tap the three dots (⋯) on any post and select 'Report Post'. Our team reviews all reports within 24 hours." },
  { q: "How do I start a prayer chain?", a: "Create a new post and tag it as a Prayer request. Others can react with a prayer emoji to join the chain." },
  { q: "Can I share Sabbath School lessons?", a: "Yes! Open Resources → Sabbath School, expand any lesson, and use the Share button to send it to others." },
  { q: "How do I reset my password?", a: "On the Sign In screen, tap 'Forgot password?' and enter your email. We'll send you a reset link." },
];

export default function HelpSupportScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.contactCard}>
          <Ionicons name="mail-outline" size={28} color="#6B7B5A" />
          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>Email Support</Text>
            <Text style={styles.contactSub}>support@sdacommunity.org</Text>
          </View>
        </View>

        <View style={styles.contactCard}>
          <Ionicons name="time-outline" size={28} color="#3B5BDB" />
          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>Response Time</Text>
            <Text style={styles.contactSub}>Usually within 24–48 hours</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.liveChatCard} onPress={() => router.push("/dm/support") }>
          <View style={[styles.liveChatIcon, { backgroundColor: "#0E7B5B22" }]}>
            <Ionicons name="chatbubbles-outline" size={24} color="#0E7B5B" />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>Live Chat</Text>
            <Text style={styles.contactSub}>Talk to support and the admin team now</Text>
          </View>
          <Feather name="chevron-right" size={18} color="#636366" />
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>FREQUENTLY ASKED QUESTIONS</Text>
        <View style={styles.card}>
          {FAQS.map((faq, i) => (
            <View key={i}>
              <TouchableOpacity style={styles.faqRow} onPress={() => setExpanded(expanded === i ? null : i)}>
                <Text style={styles.faqQ}>{faq.q}</Text>
                <Ionicons name={expanded === i ? "chevron-up" : "chevron-down"} size={18} color="#636366" />
              </TouchableOpacity>
              {expanded === i && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqA}>{faq.a}</Text>
                </View>
              )}
              {i < FAQS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.feedbackBtn} onPress={() => router.push("/send-feedback")}>
          <Ionicons name="chatbubble-outline" size={18} color="#6B7B5A" />
          <Text style={styles.feedbackBtnText}>Still need help? Send us feedback</Text>
          <Feather name="chevron-right" size={18} color="#636366" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  content: { paddingHorizontal: 16, paddingTop: 12 },
  contactCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#111", borderRadius: 14, padding: 16, gap: 14, marginBottom: 10 },
  liveChatCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#111", borderRadius: 14, padding: 16, gap: 14, marginTop: 6 },
  liveChatIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  contactInfo: { flex: 1 },
  contactTitle: { color: "#FFF", fontSize: 15, fontWeight: "600" },
  contactSub: { color: "#8E8E93", fontSize: 13, marginTop: 2 },
  sectionLabel: { color: "#636366", fontSize: 11, fontWeight: "600", letterSpacing: 0.5, marginTop: 20, marginBottom: 6, marginLeft: 4 },
  card: { backgroundColor: "#111", borderRadius: 14, overflow: "hidden" },
  faqRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  faqQ: { color: "#FFF", fontSize: 14, flex: 1, lineHeight: 20 },
  faqAnswer: { paddingHorizontal: 16, paddingBottom: 14 },
  faqA: { color: "#8E8E93", fontSize: 13, lineHeight: 20 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#2C2C2E", marginLeft: 16 },
  feedbackBtn: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#111", borderRadius: 14, padding: 16, marginTop: 16 },
  feedbackBtnText: { flex: 1, color: "#FFF", fontSize: 15 },
});
