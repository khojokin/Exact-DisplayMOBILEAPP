import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  StatusBar,
  TextInput,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/hooks/useTheme";

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  timeAgo: string;
  unread: number;
  color: string;
  online: boolean;
  verified: boolean;
  typing?: boolean;
  delivered?: boolean;
  read?: boolean;
  pinned?: boolean;
  muted?: boolean;
  archived?: boolean;
}

const CONVERSATIONS: Conversation[] = [
  { id: "erha-ai", name: "Erha AI", lastMessage: "Ask anything about SDA Community or your day", timeAgo: "now", unread: 0, color: "#6B7B5A", online: true, verified: true, typing: false, read: true },
  { id: "1", name: "Pastor James Osei", lastMessage: "God bless you, see you Sabbath!", timeAgo: "2m", unread: 2, color: "#3B5BDB", online: true, verified: true, typing: false, read: false },
  { id: "2", name: "Elder Ruth Nakamura", lastMessage: "Amen! What a beautiful verse", timeAgo: "1h", unread: 0, color: "#B8860B", online: false, verified: true, typing: true, read: true },
  { id: "3", name: "SDA Prayer Group", lastMessage: "We are praying for your mother", timeAgo: "3h", unread: 5, color: "#4A6741", online: true, verified: false, typing: false, read: false },
  { id: "4", name: "David Mensah", lastMessage: "Rehearsal is at 6pm tonight", timeAgo: "5h", unread: 0, color: "#C85200", online: true, verified: false, typing: false, read: true },
  { id: "5", name: "Grace Adetokunbo", lastMessage: "Praying with you!", timeAgo: "1d", unread: 1, color: "#0E7B5B", online: false, verified: false, typing: false, read: false },
  { id: "6", name: "Worship Team", lastMessage: "Songs list has been updated", timeAgo: "2d", unread: 0, color: "#8B3A8B", online: false, verified: false, typing: false, read: true },
  { id: "7", name: "Samuel Boateng", lastMessage: "Thank you so much, brother", timeAgo: "3d", unread: 0, color: "#8B5E00", online: false, verified: false, typing: false, read: true },
];

const NEW_MSG_PEOPLE = [
  { id: "erha-ai", name: "Erha AI", color: "#6B7B5A", verified: true },
  { id: "1", name: "Pastor James Osei", color: "#3B5BDB", verified: true },
  { id: "2", name: "Elder Ruth Nakamura", color: "#B8860B", verified: true },
  { id: "4", name: "David Mensah", color: "#C85200", verified: false },
  { id: "5", name: "Grace Adetokunbo", color: "#0E7B5B", verified: false },
  { id: "7", name: "Samuel Boateng", color: "#8B5E00", verified: false },
  { id: "8", name: "Abigail Owusu", color: "#8B3A8B", verified: false },
  { id: "9", name: "Emmanuel Darko", color: "#C85200", verified: false },
];

