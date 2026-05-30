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
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";

type ReportStatus = "open" | "resolved" | "dismissed";
type FilterKey = "all" | ReportStatus;

interface Report {
  id: string;
  contentType: string;
  contentPreview: string;
  reportedBy: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
}

const STATIC_REPORTS: Report[] = [
  {
    id: "1",
    contentType: "Post",
    contentPreview: "This content contains inappropriate language that violates community standards...",
    reportedBy: "Emmanuel Darko",
    reason: "Inappropriate Language",
    status: "open",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    contentType: "Comment",
    contentPreview: "Spam link: click here to win prizes, visit www.example.com/spam",
    reportedBy: "Grace Adetokunbo",
    reason: "Spam",
    status: "open",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    contentType: "Story",
    contentPreview: "Story with content that may be considered offensive to community members",
    reportedBy: "Samuel Boateng",
    reason: "Offensive Content",
    status: "resolved",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    contentType: "Post",
    contentPreview: "False information being spread about church leadership and administration",
    reportedBy: "Abigail Owusu",
    reason: "Misinformation",
    status: "open",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    contentType: "Comment",
    contentPreview: "Harassment directed at a specific community member",
    reportedBy: "David Mensah",
    reason: "Harassment",
    status: "dismissed",
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
];

const FILTERS: { id: FilterKey; label: string }[] = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "resolved", label: "Resolved" },
  { id: "dismissed", label: "Dismissed" },
];

