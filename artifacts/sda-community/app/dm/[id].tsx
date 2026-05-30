import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@clerk/clerk-expo";
import { useFocusEffect } from "@react-navigation/native";
import { fetchConversationMessages, markConversationRead, sendConversationMessage, type ChatMessage } from "@/lib/chat";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/hooks/useTheme";

const AI_CONVERSATION_IDS = ["erha-ai", "ai-assistant"];

interface ChatParticipant {
  id: string;
  name: string;
}

function relativeClock(input: string) {
  const date = new Date(input);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function DMScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();
  const { t } = useTheme();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 8 : insets.bottom;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);

  const conversationId = id ?? "";
  const isAIChat = AI_CONVERSATION_IDS.includes(conversationId);

  const title = useMemo(() => {
    const others = participants.filter((participant) => participant.id !== userId);
    if (others.length === 1) return others[0].name;
    if (others.length > 1) return `${others.length} members`;
    return "Conversation";
  }, [participants, userId]);

  const load = useCallback(async () => {
    if (!conversationId) {
      setLoading(false);
      setError("Conversation not found.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [messageRows, participantRows] = await Promise.all([
        fetchConversationMessages(conversationId),
        supabase
          .from("conversation_participants")
          .select("user_id")
          .eq("conversation_id", conversationId),
      ]);

      const participantIds = (participantRows.data ?? []).map((row: any) => row.user_id).filter(Boolean);
      let participantProfiles: any[] = [];
      if (participantIds.length) {
        const profileRes = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", participantIds);
        participantProfiles = profileRes.data ?? [];
      }

      setMessages(messageRows);
      setParticipants(
        participantIds.map((participantId) => {
          const profile = participantProfiles.find((item) => item.id === participantId);
          return {
            id: participantId,
            name: profile?.full_name ?? "Member",
          };
        })
      );

      if (userId) {
        await markConversationRead(conversationId, userId);
      }
    } catch (loadError: any) {
      setError(loadError?.message ?? "Unable to load this conversation.");
    } finally {
      setLoading(false);
    }
  }, [conversationId, userId]);

  useFocusEffect(
    useCallback(() => {
      load();

      if (!conversationId) return;
      const channel = supabase
        .channel(`conversation-${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          () => {
            load();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }, [conversationId, load])
  );

  async function handleSend() {
    if (!userId) {
      Alert.alert("Sign in required", "Please sign in to send messages.");
      return;
    }

    const content = input.trim();
    if (!content || !conversationId) return;

    try {
      await sendConversationMessage({
        conversationId,
        senderId: userId,
        content,
      });
      setInput("");
      await load();
    } catch (sendError: any) {
      Alert.alert("Send failed", sendError?.message ?? "Please try again.");
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar barStyle={t.statusBar} backgroundColor={t.bg} />

      <View style={[styles.header, { paddingTop: topPad, borderBottomColor: t.border }]}> 
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Feather name="chevron-left" size={24} color={t.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: t.text }]} numberOfLines={1}>{title}</Text>
          <Text style={[styles.headerSub, { color: t.subtext }]}>Real-time chat</Text>
        </View>
        {!isAIChat && (
          <>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => router.push({ pathname: "/call/[id]", params: { id: conversationId, type: "audio" } })}
            >
              <Ionicons name="call-outline" size={22} color={t.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => router.push({ pathname: "/call/[id]", params: { id: conversationId, type: "video" } })}
            >
              <Ionicons name="videocam-outline" size={22} color={t.text} />
            </TouchableOpacity>
          </>
        )}
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        {loading ? (
          <View style={styles.centerState}><Text style={{ color: t.subtext }}>Loading messages...</Text></View>
        ) : error ? (
          <View style={styles.centerState}><Text style={{ color: t.subtext, textAlign: "center" }}>{error}</Text></View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12 }}
            ListEmptyComponent={
              <View style={styles.centerState}><Text style={{ color: t.subtext }}>No real messages yet.</Text></View>
            }
            renderItem={({ item }) => {
              const sent = item.senderId === userId;
              return (
                <View style={[styles.messageRow, { justifyContent: sent ? "flex-end" : "flex-start" }]}> 
                  <View
                    style={[
                      styles.bubble,
                      {
                        backgroundColor: sent ? t.bubbleSent : t.bubbleReceived,
                        borderBottomRightRadius: sent ? 6 : 16,
                        borderBottomLeftRadius: sent ? 16 : 6,
                      },
                    ]}
                  >
                    <Text style={{ color: sent ? t.bubbleTextSent : t.bubbleTextReceived, fontSize: 15 }}>{item.content}</Text>
                    <Text style={[styles.messageTime, { color: sent ? "rgba(255,255,255,0.78)" : t.mutedText }]}>{relativeClock(item.createdAt)}</Text>
                  </View>
                </View>
              );
            }}
          />
        )}

        <View style={[styles.inputBar, { borderTopColor: t.border, paddingBottom: bottomPad + 8 }]}> 
          <TextInput
            style={[styles.input, { color: t.text, backgroundColor: t.card, borderColor: t.border }]}
            placeholder="Type a message"
            placeholderTextColor={t.mutedText}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 8,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerBtn: { padding: 6 },
  headerTitle: { fontSize: 16, fontWeight: "700" },
  headerSub: { fontSize: 12, marginTop: 1 },
  centerState: { alignItems: "center", justifyContent: "center", paddingTop: 46, paddingHorizontal: 16 },
  messageRow: { flexDirection: "row", marginBottom: 6 },
  bubble: {
    maxWidth: "78%",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  messageTime: { fontSize: 10, marginTop: 4 },
  inputBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingTop: 8,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 110,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 15,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B5BDB",
  },
});
