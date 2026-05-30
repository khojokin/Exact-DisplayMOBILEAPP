import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useFocusEffect } from "@react-navigation/native";
import { ensureDirectConversation, fetchConversations, type ConversationListItem } from "@/lib/chat";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/hooks/useTheme";
import { useAI } from "@/hooks/useAI";

interface DirectoryPerson {
  id: string;
  name: string;
  avatarUrl?: string;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function relativeTime(input?: string) {
  if (!input) return "";
  const date = new Date(input);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();
  const { t } = useTheme();
  const { aiEnabled, setAiEnabled } = useAI();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [directory, setDirectory] = useState<DirectoryPerson[]>([]);
  const [composeVisible, setComposeVisible] = useState(false);
  const [composeSearch, setComposeSearch] = useState("");

  const load = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setConversations([]);
      setDirectory([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [conversationRows, profileRows] = await Promise.all([
        fetchConversations(userId),
        supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .neq("id", userId)
          .order("full_name", { ascending: true })
          .limit(100),
      ]);

      setConversations(conversationRows);
      const people = (profileRows.data ?? []).map((row: any) => ({
        id: row.id,
        name: row.full_name ?? "Member",
        avatarUrl: row.avatar_url ?? undefined,
      }));
      setDirectory(people);
    } catch (loadError: any) {
      setError(loadError?.message ?? "Unable to load messages.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const filteredConversations = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter(
      (conversation) =>
        conversation.title.toLowerCase().includes(q) ||
        conversation.lastMessage.toLowerCase().includes(q)
    );
  }, [conversations, search]);

  const filteredDirectory = useMemo(() => {
    if (!composeSearch.trim()) return directory;
    const q = composeSearch.toLowerCase();
    return directory.filter((person) => person.name.toLowerCase().includes(q));
  }, [directory, composeSearch]);

  async function startDirectMessage(person: DirectoryPerson) {
    if (!userId) {
      Alert.alert("Sign in required", "Please sign in to send messages.");
      return;
    }

    try {
      const conversationId = await ensureDirectConversation(userId, person.id);
      setComposeVisible(false);
      setComposeSearch("");
      router.push({ pathname: "/dm/[id]", params: { id: conversationId } });
    } catch (startError: any) {
      Alert.alert("Unable to start chat", startError?.message ?? "Please try again.");
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <StatusBar barStyle={t.statusBar} backgroundColor={t.bg} />

      <View style={[styles.header, { paddingTop: topPad }]}> 
        <Text style={[styles.headerTitle, { color: t.text }]}>Messages</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <TouchableOpacity
            style={[styles.aiToggleBtn, { backgroundColor: aiEnabled ? "#6264A722" : "#3C3C3E22", borderColor: aiEnabled ? "#6264A7" : "#3C3C3E" }]}
            onPress={() => setAiEnabled(!aiEnabled)}
            activeOpacity={0.75}
          >
            <Ionicons name="sparkles-outline" size={14} color={aiEnabled ? "#6264A7" : "#636366"} />
            <Text style={{ color: aiEnabled ? "#6264A7" : "#636366", fontSize: 12, fontWeight: "600", marginLeft: 4 }}>
              AI {aiEnabled ? "On" : "Off"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={() => setComposeVisible(true)}>
            <Ionicons name="create-outline" size={22} color={t.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.searchWrap, { backgroundColor: t.card, borderColor: t.border }]}> 
        <Ionicons name="search-outline" size={15} color={t.mutedText} />
        <TextInput
          style={[styles.searchInput, { color: t.text }]}
          placeholder="Search messages"
          placeholderTextColor={t.mutedText}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <View style={styles.centerState}><Text style={{ color: t.subtext }}>Loading conversations...</Text></View>
      ) : error ? (
        <View style={styles.centerState}>
          <Text style={{ color: t.subtext, textAlign: "center" }}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 32 }}
          ListEmptyComponent={
            <View style={styles.centerState}>
              <Ionicons name="chatbubbles-outline" size={36} color={t.mutedText} />
              <Text style={{ color: t.subtext, marginTop: 10 }}>No real conversations yet.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.row, { borderBottomColor: t.border }]}
              onPress={() => router.push({ pathname: "/dm/[id]", params: { id: item.id } })}
            >
              <View style={[styles.avatar, { backgroundColor: "#3B5BDB" }]}> 
                <Text style={styles.avatarText}>{initials(item.title)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.rowTop}>
                  <Text style={[styles.rowTitle, { color: t.text }]} numberOfLines={1}>{item.title}</Text>
                  <Text style={[styles.rowTime, { color: t.mutedText }]}>{relativeTime(item.lastMessageAt)}</Text>
                </View>
                <Text style={[styles.rowBody, { color: t.subtext }]} numberOfLines={1}>{item.lastMessage}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <Modal visible={composeVisible} animationType="slide" onRequestClose={() => setComposeVisible(false)}>
        <View style={[styles.composeRoot, { backgroundColor: t.bg }]}> 
          <View style={[styles.composeHeader, { paddingTop: topPad }]}> 
            <TouchableOpacity onPress={() => setComposeVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.composeTitle, { color: t.text }]}>New Message</Text>
            <View style={{ width: 56 }} />
          </View>

          <View style={[styles.searchWrap, { marginHorizontal: 16, backgroundColor: t.card, borderColor: t.border }]}> 
            <Ionicons name="search-outline" size={15} color={t.mutedText} />
            <TextInput
              style={[styles.searchInput, { color: t.text }]}
              placeholder="Search members"
              placeholderTextColor={t.mutedText}
              value={composeSearch}
              onChangeText={setComposeSearch}
              autoFocus
            />
          </View>

          <FlatList
            data={filteredDirectory}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 32 }}
            ListEmptyComponent={
              <View style={styles.centerState}>
                <Text style={{ color: t.subtext }}>No members found.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity style={[styles.row, { borderBottomColor: t.border }]} onPress={() => startDirectMessage(item)}>
                <View style={[styles.avatar, { backgroundColor: "#6B7B5A" }]}> 
                  <Text style={styles.avatarText}>{initials(item.name)}</Text>
                </View>
                <Text style={[styles.rowTitle, { color: t.text }]}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 24, fontWeight: "700" },
  headerBtn: { padding: 6 },
  aiToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  searchWrap: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  searchInput: { flex: 1, fontSize: 14 },
  centerState: { alignItems: "center", justifyContent: "center", paddingTop: 48, paddingHorizontal: 16 },
  retryBtn: {
    marginTop: 12,
    backgroundColor: "#3B5BDB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  retryBtnText: { color: "#fff", fontWeight: "600" },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "700" },
  rowTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  rowTitle: { fontSize: 15, fontWeight: "600", flexShrink: 1 },
  rowTime: { fontSize: 12 },
  rowBody: { fontSize: 13, marginTop: 3 },
  composeRoot: { flex: 1 },
  composeHeader: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  composeTitle: { fontSize: 17, fontWeight: "700" },
  cancelText: { color: "#3B5BDB", fontSize: 16, fontWeight: "500" },
});
