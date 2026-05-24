import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/lib/supabase";

interface AppStats {
  totalUsers: number;
  premiumUsers: number;
  totalPosts: number;
  reportedContent: number;
}

const ADMIN_MENU = [
  { id: "users", title: "User Management", sub: "View, ban, or manage roles", icon: "people-outline", color: "#3B5BDB", route: "/members" },
  { id: "content", title: "Content Moderation", sub: "Review reported posts \u0026 stories", icon: "flag-outline", color: "#FF453A", route: "/reported-content" },
  { id: "analytics", title: "App Analytics", sub: "Growth, engagement \u0026 revenue", icon: "bar-chart-outline", color: "#4A6741", route: "/analytics" },
  { id: "settings", title: "App Settings", sub: "Features, announcements \u0026 config", icon: "settings-outline", color: "#8E8E93", route: "/settings" },
  { id: "support", title: "Support Inbox", sub: "Chat live with users", icon: "chatbubbles-outline", color: "#0E7B5B", route: "/dm/support" },
  { id: "live", title: "Live Stream Control", sub: "Start or manage live sessions", icon: "radio-outline", color: "#C85200", route: "/go-live" },
  { id: "bulletin", title: "Edit Bulletin", sub: "Update church bulletin content", icon: "newspaper-outline", color: "#B8860B", route: "/church-bulletin" },
];

export default function AdminScreen() {
  const insets = useSafeAreaInsets();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const [stats, setStats] = useState<AppStats>({
    totalUsers: 0,
    premiumUsers: 0,
    totalPosts: 0,
    reportedContent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      Alert.alert("Access Denied", "You do not have admin privileges.");
      router.back();
      return;
    }
    fetchStats();
  }, [isAdmin, adminLoading]);

  async function fetchStats() {
    try {
      setLoading(true);
      // These are example counts — replace with your actual Supabase tables
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      const { count: premiumUsers } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("plan", "premium");
      const { count: totalPosts } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true });
      const { count: reportedContent } = await supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      setStats({
        totalUsers: totalUsers ?? 0,
        premiumUsers: premiumUsers ?? 0,
        totalPosts: totalPosts ?? 0,
        reportedContent: reportedContent ?? 0,
      });
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }

  if (adminLoading || loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#4B7BEC" />
      </View>
    );
  }

  if (!isAdmin) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: "#3B5BDB22" }]}>
            <Text style={[styles.statValue, { color: "#3B5BDB" }]}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#D4AF3722" }]}>
            <Text style={[styles.statValue, { color: "#D4AF37" }]}>{stats.premiumUsers}</Text>
            <Text style={styles.statLabel}>Premium</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#4A674122" }]}>
            <Text style={[styles.statValue, { color: "#4A6741" }]}>{stats.totalPosts}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#FF453A22" }]}>
            <Text style={[styles.statValue, { color: "#FF453A" }]}>{stats.reportedContent}</Text>
            <Text style={styles.statLabel}>Reports</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>MANAGEMENT</Text>
        <View style={styles.card}>
          {ADMIN_MENU.map((item, i) => (
            <View key={item.id}>
              <TouchableOpacity style={styles.row} onPress={() => router.push(item.route as any)}>
                <View style={[styles.iconWrap, { backgroundColor: item.color + "22" }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowLabel}>{item.title}</Text>
                  <Text style={styles.rowSub}>{item.sub}</Text>
                </View>
                <Feather name="chevron-right" size={18} color="#636366" />
              </TouchableOpacity>
              {i < ADMIN_MENU.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>ACTIONS</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            onPress={() =>
              Alert.alert("Send Announcement", "Feature coming soon — integrate with your push notification service.")
            }
          >
            <View style={[styles.iconWrap, { backgroundColor: "#0E7B5B22" }]}>
              <Ionicons name="megaphone-outline" size={20} color="#0E7B5B" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Send Announcement</Text>
              <Text style={styles.rowSub}>Push notification to all users</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#636366" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.row}
            onPress={() =>
              Alert.alert("Export Data", "Feature coming soon — export users or analytics CSV.")
            }
          >
            <View style={[styles.iconWrap, { backgroundColor: "#8B3A8B22" }]}>
              <Ionicons name="download-outline" size={20} color="#8B3A8B" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Export Data</Text>
              <Text style={styles.rowSub}>Download CSV reports</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#636366" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  content: { paddingHorizontal: 16, paddingTop: 8 },
  statsRow: {
    flexDirection: "row", gap: 10, marginTop: 8, marginBottom: 4,
  },
  statCard: {
    flex: 1, borderRadius: 14, padding: 14, alignItems: "center", gap: 4,
  },
  statValue: { fontSize: 22, fontWeight: "800" },
  statLabel: { color: "#8E8E93", fontSize: 11, fontWeight: "600" },
  sectionLabel: {
    color: "#636366", fontSize: 11, fontWeight: "600", letterSpacing: 0.5,
    marginTop: 20, marginBottom: 6, marginLeft: 4,
  },
  card: { backgroundColor: "#111", borderRadius: 14, overflow: "hidden" },
  row: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16,
    paddingVertical: 14, gap: 12,
  },
  iconWrap: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rowText: { flex: 1 },
  rowLabel: { color: "#FFF", fontSize: 15, fontWeight: "600" },
  rowSub: { color: "#8E8E93", fontSize: 12, marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#2C2C2E", marginLeft: 66 },
});
