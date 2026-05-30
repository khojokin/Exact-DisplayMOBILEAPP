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
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { useAdmin } from "@/hooks/useAdmin";
import {
  fetchAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  type Announcement,
} from "@/lib/admin-api";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AdminAnnouncementsScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { user } = useUser();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [composeVisible, setComposeVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      Alert.alert("Access Denied", "Admins only.");
      router.back();
    }
  }, [isAdmin, adminLoading]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAnnouncements();
      setAnnouncements(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!adminLoading && isAdmin) load();
  }, [isAdmin, adminLoading, load]);

  async function handleCreate() {
    if (!title.trim()) { Alert.alert("Required", "Please enter a title."); return; }
    if (!body.trim()) { Alert.alert("Required", "Please enter a message."); return; }
    try {
      setSending(true);
      await createAnnouncement({ title: title.trim(), body: body.trim(), createdById: user?.id, isPinned });
      setComposeVisible(false);
      setTitle("");
      setBody("");
      setIsPinned(false);
      load();
      Alert.alert("Published!", "Announcement is now live.");
    } catch (err: any) {
      Alert.alert("Failed", err?.message ?? "Could not publish.");
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(id: number) {
    Alert.alert("Delete Announcement", "This cannot be undone.", [
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteAnnouncement(id);
            setAnnouncements((prev) => prev.filter((a) => a.id !== id));
          } catch {
            Alert.alert("Error", "Could not delete.");
          }
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  if (adminLoading || loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#4B7BEC" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Announcements</Text>
        <TouchableOpacity onPress={() => setComposeVisible(true)} style={styles.iconBtn}>
          <Ionicons name="add" size={24} color="#0E7B5B" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={announcements}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: insets.bottom + 40, gap: 10 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="megaphone-outline" size={48} color="#3C3C3E" />
            <Text style={styles.emptyTitle}>No Announcements</Text>
            <Text style={styles.emptyBody}>Tap the + button to create your first announcement.</Text>
            <TouchableOpacity style={styles.createBtn} onPress={() => setComposeVisible(true)}>
              <Text style={styles.createBtnText}>Create Announcement</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.cardMeta}>
                {item.isPinned && (
                  <View style={styles.pinnedPill}>
                    <Ionicons name="pin" size={11} color="#D4AF37" />
                    <Text style={styles.pinnedText}>Pinned</Text>
                  </View>
                )}
                <View style={[styles.activePill, { backgroundColor: item.isActive ? "#0E7B5B22" : "#63636622" }]}>
                  <View style={[styles.activeDot, { backgroundColor: item.isActive ? "#0E7B5B" : "#636366" }]} />
                  <Text style={[styles.activeText, { color: item.isActive ? "#0E7B5B" : "#636366" }]}>
                    {item.isActive ? "Active" : "Inactive"}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={18} color="#FF453A" />
              </TouchableOpacity>
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardBody} numberOfLines={3}>{item.body}</Text>
            <Text style={styles.cardTime}>{timeAgo(item.createdAt)}</Text>
          </View>
        )}
      />

      <Modal
        visible={composeVisible}
        transparent
        animationType="slide"
        onRequestClose={() => !sending && setComposeVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => !sending && setComposeVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>New Announcement</Text>

            <Text style={styles.fieldLabel}>Title</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="e.g. Camp Meeting Details"
              placeholderTextColor="#48484A"
              value={title}
              onChangeText={setTitle}
              editable={!sending}
            />

            <Text style={styles.fieldLabel}>Message</Text>
            <TextInput
              style={[styles.fieldInput, styles.fieldMulti]}
              placeholder="Write the full announcement here…"
              placeholderTextColor="#48484A"
              value={body}
              onChangeText={setBody}
              multiline
              textAlignVertical="top"
              editable={!sending}
            />

            <TouchableOpacity style={styles.pinRow} onPress={() => setIsPinned(!isPinned)}>
              <View style={[styles.checkbox, isPinned && styles.checkboxOn]}>
                {isPinned && <Ionicons name="checkmark" size={13} color="#FFF" />}
              </View>
              <Text style={styles.pinText}>Pin to top of feed</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.publishBtn, sending && { opacity: 0.5 }]}
              onPress={handleCreate}
              disabled={sending}
            >
              {sending
                ? <ActivityIndicator size="small" color="#FFF" />
                : <Text style={styles.publishBtnText}>Publish</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setComposeVisible(false)} disabled={sending}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
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
  emptyState: { alignItems: "center", paddingTop: 80, gap: 12, paddingHorizontal: 32 },
  emptyTitle: { color: "#FFF", fontSize: 20, fontWeight: "700" },
  emptyBody: { color: "#8E8E93", fontSize: 14, textAlign: "center", lineHeight: 21 },
  createBtn: {
    marginTop: 8, backgroundColor: "#0E7B5B", borderRadius: 14,
    paddingHorizontal: 28, paddingVertical: 13,
  },
  createBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  card: {
    backgroundColor: "#111", borderRadius: 14, padding: 14, gap: 6,
    borderWidth: StyleSheet.hairlineWidth, borderColor: "#2C2C2E",
  },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardMeta: { flexDirection: "row", gap: 8 },
  pinnedPill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#D4AF3722", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  pinnedText: { color: "#D4AF37", fontSize: 11, fontWeight: "600" },
  activePill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  activeDot: { width: 6, height: 6, borderRadius: 3 },
  activeText: { fontSize: 11, fontWeight: "600" },
  deleteBtn: { padding: 4 },
  cardTitle: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  cardBody: { color: "#AEAEB2", fontSize: 14, lineHeight: 20 },
  cardTime: { color: "#636366", fontSize: 12 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#1C1C1E", borderTopLeftRadius: 22, borderTopRightRadius: 22,
    paddingHorizontal: 20, paddingBottom: Platform.OS === "ios" ? 36 : 24, paddingTop: 8,
  },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: "#3C3C3E", alignSelf: "center", marginBottom: 20 },
  sheetTitle: { color: "#FFF", fontSize: 18, fontWeight: "700", marginBottom: 18 },
  fieldLabel: { color: "#8E8E93", fontSize: 12, fontWeight: "600", marginBottom: 6 },
  fieldInput: {
    backgroundColor: "#111", borderRadius: 10, borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2C2C2E", paddingHorizontal: 14, paddingVertical: 12,
    color: "#FFF", fontSize: 15, marginBottom: 14,
  },
  fieldMulti: { minHeight: 96, textAlignVertical: "top" },
  pinRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "#636366", alignItems: "center", justifyContent: "center" },
  checkboxOn: { backgroundColor: "#0E7B5B", borderColor: "#0E7B5B" },
  pinText: { color: "#AEAEB2", fontSize: 14 },
  publishBtn: { backgroundColor: "#0E7B5B", borderRadius: 14, height: 52, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  publishBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  cancelBtn: { backgroundColor: "#2C2C2E", borderRadius: 14, height: 52, alignItems: "center", justifyContent: "center" },
  cancelBtnText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
});
