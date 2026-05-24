import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  Alert,
  Animated,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

interface Message {
  id: string;
  text: string;
  sent: boolean;
  time: string;
  read?: boolean;
  sentAt?: number;
  editedAt?: number;
  replyToId?: string;
}

const CONVERSATIONS_DATA: Record<string, { name: string; color: string; initials: string; verified?: boolean; online?: boolean; messages: Message[] }> = {
  "erha-ai": {
    name: "Erha AI", color: "#6B7B5A", initials: "AI", verified: true, online: true,
    messages: [
      { id: "1", text: "Hi, I'm Erha AI in your chats. Ask me anything.", sent: false, time: "now" },
      { id: "2", text: "Give me today's verse and a short prayer.", sent: true, time: "now", read: true },
      { id: "3", text: "Verse: Psalm 46:10. Prayer: Lord, guide my steps today and fill me with peace. Amen.", sent: false, time: "now" },
    ],
  },
  "1": {
    name: "Pastor James Osei", color: "#3B5BDB", initials: "PJ", verified: true, online: true,
    messages: [
      { id: "1", text: "God bless you, brother! May the Lord keep you 🙏", sent: false, time: "10:12 AM" },
      { id: "2", text: "Amen! God bless you too Pastor. Looking forward to Sabbath service!", sent: true, time: "10:14 AM", read: true },
      { id: "3", text: "We have something very special prepared. Don't be late!", sent: false, time: "10:15 AM" },
      { id: "4", text: "I'll be there bright and early 🌅", sent: true, time: "10:16 AM", read: false },
    ],
  },
  "4": {
    name: "David Mensah", color: "#C85200", initials: "DM", verified: false, online: true,
    messages: [
      { id: "1", text: "Hey! How are you doing? 😊", sent: false, time: "4:08 PM" },
      { id: "2", text: "I'm blessed, thank you! How about you?", sent: true, time: "4:10 PM", read: true },
      { id: "3", text: "Doing great! Are you coming to the anniversary service?", sent: false, time: "4:11 PM" },
      { id: "4", text: "Yes! Wouldn't miss it for anything 🙌", sent: true, time: "4:12 PM", read: true },
      { id: "5", text: "Amazing! See you there. God bless you 🙏", sent: false, time: "4:13 PM" },
    ],
  },
  "2": {
    name: "Elder Ruth Nakamura", color: "#B8860B", initials: "ER", verified: true, online: false,
    messages: [
      { id: "1", text: "Amen! What a beautiful verse you shared today", sent: false, time: "2:30 PM" },
      { id: "2", text: "Thank you Elder Ruth! It really spoke to my heart", sent: true, time: "2:32 PM", read: true },
      { id: "3", text: "Keep sharing the Word, it edifies the whole community 🌟", sent: false, time: "2:33 PM" },
    ],
  },
  "3": {
    name: "SDA Prayer Group", color: "#4A6741", initials: "PG", verified: false, online: true,
    messages: [
      { id: "1", text: "We are praying for your mother, sister. God is faithful!", sent: false, time: "1:00 PM" },
      { id: "2", text: "Thank you so much everyone 🙏 It means the world", sent: true, time: "1:05 PM", read: true },
      { id: "3", text: "Let us continue to lift her up in prayer 🕊", sent: false, time: "1:07 PM" },
    ],
  },
};

const AUTO_REPLIES: Record<string, string[]> = {
  "erha-ai": [
    "I can help with prayers, verses, app navigation, and church reminders.",
    "Try asking: 'summarize today's devotional' or 'help me write a prayer request'.",
    "Here for you. Tell me what you need right now.",
  ],
  "1": ["God is good! 🙏", "Amen, see you Sabbath!", "Blessings to you and your family 💚"],
  "2": ["Indeed, the Lord is faithful!", "Praise God for His word 🙌", "Keep seeking His face, dear one"],
  "3": ["We are with you in prayer 🕊", "The Lord hears our cries!", "Be encouraged, God is near"],
  "4": ["Yes! God is getting all the glory 🎶", "See you at rehearsal!", "Blessed to be part of this community"],
};

function AvatarCircle({ initials, color, size = 32, online = false }: { initials: string; color: string; size?: number; online?: boolean }) {
  return (
    <View style={{ position: "relative" }}>
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#FFF", fontWeight: "700", fontSize: size * 0.36 }}>{initials}</Text>
      </View>
      {online && (
        <View style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: "#34C759", borderWidth: 1.5, borderColor: "#0A0A0A" }} />
      )}
    </View>
  );
}

function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -6, duration: 250, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 250, useNativeDriver: true }),
          Animated.delay(500 - delay),
        ])
      ).start();
    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, []);

  return (
    <View style={typing.row}>
      <View style={typing.bubble}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View key={i} style={[typing.dot, { transform: [{ translateY: dot }] }]} />
        ))}
      </View>
    </View>
  );
}

const typing = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", gap: 6, marginVertical: 4, paddingLeft: 12 },
  bubble: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#1C1C1E", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 },
  dot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#636366" },
});

