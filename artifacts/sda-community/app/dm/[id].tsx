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
import { useTheme } from "@/hooks/useTheme";

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

function AvatarCircle({ initials, color, size = 32, online = false, borderColor }: { initials: string; color: string; size?: number; online?: boolean; borderColor?: string }) {
  return (
    <View style={{ position: "relative" }}>
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#FFF", fontWeight: "700", fontSize: size * 0.36 }}>{initials}</Text>
      </View>
      {online && (
        <View style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: "#34C759", borderWidth: 1.5, borderColor: borderColor ?? "#0A0A0A" }} />
      )}
    </View>
  );
}

function TypingIndicator({ bubbleBg }: { bubbleBg: string }) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -5, duration: 220, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 220, useNativeDriver: true }),
          Animated.delay(500 - delay),
        ])
      ).start();
    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, []);

  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", paddingLeft: 44, paddingVertical: 2 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: bubbleBg, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 }}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#636366", transform: [{ translateY: dot }] }} />
        ))}
      </View>
    </View>
  );
}

export default function DMScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 8 : insets.bottom;
  const listRef = useRef<FlatList>(null);
  const { t } = useTheme();

  const convo = CONVERSATIONS_DATA[id ?? "erha-ai"] ?? CONVERSATIONS_DATA["erha-ai"];
  const [messages, setMessages] = useState<Message[]>(convo.messages);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  const replyToMessage = replyToId ? messages.find((m) => m.id === replyToId) ?? null : null;
  const editingMessage = editingMessageId ? messages.find((m) => m.id === editingMessageId) ?? null : null;

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
    Alert.alert("Message", undefined, [
      { text: "Reply", onPress: () => setReplyToId(message.id) },
      ...(canEditMessage(message)
        ? [{ text: `Edit (${getEditWindowLeft(message)}s left)`, onPress: () => { setEditingMessageId(message.id); setInputText(message.text); } }]
        : []),
      { text: "Delete", style: "destructive" as const, onPress: () => {
        setMessages((prev) => prev.filter((item) => item.id !== message.id));
        if (replyToId === message.id) setReplyToId(null);
        if (editingMessageId === message.id) { setEditingMessageId(null); setInputText(""); }
      }},
      { text: "Cancel", style: "cancel" as const },
    ]);
  }

  function handleSend() {
    if (!inputText.trim()) return;

    if (editingMessageId) {
      const editTarget = messages.find((m) => m.id === editingMessageId);
      if (!editTarget || !canEditMessage(editTarget)) {
        Alert.alert("Edit expired", "You can only edit a message within 1 minute.");
        setEditingMessageId(null);
        setInputText("");
        return;
      }
      setMessages((prev) => prev.map((m) =>
        m.id === editingMessageId
          ? { ...m, text: inputText.trim(), editedAt: Date.now(), time: `${new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} · edited` }
          : m
      ));
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
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);

    setTimeout(() => setIsTyping(true), 800);
    setTimeout(() => {
      setIsTyping(false);
      const replies = AUTO_REPLIES[id ?? "erha-ai"] ?? ["God bless you! 🙏"];
      const reply = replies[Math.floor(Math.random() * replies.length)];
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), text: reply, sent: false, time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) },
      ]);
      setMessages((prev) => prev.map((m) => m.sent ? { ...m, read: true } : m));
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    }, 2500);
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar barStyle={t.statusBar} backgroundColor={t.bg} />

      {/* Header */}
      <View style={[{ flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.border, gap: 8, paddingTop: topPad, backgroundColor: t.bg }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Feather name="chevron-left" size={24} color={t.text} />
        </TouchableOpacity>
        <AvatarCircle initials={convo.initials} color={convo.color} size={34} online={convo.online} borderColor={t.bg} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={{ color: t.text, fontSize: 15, fontWeight: "600" }}>{convo.name}</Text>
            {convo.verified && <Ionicons name="checkmark-circle" size={14} color="#0E7B5B" />}
          </View>
          <Text style={{ color: "#34C759", fontSize: 11, marginTop: 1 }}>{convo.online ? "Active now" : "Offline"}</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 2 }}>
          <TouchableOpacity style={{ padding: 8 }} onPress={() => router.push({ pathname: "/call/[id]", params: { id: id ?? "4", type: "audio" } })}>
            <Ionicons name="call-outline" size={22} color={t.text} />
          </TouchableOpacity>
          <TouchableOpacity style={{ padding: 8 }} onPress={() => router.push({ pathname: "/call/[id]", params: { id: id ?? "4", type: "video" } })}>
            <Ionicons name="videocam-outline" size={22} color={t.text} />
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
          style={{ flex: 1, backgroundColor: t.bg }}
          contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 10, paddingBottom: 6 }}
          renderItem={({ item, index }) => {
            const showAvatar = !item.sent && (index === 0 || messages[index - 1]?.sent);
            const isLast = index === messages.length - 1;
            const repliedMessage = item.replyToId ? messages.find((m) => m.id === item.replyToId) : null;

            return (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  marginBottom: 3,
                  justifyContent: item.sent ? "flex-end" : "flex-start",
                }}
              >
                {/* Received: avatar slot */}
                {!item.sent && (
                  <View style={{ width: 28, marginRight: 6, alignSelf: "flex-end" }}>
                    {showAvatar ? (
                      <AvatarCircle initials={convo.initials} color={convo.color} size={28} borderColor={t.bg} />
                    ) : null}
                  </View>
                )}

                {/* Bubble container — bounded so text wraps */}
                <View style={{ maxWidth: "72%", alignItems: item.sent ? "flex-end" : "flex-start" }}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onLongPress={() => openMessageActions(item)}
                    style={{
                      backgroundColor: item.sent ? t.bubbleSent : t.bubbleReceived,
                      borderRadius: 18,
                      borderBottomRightRadius: item.sent ? 4 : 18,
                      borderBottomLeftRadius: item.sent ? 18 : 4,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                    }}
                  >
                    {repliedMessage && (
                      <View style={{ borderLeftWidth: 2, borderLeftColor: "rgba(255,255,255,0.35)", paddingLeft: 8, marginBottom: 5 }}>
                        <Text style={{ color: item.sent ? "rgba(255,255,255,0.8)" : t.subtext, fontSize: 11, fontWeight: "700" }} numberOfLines={1}>
                          {repliedMessage.sent ? "You" : convo.name}
                        </Text>
                        <Text style={{ color: item.sent ? "rgba(255,255,255,0.65)" : t.mutedText, fontSize: 12, marginTop: 1 }} numberOfLines={1}>
                          {repliedMessage.text}
                        </Text>
                      </View>
                    )}
                    <Text style={{ color: item.sent ? t.bubbleTextSent : t.bubbleTextReceived, fontSize: 15, lineHeight: 20 }}>
                      {item.text}
                    </Text>
                  </TouchableOpacity>

                  {/* Timestamp + read receipt */}
                  {isLast && item.sent && (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginTop: 3, paddingRight: 2 }}>
                      <Text style={{ color: t.mutedText, fontSize: 10 }}>{item.time}</Text>
                      <Ionicons name="checkmark-done" size={13} color={item.read ? "#4A8A5D" : t.mutedText} />
                    </View>
                  )}
                </View>
              </View>
            );
          }}
          ListFooterComponent={isTyping ? <TypingIndicator bubbleBg={t.bubbleReceived} /> : null}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          showsVerticalScrollIndicator={false}
        />

        {/* Reply / Edit banner */}
        {(replyToMessage || editingMessage) && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingTop: 8, paddingBottom: 6, backgroundColor: t.bg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.border }}>
            <View style={{ width: 3, height: 30, borderRadius: 2, backgroundColor: t.accent }} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: t.text, fontSize: 12, fontWeight: "600" }}>
                {editingMessage ? `Editing (${getEditWindowLeft(editingMessage)}s left)` : `Replying to ${replyToMessage?.sent ? "You" : convo.name}`}
              </Text>
              <Text style={{ color: t.subtext, fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                {editingMessage ? editingMessage.text : replyToMessage?.text}
              </Text>
            </View>
            <TouchableOpacity onPress={() => { setReplyToId(null); setEditingMessageId(null); setInputText(""); }}>
              <Ionicons name="close" size={18} color={t.subtext} />
            </TouchableOpacity>
          </View>
        )}

        {/* Input bar */}
        <View style={{ flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 8, paddingTop: 8, paddingBottom: bottomPad + 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.border, backgroundColor: t.bg, gap: 6 }}>
          <TouchableOpacity style={{ padding: 6 }} onPress={() => Alert.alert("Media", "Choose a source", [{ text: "Take Photo" }, { text: "Choose from Library" }, { text: "Cancel", style: "cancel" }])}>
            <Ionicons name="camera-outline" size={24} color={t.subtext} />
          </TouchableOpacity>
          <TextInput
            style={{ flex: 1, backgroundColor: t.inputBg, borderRadius: 22, paddingHorizontal: 14, paddingTop: 9, paddingBottom: 9, color: t.inputText, fontSize: 15, maxHeight: 120 }}
            placeholder={editingMessage ? "Edit your message..." : "Message..."}
            placeholderTextColor={t.inputPlaceholder}
            value={inputText}
            onChangeText={setInputText}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            multiline
          />
          {inputText.trim() ? (
            <TouchableOpacity style={{ padding: 6 }} onPress={handleSend}>
              <Ionicons name="send" size={22} color={t.accent} />
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={{ padding: 6 }}>
                <Ionicons name="mic-outline" size={24} color={t.subtext} />
              </TouchableOpacity>
              <TouchableOpacity style={{ padding: 6 }} onPress={() => { setInputText("❤️"); }}>
                <Ionicons name="heart-outline" size={24} color={t.subtext} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
