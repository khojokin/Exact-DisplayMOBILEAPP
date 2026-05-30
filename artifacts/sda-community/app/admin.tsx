import React, { useCallback, useEffect, useState } from "react";
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
  Modal,
  TextInput,
  Share,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAdmin } from "@/hooks/useAdmin";
import { useUser } from "@clerk/clerk-expo";
import { fetchAdminStats, createAnnouncement, type AdminStats } from "@/lib/admin-api";
import { supabase } from "@/lib/supabase";

interface AppStats {
  totalUsers: number;
  premiumUsers: number;
  totalPosts: number;
  reportedContent: number;
  totalComments: number;
  activeAnnouncements: number;
}

const ADMIN_MENU = [
  { id: "users",         title: "User Management",    sub: "View, ban & manage roles",         icon: "people-outline",    color: "#3B5BDB", route: "/admin-users" },
  { id: "content",       title: "Content Moderation", sub: "Review reported posts & stories",  icon: "flag-outline",      color: "#FF453A", route: "/reported-content" },
  { id: "announcements", title: "Announcements",       sub: "Create & manage app-wide notices", icon: "megaphone-outline", color: "#0E7B5B", route: "/admin-announcements" },
  { id: "analytics",     title: "App Analytics",      sub: "Growth, engagement & revenue",     icon: "bar-chart-outline", color: "#4A6741", route: "/analytics" },
  { id: "activity",      title: "Activity Monitor",   sub: "Live feed of app events",          icon: "pulse-outline",     color: "#C85200", route: "/admin-activity" },
  { id: "config",        title: "App Config",         sub: "Feature flags & publishable keys", icon: "options-outline",   color: "#8B3A8B", route: "/admin-config" },
  { id: "bulletin",      title: "Edit Bulletin",      sub: "Update church bulletin content",   icon: "newspaper-outline", color: "#B8860B", route: "/church-bulletin" },
  { id: "events",        title: "Church Events",      sub: "Schedule and manage events",       icon: "calendar-outline",  color: "#3B5BDB", route: "/church-events" },
  { id: "live",          title: "Live Stream Control", sub: "Start or manage live sessions",  icon: "radio-outline",     color: "#B33A3A", route: "/go-live" },
];