export default function DMScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const listRef = useRef<FlatList>(null);

  const convo = CONVERSATIONS_DATA[id ?? "erha-ai"] ?? CONVERSATIONS_DATA["erha-ai"];
  const [messages, setMessages] = useState<Message[]>(convo.messages);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  const replyToMessage = replyToId ? messages.find((message) => message.id === replyToId) ?? null : null;
  const editingMessage = editingMessageId
    ? messages.find((message) => message.id === editingMessageId) ?? null
    : null;

  function canEditMessage(message: Message) {
    if (!message.sent || !message.sentAt) return false;
    return Date.now() - message.sentAt < 60_000;
  }

  function getEditWindowLeft(message: Message) {
    if (!message.sentAt) return 0;
    return Math.max(0, 60 - Math.floor((Date.now() - message.sentAt) / 1000));
  }

  function openMessageActions(message: Message) {
    if (!message.sent) {
      Alert.alert("Message", undefined, [
        { text: "Reply", onPress: () => setReplyToId(message.id) },
        { text: "Cancel", style: "cancel" },
      ]);
      return;
    }

    const options = [
      { text: "Reply", onPress: () => setReplyToId(message.id) },
      ...(canEditMessage(message)
        ? [
            {
              text: `Edit (${getEditWindowLeft(message)}s left)`,
              onPress: () => {
                setEditingMessageId(message.id);
                setInputText(message.text);
              },
            },
          ]
        : []),
      {
        text: "Delete",
        style: "destructive" as const,
        onPress: () => {
          setMessages((prev) => prev.filter((item) => item.id !== message.id));
          if (replyToId === message.id) setReplyToId(null);
          if (editingMessageId === message.id) {
            setEditingMessageId(null);
            setInputText("");
          }
        },
      },
      { text: "Cancel", style: "cancel" as const },
    ];

    Alert.alert("Message", undefined, options);
  }

  function handleSend() {
    if (!inputText.trim()) return;

    if (editingMessageId) {
      const editTarget = messages.find((message) => message.id === editingMessageId);
      if (!editTarget) {
        setEditingMessageId(null);
        setInputText("");
        return;
      }
      if (!canEditMessage(editTarget)) {
        Alert.alert("Edit expired", "You can only edit a sent message within 1 minute.");
        setEditingMessageId(null);
        setInputText("");
        return;
      }

      setMessages((prev) =>
        prev.map((message) =>
          message.id === editingMessageId
            ? {
                ...message,
                text: inputText.trim(),
                editedAt: Date.now(),
                time: `${new Date().toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })} · edited`,
              }
            : message
        )
      );
      setEditingMessageId(null);
      setInputText("");
      Haptics.selectionAsync();
      return;
    }

    const newMsg: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sent: true,
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      read: false,
      sentAt: Date.now(),
      replyToId: replyToId ?? undefined,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputText("");
    setReplyToId(null);
    Haptics.selectionAsync();
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

    // Simulate typing indicator then auto-reply
    setTimeout(() => setIsTyping(true), 800);
    setTimeout(() => {
      setIsTyping(false);
      const replies = AUTO_REPLIES[id ?? "erha-ai"] ?? ["God bless you! 🙏"];
      const reply = replies[Math.floor(Math.random() * replies.length)];
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: reply,
          sent: false,
          time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        },
      ]);
      // Mark sent message as read after reply
      setMessages((prev) => prev.map((m) => m.sent ? { ...m, read: true } : m));
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }, 2500);
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <AvatarCircle initials={convo.initials} color={convo.color} size={34} online={convo.online} />
        <View style={styles.headerInfo}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={styles.headerName}>{convo.name}</Text>
            {convo.verified && <Ionicons name="checkmark-circle" size={14} color="#0E7B5B" />}
          </View>
          <Text style={styles.headerStatus}>{convo.online ? "Active now" : "Offline"}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => router.push({ pathname: "/call/[id]", params: { id: id ?? "4", type: "audio" } })}
          >
            <Ionicons name="call-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => router.push({ pathname: "/call/[id]", params: { id: id ?? "4", type: "video" } })}
          >
            <Ionicons name="videocam-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          renderItem={({ item, index }) => {
            const showAvatar = !item.sent && (index === 0 || messages[index - 1]?.sent);
            const isLast = index === messages.length - 1;
            const repliedMessage = item.replyToId
              ? messages.find((message) => message.id === item.replyToId)
              : null;
            return (
              <View style={[styles.messageRow, item.sent && styles.messageRowSent]}>
                {!item.sent && (
                  <View style={styles.avatarSlot}>
                    {showAvatar ? (
                      <AvatarCircle initials={convo.initials} color={convo.color} size={28} />
                    ) : (
                      <View style={{ width: 28 }} />
                    )}
                  </View>
                )}
                <View>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onLongPress={() => openMessageActions(item)}
                    style={[styles.bubble, item.sent ? styles.bubbleSent : styles.bubbleReceived]}
                  >
                    {repliedMessage && (
                      <View style={styles.replyPreview}>
                        <Text style={styles.replyPreviewAuthor} numberOfLines={1}>
                          {repliedMessage.sent ? "You" : convo.name}
                        </Text>
                        <Text style={styles.replyPreviewText} numberOfLines={1}>{repliedMessage.text}</Text>
                      </View>
                    )}
                    <Text style={[styles.bubbleText, item.sent && styles.bubbleTextSent]}>{item.text}</Text>
                  </TouchableOpacity>
                  {/* Blue ticks on sent messages */}
                  {item.sent && isLast && (
                    <View style={styles.readRow}>
                      <Ionicons
                        name="checkmark-done"
                        size={13}
                        color="#111111"
                      />
                    </View>
                  )}
                </View>
              </View>
            );
          }}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          showsVerticalScrollIndicator={false}
        />

        {(replyToMessage || editingMessage) && (
          <View style={styles.composerNoticeRow}>
            <View style={styles.composerNoticeBar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.composerNoticeTitle}>
                {editingMessage
                  ? `Editing message (${getEditWindowLeft(editingMessage)}s left)`
                  : `Replying to ${replyToMessage?.sent ? "You" : convo.name}`}
              </Text>
              <Text style={styles.composerNoticeText} numberOfLines={1}>
                {editingMessage ? editingMessage.text : replyToMessage?.text}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setReplyToId(null);
                setEditingMessageId(null);
                setInputText("");
              }}
            >
              <Ionicons name="close" size={18} color="#8E8E93" />
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.inputRow, { paddingBottom: bottomPad + 8 }]}>
          <TouchableOpacity style={styles.inputIcon} onPress={() => Alert.alert("Camera", "Choose a source", [{ text: "Take Photo" }, { text: "Choose from Library" }, { text: "Cancel", style: "cancel" }])}>
            <Ionicons name="camera-outline" size={24} color="#8E8E93" />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder={editingMessage ? "Edit your message..." : "Message..."}
            placeholderTextColor="#636366"
            value={inputText}
            onChangeText={setInputText}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            multiline
          />
          {inputText.trim() ? (
            <TouchableOpacity style={styles.inputIcon} onPress={handleSend}>
              <Ionicons name="send" size={22} color="#6B7B5A" />
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.inputIcon} onPress={() => { setInputText("❤️"); }}>
                <Ionicons name="mic-outline" size={24} color="#8E8E93" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.inputIcon} onPress={() => { setInputText("❤️"); }}>
                <Ionicons name="heart-outline" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#1D1D1F",
    gap: 8,
  },
  backBtn: { padding: 4 },
  headerInfo: { flex: 1 },
  headerName: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
  headerStatus: { color: "#34C759", fontSize: 11, marginTop: 1 },
  headerActions: { flexDirection: "row", gap: 2 },
  callBtn: { padding: 8 },
  messageList: { flex: 1 },
  messageListContent: { paddingHorizontal: 10, paddingVertical: 12, gap: 2 },
  messageRow: { flexDirection: "row", alignItems: "flex-end", gap: 6, marginVertical: 1 },
  messageRowSent: { justifyContent: "flex-end" },
  avatarSlot: { width: 28 },
  bubble: {
    maxWidth: "74%",
    minWidth: 56,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 18,
  },
  bubbleReceived: { backgroundColor: "#232326", borderBottomLeftRadius: 6 },
  bubbleSent: { backgroundColor: "#2E7D4E", borderBottomRightRadius: 6, maxWidth: "70%" },
  bubbleText: { color: "#EDEDED", fontSize: 14, lineHeight: 19, flexShrink: 1 },
  bubbleTextSent: { color: "#FFFFFF" },
  replyPreview: {
    borderLeftWidth: 2,
    borderLeftColor: "rgba(255,255,255,0.35)",
    paddingLeft: 8,
    marginBottom: 6,
  },
  replyPreviewAuthor: { color: "#FFFFFF", fontSize: 11, fontWeight: "700", opacity: 0.9 },
  replyPreviewText: { color: "#C7C7CC", fontSize: 12, marginTop: 1 },
  readRow: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", marginTop: 2, paddingRight: 3 },
  composerNoticeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    backgroundColor: "#0A0A0A",
  },
  composerNoticeBar: {
    width: 3,
    height: 30,
    borderRadius: 2,
    backgroundColor: "#6B7B5A",
  },
  composerNoticeTitle: { color: "#DADADB", fontSize: 12, fontWeight: "600" },
  composerNoticeText: { color: "#8E8E93", fontSize: 12, marginTop: 2 },
  inputRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 8, paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#2C2C2E",
    backgroundColor: "#0A0A0A", gap: 4,
  },
  inputIcon: { padding: 6 },
  textInput: {
    flex: 1, backgroundColor: "#1C1C1E", borderRadius: 22,
    paddingHorizontal: 14, paddingVertical: 9,
    color: "#FFFFFF", fontSize: 15, maxHeight: 120,
  },
});
