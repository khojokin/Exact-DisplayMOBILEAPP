import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function ReportedContentScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reported Content</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.emptyState}>
        <View style={styles.emptyIcon}>
          <Ionicons name="flag-outline" size={44} color="#636366" />
        </View>
        <Text style={styles.emptyTitle}>No Reports</Text>
        <Text style={styles.emptyBody}>
          Content you've reported will be reviewed by our moderation team. All reports will appear here with their status.
        </Text>
        <View style={styles.infoBox}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#6B7B5A" />
          <Text style={styles.infoText}>Reports are usually reviewed within 24 hours.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 },
  emptyIcon: { width: 88, height: 88, borderRadius: 44, backgroundColor: "#1C1C1E", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  emptyTitle: { color: "#FFF", fontSize: 20, fontWeight: "700", marginBottom: 10 },
  emptyBody: { color: "#8E8E93", fontSize: 14, textAlign: "center", lineHeight: 22, marginBottom: 20 },
  infoBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#4A674115", borderRadius: 10, padding: 12, borderLeftWidth: 3, borderLeftColor: "#6B7B5A" },
  infoText: { color: "#AEAEB2", fontSize: 13, flex: 1 },
});