export default function AdminScreen() {
  const insets = useSafeAreaInsets();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { user } = useUser();
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  const [stats, setStats] = useState<AppStats>({
    totalUsers: 0, premiumUsers: 0, totalPosts: 0,
    reportedContent: 0, totalComments: 0, activeAnnouncements: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const [announceVisible, setAnnounceVisible] = useState(false);
  const [announceTitle, setAnnounceTitle] = useState("");
  const [announceBody, setAnnounceBody] = useState("");
  const [announcePin, setAnnouncePin] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      Alert.alert("Access Denied", "You do not have admin privileges.");
      router.back();
    }
  }, [isAdmin, adminLoading]);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const [apiResult, supaResult] = await Promise.allSettled([
        fetchAdminStats(),
        Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("plan", "premium"),
          supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "open"),
        ]),
      ]);

      const merged: AppStats = {
        totalUsers: 0, premiumUsers: 0, totalPosts: 0,
        reportedContent: 0, totalComments: 0, activeAnnouncements: 0,
      };

      if (apiResult.status === "fulfilled") {
        const s = apiResult.value as AdminStats;
        merged.totalUsers = s.totalUsers;
        merged.totalPosts = s.totalPosts;
        merged.totalComments = s.totalComments;
        merged.activeAnnouncements = s.activeAnnouncements;
      }

      if (supaResult.status === "fulfilled") {
        const [usersR, premiumR, reportsR] = supaResult.value;
        if (usersR.count != null) merged.totalUsers = Math.max(merged.totalUsers, usersR.count);
        if (premiumR.count != null) merged.premiumUsers = premiumR.count;
        if (reportsR.count != null) merged.reportedContent = reportsR.count;
      }

      setStats(merged);
      setLastRefresh(new Date());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!adminLoading && isAdmin) fetchStats();
  }, [isAdmin, adminLoading, fetchStats]);

  async function sendAnnouncement() {
    if (!announceTitle.trim()) { Alert.alert("Required", "Please enter a title."); return; }
    if (!announceBody.trim()) { Alert.alert("Required", "Please enter a message."); return; }
    try {
      setSending(true);
      await createAnnouncement({
        title: announceTitle.trim(),
        body: announceBody.trim(),
        createdById: user?.id,
        isPinned: announcePin,
      });
      setAnnounceVisible(false);
      setAnnounceTitle("");
      setAnnounceBody("");
      setAnnouncePin(false);
      fetchStats();
      Alert.alert("Published!", "Your announcement is now live for all users.");
    } catch (err: any) {
      Alert.alert("Failed", err?.message ?? "Could not publish announcement.");
    } finally {
      setSending(false);
    }
  }

  async function exportData() {
    const lines = [
      "SDA Community — Admin Stats Export",
      `Generated: ${new Date().toLocaleString()}`,
      "",
      "── PLATFORM STATS ──────────────────",
      `Total Users:          ${stats.totalUsers}`,
      `Premium Subscribers:  ${stats.premiumUsers}`,
      `Total Posts:          ${stats.totalPosts}`,
      `Total Comments:       ${stats.totalComments}`,
      `Active Announcements: ${stats.activeAnnouncements}`,
      `Open Reports:         ${stats.reportedContent}`,
    ];
    try {
      await Share.share({ message: lines.join("\n"), title: "SDA Community Export" });
    } catch {
      Alert.alert("Stats Export", lines.join("\n"));
    }
  }

  if (adminLoading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#4B7BEC" />
      </View>
    );
  }

  if (!isAdmin) return null;

  const STAT_CARDS = [
    { label: "Users",    value: stats.totalUsers,         color: "#3B5BDB" },
    { label: "Premium",  value: stats.premiumUsers,        color: "#D4AF37" },
    { label: "Posts",    value: stats.totalPosts,          color: "#4A6741" },
    { label: "Comments", value: stats.totalComments,       color: "#6264A7" },
    { label: "Reports",  value: stats.reportedContent,     color: "#FF453A" },
    { label: "Notices",  value: stats.activeAnnouncements, color: "#0E7B5B" },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity onPress={fetchStats} style={styles.iconBtn} disabled={loading}>
          <Ionicons name="refresh-outline" size={20} color={loading ? "#636366" : "#FFF"} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: loading ? "#636366" : "#0E7B5B" }]} />
          <Text style={styles.statusText}>
            {loading ? "Refreshing…" : lastRefresh ? `Updated ${lastRefresh.toLocaleTimeString()}` : "Tap ↻ to refresh"}
          </Text>
        </View>

        <View style={styles.statsGrid}>
          {STAT_CARDS.map((c) => (
            <View key={c.label} style={[styles.statCard, { borderColor: c.color + "44" }]}>
              {loading
                ? <ActivityIndicator size="small" color={c.color} />
                : <Text style={[styles.statValue, { color: c.color }]}>{c.value}</Text>
              }
              <Text style={styles.statLabel}>{c.label}</Text>
            </View>
          ))}
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
                {item.id === "content" && stats.reportedContent > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{stats.reportedContent}</Text>
                  </View>
                )}
                {item.id === "announcements" && stats.activeAnnouncements > 0 && (
                  <View style={[styles.badge, { backgroundColor: "#0E7B5B" }]}>
                    <Text style={styles.badgeText}>{stats.activeAnnouncements}</Text>
                  </View>
                )}
                <Feather name="chevron-right" size={18} color="#636366" />
              </TouchableOpacity>
              {i < ADMIN_MENU.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => setAnnounceVisible(true)}>
            <View style={[styles.iconWrap, { backgroundColor: "#0E7B5B22" }]}>
              <Ionicons name="megaphone-outline" size={20} color="#0E7B5B" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Send Announcement</Text>
              <Text style={styles.rowSub}>Publish a notice to all users</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#636366" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={exportData}>
            <View style={[styles.iconWrap, { backgroundColor: "#8B3A8B22" }]}>
              <Ionicons name="download-outline" size={20} color="#8B3A8B" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Export Stats Report</Text>
              <Text style={styles.rowSub}>Share a snapshot of key metrics</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#636366" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={() => router.push("/admin-users" as any)}>
            <View style={[styles.iconWrap, { backgroundColor: "#3B5BDB22" }]}>
              <Ionicons name="person-add-outline" size={20} color="#3B5BDB" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Manage User Roles</Text>
              <Text style={styles.rowSub}>Assign pastor, elder, deacon roles</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#636366" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>SIGNED IN AS</Text>
        <View style={[styles.card, styles.row]}>
          <View style={[styles.iconWrap, { backgroundColor: "#6264A722" }]}>
            <Ionicons name="shield-checkmark" size={20} color="#6264A7" />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>{user?.fullName ?? "Admin"}</Text>
            <Text style={styles.rowSub}>{user?.primaryEmailAddress?.emailAddress ?? ""}</Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={announceVisible}
        transparent
        animationType="slide"
        onRequestClose={() => !sending && setAnnounceVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => !sending && setAnnounceVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>New Announcement</Text>

            <Text style={styles.fieldLabel}>Title</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="e.g. Sabbath School Update"
              placeholderTextColor="#48484A"
              value={announceTitle}
              onChangeText={setAnnounceTitle}
              autoCorrect={false}
              editable={!sending}
            />

            <Text style={styles.fieldLabel}>Message</Text>
            <TextInput
              style={[styles.fieldInput, styles.fieldMulti]}
              placeholder="Write the full announcement here…"
              placeholderTextColor="#48484A"
              value={announceBody}
              onChangeText={setAnnounceBody}
              multiline
              textAlignVertical="top"
              editable={!sending}
            />

            <TouchableOpacity style={styles.pinRow} onPress={() => setAnnouncePin(!announcePin)}>
              <View style={[styles.checkbox, announcePin && styles.checkboxOn]}>
                {announcePin && <Ionicons name="checkmark" size={13} color="#FFF" />}
              </View>
              <Text style={styles.pinText}>Pin to top of feed</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.publishBtn, sending && { opacity: 0.5 }]}
              onPress={sendAnnouncement}
              disabled={sending}
            >
              {sending
                ? <ActivityIndicator size="small" color="#FFF" />
                : <Text style={styles.publishBtnText}>Publish Announcement</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dismissBtn}
              onPress={() => setAnnounceVisible(false)}
              disabled={sending}
            >
              <Text style={styles.dismissBtnText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12,
  },
  iconBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  content: { paddingHorizontal: 16, paddingTop: 4 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { color: "#636366", fontSize: 12 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  statCard: {
    width: "31%", borderRadius: 14, padding: 14, alignItems: "center",
    gap: 4, backgroundColor: "#111", borderWidth: 1,
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
  badge: {
    backgroundColor: "#FF453A", borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 2, marginRight: 6,
  },
  badgeText: { color: "#FFF", fontSize: 11, fontWeight: "700" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#1C1C1E", borderTopLeftRadius: 22, borderTopRightRadius: 22,
    paddingHorizontal: 20, paddingBottom: Platform.OS === "ios" ? 36 : 24, paddingTop: 8,
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: "#3C3C3E",
    alignSelf: "center", marginBottom: 20,
  },
  sheetTitle: { color: "#FFF", fontSize: 18, fontWeight: "700", marginBottom: 18 },
  fieldLabel: { color: "#8E8E93", fontSize: 12, fontWeight: "600", marginBottom: 6 },
  fieldInput: {
    backgroundColor: "#111", borderRadius: 10, borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2C2C2E", paddingHorizontal: 14, paddingVertical: 12,
    color: "#FFF", fontSize: 15, marginBottom: 14,
  },
  fieldMulti: { minHeight: 96, textAlignVertical: "top" },
  pinRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "#636366",
    alignItems: "center", justifyContent: "center",
  },
  checkboxOn: { backgroundColor: "#0E7B5B", borderColor: "#0E7B5B" },
  pinText: { color: "#AEAEB2", fontSize: 14 },
  publishBtn: {
    backgroundColor: "#0E7B5B", borderRadius: 14, height: 52,
    alignItems: "center", justifyContent: "center", marginBottom: 10,
  },
  publishBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  dismissBtn: {
    backgroundColor: "#2C2C2E", borderRadius: 14, height: 52,
    alignItems: "center", justifyContent: "center",
  },
  dismissBtnText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
});
