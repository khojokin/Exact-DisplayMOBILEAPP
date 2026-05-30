import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Linking,
  Modal,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useFocusEffect } from "@react-navigation/native";
import {
  createPodcastSession,
  fetchPodcastSessions,
  resolvePodcastJoinUrl,
  type PodcastSession,
} from "@/lib/podcast";

function relativeTime(input: string) {
  const ms = Date.now() - new Date(input).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function PodcastScreen() {
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();
  const { user } = useUser();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<PodcastSession[]>([]);
  const [createVisible, setCreateVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const displayName = useMemo(
    () => user?.fullName ?? user?.username ?? user?.primaryEmailAddress?.emailAddress ?? "Host",
    [user]
  );

  const load = useCallback(async () => {
    setError(null);
    try {
      const rows = await fetchPodcastSessions(80);
      setSessions(rows);
    } catch (loadError: any) {
      setError(loadError?.message ?? "Unable to load podcast sessions.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function joinSession(session: PodcastSession, asHost = false) {
    if (!userId) {
      Alert.alert("Sign in required", "Please sign in to join podcast rooms.");
      return;
    }

    try {
      const url = await resolvePodcastJoinUrl({
        roomCode: session.roomCode,
        userIdentity: userId,
        userName: displayName,
        asHost,
      });
      await Linking.openURL(url);
    } catch (joinError: any) {
      Alert.alert("LiveKit unavailable", joinError?.message ?? "Unable to open this room.");
    }
  }

  async function createAndHostSession() {
    if (!userId) {
      Alert.alert("Sign in required", "Please sign in to host podcasts.");
      return;
    }

    const title = newTitle.trim();
    if (!title) {
      Alert.alert("Title required", "Please enter a podcast title.");
      return;
    }

    setCreating(true);
    try {
      const session = await createPodcastSession({
        title,
        hostIdentity: userId,
        hostName: displayName,
      });
      setCreateVisible(false);
      setNewTitle("");
      await load();
      await joinSession(session, true);
    } catch (createError: any) {
      Alert.alert("Create failed", createError?.message ?? "Unable to create this podcast room.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      <View style={[styles.header, { paddingTop: topPad }]}> 
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Podcast Live Rooms</Text>
        <TouchableOpacity onPress={() => setCreateVisible(true)} style={styles.headerBtn}>
          <Ionicons name="add-circle-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><Text style={styles.helper}>Loading live sessions...</Text></View>
      ) : error ? (
        <View style={styles.center}><Text style={[styles.helper, { textAlign: "center" }]}>{error}</Text></View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: insets.bottom + 30 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="radio-outline" size={38} color="#8E8E93" />
              <Text style={[styles.helper, { marginTop: 10 }]}>No real podcast sessions yet.</Text>
              <Text style={[styles.helper, { marginTop: 4, fontSize: 13 }]}>Create one to host on LiveKit.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHead}>
                <View>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardMeta}>by {item.hostName} · {relativeTime(item.createdAt)}</Text>
                </View>
                <View style={[styles.badge, item.status === "live" ? styles.liveBadge : styles.idleBadge]}>
                  <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
                </View>
              </View>

              <Text style={styles.roomCode}>Room: {item.roomCode}</Text>

              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.joinBtn} onPress={() => joinSession(item, false)}>
                  <Ionicons name="headset-outline" size={16} color="#fff" />
                  <Text style={styles.joinText}>Join Listener</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.hostBtn} onPress={() => joinSession(item, true)}>
                  <Ionicons name="mic-outline" size={16} color="#D4EADC" />
                  <Text style={styles.hostText}>Host Mode</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={createVisible} transparent animationType="fade" onRequestClose={() => setCreateVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>New Podcast Session</Text>
              <TouchableOpacity onPress={() => setCreateVisible(false)}>
                <Ionicons name="close" size={20} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="e.g. Sabbath Study Room"
              placeholderTextColor="#636366"
            />

            <TouchableOpacity style={[styles.createBtn, creating && { opacity: 0.6 }]} disabled={creating} onPress={createAndHostSession}>
              <Text style={styles.createBtnText}>{creating ? "Creating..." : "Create & Go Live"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  header: {
    paddingHorizontal: 10,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerBtn: { width: 34, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, color: "#fff", fontSize: 18, fontWeight: "700" },
  center: { alignItems: "center", justifyContent: "center", paddingTop: 70, paddingHorizontal: 24 },
  helper: { color: "#B3B3B8", fontSize: 14 },
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2C2C2E",
    backgroundColor: "#111113",
    padding: 12,
    marginBottom: 10,
  },
  cardHead: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  cardTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  cardMeta: { color: "#8E8E93", fontSize: 12, marginTop: 3 },
  roomCode: { color: "#C8C8CC", fontSize: 12, marginTop: 10 },
  badge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  liveBadge: { backgroundColor: "rgba(52,199,89,0.2)", borderWidth: 1, borderColor: "rgba(52,199,89,0.4)" },
  idleBadge: { backgroundColor: "rgba(255,149,0,0.2)", borderWidth: 1, borderColor: "rgba(255,149,0,0.35)" },
  badgeText: { color: "#D4EADC", fontSize: 10, fontWeight: "700" },
  actionsRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
  joinBtn: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#3B5BDB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  joinText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  hostBtn: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2C2C2E",
    backgroundColor: "#1A1A1D",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  hostText: { color: "#D4EADC", fontWeight: "600", fontSize: 13 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  modalCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2C2C2E",
    backgroundColor: "#111113",
    padding: 14,
  },
  modalHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  modalTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  label: { color: "#8E8E93", fontSize: 12, marginTop: 14, marginBottom: 6 },
  input: {
    height: 40,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2C2C2E",
    backgroundColor: "#1A1A1D",
    color: "#fff",
    paddingHorizontal: 12,
  },
  createBtn: {
    marginTop: 14,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#3B5BDB",
    alignItems: "center",
    justifyContent: "center",
  },
  createBtnText: { color: "#fff", fontWeight: "700" },
});