function AvatarCircle({ name, color, size = 44, online = false }: { name: string; color: string; size?: number; online?: boolean }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <View style={{ position: "relative" }}>
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#FFF", fontWeight: "700", fontSize: size * 0.36 }}>{initials}</Text>
      </View>
      {online && (
        <View style={{
          position: "absolute", bottom: 1, right: 1,
          width: 12, height: 12, borderRadius: 6,
          backgroundColor: "#34C759", borderWidth: 2, borderColor: "#0A0A0A",
        }} />
      )}
    </View>
  );
}

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTheme();
  const [conversations, setConversations] = useState<Conversation[]>(CONVERSATIONS);
  const [searchText, setSearchText] = useState("");
  const [composeVisible, setComposeVisible] = useState(false);
  const [composeSearch, setComposeSearch] = useState("");
  const [actionsVisible, setActionsVisible] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const activeConversation = selectedConversation
    ? conversations.find((c) => c.id === selectedConversation.id) ?? selectedConversation
    : null;

  const conversationActions = [
    {
      id: "pin",
      label: activeConversation?.pinned ? "Unpin chat" : "Pin chat",
      icon: activeConversation?.pinned ? ("pin" as const) : ("pin-outline" as const),
    },
    { id: "archive", label: "Archive", icon: "archive-outline" as const },
    {
      id: "mute",
      label: activeConversation?.muted ? "Unmute" : "Mute",
      icon: activeConversation?.muted
        ? ("notifications" as const)
        : ("notifications-off-outline" as const),
    },
    { id: "delete", label: "Delete chat", icon: "trash-outline" as const, destructive: true },
  ];

  const filtered = conversations
    .filter((c) => !c.archived)
    .filter((c) =>
      c.name.toLowerCase().includes(searchText.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchText.toLowerCase())
    )
    .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)));

  const composeFiltered = NEW_MSG_PEOPLE.filter((p) =>
    composeSearch === "" || p.name.toLowerCase().includes(composeSearch.toLowerCase())
  );

  function openConversationActions(conversation: Conversation) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedConversation(conversation);
    setActionsVisible(true);
  }

  function runConversationAction(actionId: string) {
    if (!selectedConversation) return;

    if (actionId === "delete") {
      Alert.alert("Delete chat?", `Delete ${selectedConversation.name} chat permanently?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            setConversations((prev) => prev.filter((c) => c.id !== selectedConversation.id));
            setActionsVisible(false);
          },
        },
      ]);
      return;
    }

    Haptics.selectionAsync();
    setActionsVisible(false);
    setConversations((prev) =>
      prev.map((conversation) => {
        if (conversation.id !== selectedConversation.id) return conversation;
        if (actionId === "pin") return { ...conversation, pinned: !conversation.pinned };
        if (actionId === "mute") return { ...conversation, muted: !conversation.muted };
        if (actionId === "archive") return { ...conversation, archived: true };
        return conversation;
      })
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <StatusBar barStyle={t.statusBar} backgroundColor={t.bg} />
      <View style={[styles.header, { paddingTop: topPad }]}>
        <Text style={[styles.headerTitle, { color: t.text }]}>Messages</Text>
        <TouchableOpacity style={styles.newBtn} onPress={() => { Haptics.selectionAsync(); setComposeVisible(true); }}>
          <Ionicons name="create-outline" size={24} color={t.text} />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: t.card }]}>
        <Ionicons name="search-outline" size={16} color={t.mutedText} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: t.text }]}
          placeholder="Search messages..."
          placeholderTextColor={t.mutedText}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <Ionicons name="close-circle" size={16} color={t.mutedText} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.convoItem}
            activeOpacity={0.7}
            onPress={() => {
              Haptics.selectionAsync();
              router.push({ pathname: "/dm/[id]", params: { id: item.id } });
            }}
            onLongPress={() => openConversationActions(item)}
            delayLongPress={260}
          >
            <View style={styles.avatarWrap}>
              <AvatarCircle name={item.name} color={item.color} online={item.online} />
              {item.unread > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unread}</Text>
                </View>
              )}
            </View>
            <View style={styles.convoContent}>
              <View style={styles.convoTop}>
                <View style={styles.nameRow}>
                  <Text style={[styles.convoName, { color: item.unread > 0 ? t.text : t.subtext }, item.unread > 0 && styles.convoNameBold]}>{item.name}</Text>
                  {item.verified && (
                    <Ionicons name="checkmark-circle" size={14} color="#0E7B5B" style={{ marginLeft: 3 }} />
                  )}
                  {item.pinned && (
                    <Ionicons name="pin" size={12} color={t.subtext} style={{ marginLeft: 6 }} />
                  )}
                </View>
                <View style={styles.metaRow}>
                  {item.muted && <Ionicons name="notifications-off" size={12} color={t.subtext} />}
                  <Text style={[styles.convoTime, { color: t.mutedText }]}>{item.timeAgo}</Text>
                </View>
              </View>
              <View style={styles.convoBottom}>
                {item.typing ? (
                  <Text style={styles.typingText}>typing...</Text>
                ) : (
                  <Text style={[styles.convoLastMsg, { color: item.unread > 0 ? t.subtext : t.mutedText }, item.unread > 0 && styles.convoLastMsgBold]} numberOfLines={1}>
                    {item.lastMessage}
                  </Text>
                )}
                {/* Blue ticks for read receipts on sent messages */}
                {!item.unread && item.read && (
                  <View style={styles.ticksRow}>
                    <Ionicons name="checkmark-done" size={14} color="#111111" />
                  </View>
                )}
                {!item.unread && !item.read && item.delivered !== false && (
                  <View style={styles.ticksRow}>
                    <Ionicons name="checkmark-done" size={14} color="#111111" />
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 40 }}>
            <Ionicons name="chatbubbles-outline" size={40} color="#3C3C3E" />
            <Text style={{ color: "#636366", marginTop: 12, fontSize: 15 }}>No conversations found</Text>
          </View>
        }
        ItemSeparatorComponent={() => (
          <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: t.border, marginLeft: 76 }} />
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Instagram-style Compose New Message modal */}
      <Modal visible={composeVisible} animationType="slide" onRequestClose={() => setComposeVisible(false)}>
        <View style={[styles.composeContainer, { backgroundColor: t.bg }]}>
          <StatusBar barStyle={t.statusBar} backgroundColor={t.bg} />
          <View style={[styles.composeHeader, { paddingTop: topPad }]}>
            <TouchableOpacity onPress={() => setComposeVisible(false)}>
              <Text style={styles.composeCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.composeTitle}>New Message</Text>
            <View style={{ width: 60 }} />
          </View>

          <View style={styles.composeSearch}>
            <Text style={styles.composeToLabel}>To:</Text>
            <TextInput
              style={styles.composeSearchInput}
              placeholder="Search people..."
              placeholderTextColor="#636366"
              value={composeSearch}
              onChangeText={setComposeSearch}
              autoFocus
            />
          </View>

          <Text style={styles.composeSectionLabel}>SUGGESTED</Text>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>
            {composeFiltered.map((person) => (
              <TouchableOpacity
                key={person.id}
                style={styles.composePersonRow}
                onPress={() => {
                  setComposeVisible(false);
                  setComposeSearch("");
                  router.push({ pathname: "/dm/[id]", params: { id: person.id } });
                }}
              >
                <AvatarCircle name={person.name} color={person.color} size={46} />
                <View style={styles.composePersonInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.composePersonName}>{person.name}</Text>
                    {person.verified && (
                      <Ionicons name="checkmark-circle" size={15} color="#0E7B5B" style={{ marginLeft: 4 }} />
                    )}
                  </View>
                  <Text style={styles.composePersonSub}>SDA Community member</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#3C3C3E" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={actionsVisible} transparent animationType="fade" onRequestClose={() => setActionsVisible(false)}>
        <TouchableOpacity
          style={styles.actionBackdrop}
          activeOpacity={1}
          onPress={() => setActionsVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={[styles.actionSheet, { backgroundColor: t.card, borderColor: t.border }]}>
            <View style={[styles.actionHeader, { borderBottomColor: t.border }]}>
              <Text style={[styles.actionTitle, { color: t.text }]}>{selectedConversation?.name ?? "Chat"}</Text>
              <Text style={[styles.actionSub, { color: t.subtext }]}>Message actions</Text>
            </View>
            {conversationActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.actionRow, { borderBottomColor: t.border }]}
                onPress={() => runConversationAction(action.id)}
              >
                <Ionicons
                  name={action.icon}
                  size={18}
                  color={action.destructive ? t.danger : t.text}
                />
                <Text style={[styles.actionText, { color: t.text }, action.destructive && { color: t.danger }]}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.actionCancel} onPress={() => setActionsVisible(false)}>
              <Text style={[styles.actionCancelText, { color: t.subtext }]}>Cancel</Text>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "700" },
  newBtn: { padding: 6 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchIcon: {},
  searchInput: { flex: 1, color: "#FFFFFF", fontSize: 15, paddingVertical: 10 },
  convoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  avatarWrap: { position: "relative" },
  unreadBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#6B7B5A",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#0A0A0A",
  },
  unreadText: { color: "#FFF", fontSize: 10, fontWeight: "700" },
  convoContent: { flex: 1 },
  convoTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 3 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  nameRow: { flexDirection: "row", alignItems: "center" },
  convoName: { color: "#AEAEB2", fontSize: 15, fontWeight: "500" },
  convoNameBold: { color: "#FFFFFF", fontWeight: "700" },
  convoTime: { color: "#636366", fontSize: 12 },
  convoBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  convoLastMsg: { color: "#636366", fontSize: 13, flex: 1 },
  convoLastMsgBold: { color: "#AEAEB2", fontWeight: "600" },
  typingText: { color: "#6B7B5A", fontSize: 13, fontStyle: "italic", flex: 1 },
  ticksRow: { marginLeft: 6 },
  // Compose modal
  composeContainer: { flex: 1, backgroundColor: "#0A0A0A" },
  composeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2C2C2E",
  },
  composeCancelText: { color: "#8E8E93", fontSize: 16 },
  composeTitle: { color: "#FFF", fontSize: 17, fontWeight: "700" },
  composeSearch: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2C2C2E",
    gap: 8,
  },
  composeToLabel: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  composeSearchInput: { flex: 1, color: "#FFF", fontSize: 16 },
  composeSectionLabel: {
    color: "#636366", fontSize: 11, fontWeight: "600", letterSpacing: 0.5,
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8,
  },
  composePersonRow: {
    flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10,
  },
  composePersonInfo: { flex: 1 },
  composePersonName: { color: "#FFF", fontSize: 15, fontWeight: "600" },
  composePersonSub: { color: "#8E8E93", fontSize: 12, marginTop: 2 },
  actionBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
    paddingHorizontal: 12,
    paddingBottom: 18,
  },
  actionSheet: {
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2C2C2E",
  },
  actionHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2C2C2E",
  },
  actionTitle: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  actionSub: { color: "#8E8E93", fontSize: 12, marginTop: 2 },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2C2C2E",
  },
  actionText: { color: "#FFF", fontSize: 15, fontWeight: "500" },
  actionTextDanger: { color: "#FF453A" },
  actionCancel: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  actionCancelText: { color: "#8E8E93", fontSize: 15, fontWeight: "600" },
});