const STATUS_COLORS: Record<ReportStatus, string> = {
  open: "#FF453A",
  resolved: "#0E7B5B",
  dismissed: "#636366",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ReportedContentScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  const [filter, setFilter] = useState<FilterKey>("all");
  const [reports, setReports] = useState<Report[]>(STATIC_REPORTS);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("reports")
        .select("id, content_type, content_preview, reported_by, reason, status, created_at")
        .order("created_at", { ascending: false })
        .limit(100);

      if (data && data.length > 0) {
        setReports(
          data.map((r: any) => ({
            id: String(r.id),
            contentType: r.content_type ?? "Post",
            contentPreview: r.content_preview ?? "",
            reportedBy: r.reported_by ?? "Anonymous",
            reason: r.reason ?? "Violation",
            status: (r.status ?? "open") as ReportStatus,
            createdAt: r.created_at,
          }))
        );
      }
    } catch {
      // keep static list
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === "all" ? reports : reports.filter((r) => r.status === filter);

  const openCount = reports.filter((r) => r.status === "open").length;

  function handleAction(id: string, action: "resolve" | "dismiss" | "remove") {
    const labels = { resolve: "Resolved", dismiss: "Dismissed", remove: "Removed" };
    const next: Record<string, ReportStatus> = { resolve: "resolved", dismiss: "dismissed" };
    Alert.alert(
      action === "remove" ? "Remove Content" : labels[action],
      action === "remove"
        ? "This will permanently remove the reported content from the app."
        : `Mark this report as ${labels[action].toLowerCase()}?`,
      [
        {
          text: action === "remove" ? "Remove" : labels[action],
          style: action === "remove" ? "destructive" : "default",
          onPress: () => {
            if (action === "remove") {
              setReports((prev) => prev.filter((r) => r.id !== id));
            } else {
              setReports((prev) =>
                prev.map((r) => r.id === id ? { ...r, status: next[action] as ReportStatus } : r)
              );
            }
          },
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Reported Content</Text>
          {openCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{openCount} open</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={load} style={styles.backBtn}>
          <Ionicons name="refresh-outline" size={20} color={loading ? "#636366" : "#FFF"} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
      >
        {FILTERS.map((f) => {
          const count = f.id === "all" ? reports.length : reports.filter((r) => r.status === f.id).length;
          return (
            <TouchableOpacity
              key={f.id}
              style={[styles.filterChip, filter === f.id && styles.filterChipActive]}
              onPress={() => setFilter(f.id)}
            >
              <Text style={[styles.filterText, filter === f.id && styles.filterTextActive]}>
                {f.label}
              </Text>
              {count > 0 && (
                <View style={[styles.filterCount, filter === f.id && styles.filterCountActive]}>
                  <Text style={[styles.filterCountText, filter === f.id && styles.filterCountTextActive]}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4B7BEC" />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="shield-checkmark-outline" size={44} color="#636366" />
          </View>
          <Text style={styles.emptyTitle}>No {filter === "all" ? "" : filter} reports</Text>
          <Text style={styles.emptyBody}>
            {filter === "open"
              ? "No reports are pending review. The community is in good shape!"
              : "Nothing here yet."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 40, gap: 10, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.reportCard}>
              <View style={styles.reportTop}>
                <View style={styles.reportMeta}>
                  <View style={[styles.contentTypePill, { backgroundColor: "#1C1C1E" }]}>
                    <Text style={styles.contentTypeText}>{item.contentType}</Text>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: STATUS_COLORS[item.status] + "22" }]}>
                    <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[item.status] }]} />
                    <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.timeText}>{timeAgo(item.createdAt)}</Text>
              </View>

              <View style={[styles.reasonRow]}>
                <Ionicons name="flag" size={13} color="#FF9F0A" />
                <Text style={styles.reasonText}>{item.reason}</Text>
              </View>

              <Text style={styles.preview} numberOfLines={2}>{item.contentPreview}</Text>

              <View style={styles.reporterRow}>
                <Ionicons name="person-outline" size={13} color="#8E8E93" />
                <Text style={styles.reporterText}>Reported by {item.reportedBy}</Text>
              </View>

              {item.status === "open" && (
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnResolve]}
                    onPress={() => handleAction(item.id, "resolve")}
                  >
                    <Ionicons name="checkmark" size={14} color="#0E7B5B" />
                    <Text style={[styles.actionBtnText, { color: "#0E7B5B" }]}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnRemove]}
                    onPress={() => handleAction(item.id, "remove")}
                  >
                    <Ionicons name="trash-outline" size={14} color="#FF453A" />
                    <Text style={[styles.actionBtnText, { color: "#FF453A" }]}>Remove</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnDismiss]}
                    onPress={() => handleAction(item.id, "dismiss")}
                  >
                    <Ionicons name="close-outline" size={14} color="#636366" />
                    <Text style={[styles.actionBtnText, { color: "#636366" }]}>Dismiss</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 10,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  headerBadge: { backgroundColor: "#FF453A", borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  headerBadgeText: { color: "#FFF", fontSize: 11, fontWeight: "700" },
  filtersRow: { paddingHorizontal: 16, paddingBottom: 10, gap: 8, alignItems: "center" },
  filterChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: "#1C1C1E", borderWidth: StyleSheet.hairlineWidth, borderColor: "#2C2C2E",
  },
  filterChipActive: { backgroundColor: "#FF453A", borderColor: "#FF453A" },
  filterText: { color: "#8E8E93", fontSize: 13, fontWeight: "500" },
  filterTextActive: { color: "#FFF", fontWeight: "600" },
  filterCount: {
    minWidth: 18, height: 18, borderRadius: 9, backgroundColor: "#2C2C2E",
    alignItems: "center", justifyContent: "center", paddingHorizontal: 4,
  },
  filterCountActive: { backgroundColor: "rgba(255,255,255,0.25)" },
  filterCountText: { color: "#8E8E93", fontSize: 10, fontWeight: "700" },
  filterCountTextActive: { color: "#FFF" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 },
  emptyIcon: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: "#1C1C1E",
    alignItems: "center", justifyContent: "center", marginBottom: 20,
  },
  emptyTitle: { color: "#FFF", fontSize: 20, fontWeight: "700", marginBottom: 10 },
  emptyBody: { color: "#8E8E93", fontSize: 14, textAlign: "center", lineHeight: 22 },
  reportCard: {
    backgroundColor: "#111", borderRadius: 14, padding: 14, gap: 8,
    borderWidth: StyleSheet.hairlineWidth, borderColor: "#2C2C2E",
  },
  reportTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  reportMeta: { flexDirection: "row", gap: 8, alignItems: "center" },
  contentTypePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  contentTypeText: { color: "#AEAEB2", fontSize: 11, fontWeight: "600" },
  statusPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: "600" },
  timeText: { color: "#636366", fontSize: 11 },
  reasonRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  reasonText: { color: "#FF9F0A", fontSize: 12, fontWeight: "600" },
  preview: { color: "#AEAEB2", fontSize: 13, lineHeight: 19 },
  reporterRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  reporterText: { color: "#636366", fontSize: 12 },
  actionsRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  actionBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 5, paddingVertical: 9, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth,
  },
  actionBtnResolve: { backgroundColor: "#0E7B5B11", borderColor: "#0E7B5B44" },
  actionBtnRemove: { backgroundColor: "#FF453A11", borderColor: "#FF453A44" },
  actionBtnDismiss: { backgroundColor: "#1C1C1E", borderColor: "#2C2C2E" },
  actionBtnText: { fontSize: 13, fontWeight: "600" },
});
