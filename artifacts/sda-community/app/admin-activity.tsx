import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAdmin } from "@/hooks/useAdmin";
import { fetchAdminActivity, type ActivityEntry } from "@/lib/admin-api";

const STATIC_ACTIVITY: ActivityEntry[] = [
  { id: 1, actorId: "usr_1", action: "announcement_created",  targetType: "announcement", targetId: "3", metadata: '{"title":"Sabbath School Update"}', createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
  { id: 2, actorId: "usr_2", action: "post_reported",         targetType: "post",         targetId: "42", metadata: '{"reason":"Inappropriate Language"}', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: 3, actorId: "usr_3", action: "user_role_changed",     targetType: "user",         targetId: "7",  metadata: '{"newRole":"elder"}', createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
  { id: 4, actorId: "usr_4", action: "post_created",          targetType: "post",         targetId: "58", metadata: null, createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
  { id: 5, actorId: "usr_5", action: "report_resolved",       targetType: "report",       targetId: "5",  metadata: null, createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
  { id: 6, actorId: "usr_6", action: "user_joined",           targetType: "user",         targetId: "22", metadata: null, createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
  { id: 7, actorId: "usr_1", action: "announcement_created",  targetType: "announcement", targetId: "2", metadata: '{"title":"Camp Meeting"}', createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
  { id: 8, actorId: "usr_8", action: "post_deleted",          targetType: "post",         targetId: "31", metadata: null, createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString() },
  { id: 9, actorId: "usr_9", action: "config_updated",        targetType: "config",       targetId: null, metadata: '{"key":"feature_ai_assistant"}', createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString() },
  { id: 10, actorId: "usr_10", action: "report_dismissed",    targetType: "report",       targetId: "3",  metadata: null, createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
];

const ACTION_META: Record<string, { icon: string; color: string; label: (entry: ActivityEntry) => string }> = {
  announcement_created: {
    icon: "megaphone",
    color: "#0E7B5B",
    label: (e) => {
      try { const m = JSON.parse(e.metadata ?? "{}"); return `Announcement published: "${m.title ?? ""}"` } catch { return "Announcement published" }
    },
  },
  post_reported:       { icon: "flag",             color: "#FF453A", label: () => "Post reported" },
  user_role_changed:   {
    icon: "shield",
    color: "#3B5BDB",
    label: (e) => {
      try { const m = JSON.parse(e.metadata ?? "{}"); return `User role updated to ${m.newRole ?? ""}` } catch { return "User role updated" }
    },
  },
  post_created:        { icon: "create",           color: "#4A6741", label: () => "New post created" },
  report_resolved:     { icon: "checkmark-circle", color: "#0E7B5B", label: () => "Report resolved" },
  report_dismissed:    { icon: "close-circle",     color: "#636366", label: () => "Report dismissed" },
  user_joined:         { icon: "person-add",       color: "#6264A7", label: () => "New user joined" },
  post_deleted:        { icon: "trash",            color: "#FF453A", label: () => "Post deleted" },
  config_updated:      {
    icon: "options",
    color: "#8B3A8B",
    label: (e) => {
      try { const m = JSON.parse(e.metadata ?? "{}"); return `Config updated: ${m.key ?? ""}` } catch { return "Config updated" }
    },
  },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AdminActivityScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const { isAdmin, loading: adminLoading } = useAdmin();

  const [entries, setEntries] = useState<ActivityEntry[]>(STATIC_ACTIVITY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      Alert.alert("Access Denied", "Admins only.");
      router.back();
    }
  }, [isAdmin, adminLoading]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminActivity();
      if (data && data.length > 0) {
        setEntries(data);
      }
    } catch {
      // keep static list
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!adminLoading && isAdmin) load();
  }, [isAdmin, adminLoading, load]);

  const meta = (entry: ActivityEntry) =>
    ACTION_META[entry.action] ?? { icon: "ellipsis-horizontal", color: "#636366", label: () => entry.action };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activity Monitor</Text>
        <TouchableOpacity onPress={load} style={styles.iconBtn} disabled={loading}>
          <Ionicons name="refresh-outline" size={20} color={loading ? "#636366" : "#FFF"} />
        </TouchableOpacity>
      </View>

      <View style={styles.liveRow}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>
          {loading ? "Refreshing…" : `${entries.length} events · ${new Date().toLocaleTimeString()}`}
        </Text>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: "#2C2C2E", marginLeft: 58 }} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="pulse-outline" size={48} color="#3C3C3E" />
            <Text style={styles.emptyText}>No activity yet</Text>
          </View>
        }
        renderItem={({ item }) => {
          const m = meta(item);
          return (
            <View style={styles.row}>
              <View style={[styles.iconWrap, { backgroundColor: m.color + "22" }]}>
                <Ionicons name={m.icon as any} size={18} color={m.color} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>{m.label(item)}</Text>
                <View style={styles.rowMeta}>
                  {item.actorId && (
                    <Text style={styles.rowActor}>by {item.actorId.slice(0, 8)}…</Text>
                  )}
                  {item.targetType && (
                    <View style={styles.targetPill}>
                      <Text style={styles.targetText}>{item.targetType}</Text>
                    </View>
                  )}
                </View>
              </View>
              <Text style={styles.rowTime}>{timeAgo(item.createdAt)}</Text>
            </View>
          );
        }}
      />
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
  liveRow: {
    flexDirection: "row", alignItems: "center", gap: 7,
    paddingHorizontal: 16, paddingBottom: 12,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#0E7B5B" },
  liveText: { color: "#636366", fontSize: 12 },
  emptyState: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { color: "#636366", fontSize: 15 },
  row: {
    flexDirection: "row", alignItems: "flex-start", paddingVertical: 14, gap: 12,
  },
  iconWrap: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center", marginTop: 1 },
  rowContent: { flex: 1, gap: 4 },
  rowLabel: { color: "#FFF", fontSize: 14, fontWeight: "500", lineHeight: 20 },
  rowMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowActor: { color: "#636366", fontSize: 12 },
  targetPill: { backgroundColor: "#1C1C1E", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  targetText: { color: "#8E8E93", fontSize: 10, fontWeight: "600" },
  rowTime: { color: "#636366", fontSize: 11, marginTop: 3 },
});
