import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function BlockedMembersScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blocked Members</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.emptyState}>
        <View style={styles.emptyIcon}>
          <Ionicons name="ban-outline" size={44} color="#636366" />
        </View>
        <Text style={styles.emptyTitle}>No Blocked Members</Text>
        <Text style={styles.emptyBody}>
          When you block someone, they won't be able to see your posts or contact you. Blocked members will appear here.
        </Text>
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
  emptyBody: { color: "#8E8E93", fontSize: 14, textAlign: "center", lineHeight: 22 },
});
