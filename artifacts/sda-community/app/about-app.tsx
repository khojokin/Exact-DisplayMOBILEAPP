import React from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Platform, StatusBar, Share, Alert,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function AboutAppScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About SDA Community</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Ionicons name="people" size={44} color="#6B7B5A" />
          </View>
          <Text style={styles.appName}>SDA Community</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        <View style={styles.missionCard}>
          <Text style={styles.missionText}>
            "A safe space for Seventh-day Adventist believers to connect, grow in faith, pray together, and share the love of Christ."
          </Text>
        </View>

        <Text style={styles.sectionLabel}>APP DETAILS</Text>
        <View style={styles.card}>
          {[
            { label: "Version", value: "1.0.0" },
            { label: "Build", value: "2026.05.17" },
            { label: "Platform", value: Platform.OS === "web" ? "Web" : Platform.OS === "ios" ? "iOS" : "Android" },
          ].map((item, i, arr) => (
            <View key={item.label}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{item.label}</Text>
                <Text style={styles.detailValue}>{item.value}</Text>
              </View>
              {i < arr.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>LINKS</Text>
        <View style={styles.card}>
          {[
            { label: "Privacy Policy", icon: "lock-closed-outline" },
            { label: "Terms of Service", icon: "document-text-outline" },
            { label: "Open Source Licenses", icon: "code-slash-outline" },
          ].map((item, i, arr) => (
            <View key={item.label}>
              <TouchableOpacity style={styles.navRow} onPress={() => Alert.alert(item.label, `The ${item.label} will be available at launch.`, [{ text: "OK" }])}>
                <Ionicons name={item.icon as any} size={18} color="#636366" />
                <Text style={styles.navLabel}>{item.label}</Text>
                <Feather name="chevron-right" size={18} color="#636366" />
              </TouchableOpacity>
              {i < arr.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.shareBtn}
          onPress={() => Share.share({ message: "Join me on SDA Community — where believers connect and grow together in faith! 🙏" })}
        >
          <Ionicons name="share-social-outline" size={18} color="#6B7B5A" />
          <Text style={styles.shareBtnText}>Share SDA Community</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>Made with faith and love{"\n"}© 2026 SDA Community</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  content: { paddingHorizontal: 16, paddingTop: 8 },
  logoSection: { alignItems: "center", paddingVertical: 24 },
  logoCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: "#4A674122", alignItems: "center", justifyContent: "center", marginBottom: 14, borderWidth: 2, borderColor: "#6B7B5A33" },
  appName: { color: "#FFF", fontSize: 22, fontWeight: "800", marginBottom: 4 },
  version: { color: "#636366", fontSize: 13 },
  missionCard: { backgroundColor: "#4A674115", borderRadius: 14, padding: 16, borderLeftWidth: 3, borderLeftColor: "#6B7B5A", marginBottom: 8 },
  missionText: { color: "#AEAEB2", fontSize: 14, fontStyle: "italic", lineHeight: 22 },
  sectionLabel: { color: "#636366", fontSize: 11, fontWeight: "600", letterSpacing: 0.5, marginTop: 20, marginBottom: 6, marginLeft: 4 },
  card: { backgroundColor: "#111", borderRadius: 14, overflow: "hidden" },
  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
  detailLabel: { color: "#8E8E93", fontSize: 15 },
  detailValue: { color: "#FFF", fontSize: 15 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#2C2C2E", marginLeft: 16 },
  navRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  navLabel: { flex: 1, color: "#FFF", fontSize: 15 },
  shareBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "#111", borderRadius: 14, height: 52, marginTop: 16 },
  shareBtnText: { color: "#FFF", fontSize: 15, fontWeight: "600" },
  footer: { color: "#636366", fontSize: 12, textAlign: "center", marginTop: 24, lineHeight: 20 },
});
