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
}

const CONVERSATIONS_DATA: Record<string, { name: string; color: string; initials: string; verified?: boolean; online?: boolean; messages: Message[] }> = {
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

  const convo = CONVERSATIONS_DATA[id ?? "4"] ?? CONVERSATIONS_DATA["4"];
  const [messages, setMessages] = useState<Message[]>(convo.messages);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  function handleSend() {
    if (!inputText.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sent: true,
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      read: false,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputText("");
    Haptics.selectionAsync();
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

    // Simulate typing indicator then auto-reply
    setTimeout(() => setIsTyping(true), 800);
    setTimeout(() => {
      setIsTyping(false);
      const replies = AUTO_REPLIES[id ?? "4"] ?? ["God bless you! 🙏"];
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
            {convo.verified && <Ionicons name="checkmark-circle" size={14} color="#3B5BDB" />}
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
                  <View style={[styles.bubble, item.sent ? styles.bubbleSent : styles.bubbleReceived]}>
                    <Text style={[styles.bubbleText, item.sent && styles.bubbleTextSent]}>{item.text}</Text>
                  </View>
                  {/* Blue ticks on sent messages */}
                  {item.sent && isLast && (
                    <View style={styles.readRow}>
                      <Ionicons
                        name="checkmark-done"
                        size={13}
                        color={item.read ? "#3B5BDB" : "#636366"}
                      />
                      <Text style={[styles.readLabel, { color: item.read ? "#3B5BDB" : "#636366" }]}>
                        {item.read ? "Read" : "Delivered"}
                      </Text>
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

        <View style={[styles.inputRow, { paddingBottom: bottomPad + 8 }]}>
          <TouchableOpacity style={styles.inputIcon} onPress={() => Alert.alert("Camera", "Choose a source", [{ text: "Take Photo" }, { text: "Choose from Library" }, { text: "Cancel", style: "cancel" }])}>
            <Ionicons name="camera-outline" size={24} color="#8E8E93" />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder="Message..."
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
    borderBottomColor: "#2C2C2E",
    gap: 8,
  },
  backBtn: { padding: 4 },
  headerInfo: { flex: 1 },
  headerName: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
  headerStatus: { color: "#34C759", fontSize: 11, marginTop: 1 },
  headerActions: { flexDirection: "row", gap: 2 },
  callBtn: { padding: 8 },
  messageList: { flex: 1 },
  messageListContent: { paddingHorizontal: 12, paddingVertical: 16, gap: 4 },
  messageRow: { flexDirection: "row", alignItems: "flex-end", gap: 6, marginVertical: 2 },
  messageRowSent: { justifyContent: "flex-end" },
  avatarSlot: { width: 28 },
  bubble: { maxWidth: "75%", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 },
  bubbleReceived: { backgroundColor: "#1C1C1E", borderBottomLeftRadius: 4 },
  bubbleSent: { backgroundColor: "#3A5230", borderBottomRightRadius: 4 },
  bubbleText: { color: "#DADADB", fontSize: 15, lineHeight: 21 },
  bubbleTextSent: { color: "#FFFFFF" },
  readRow: { flexDirection: "row", alignItems: "center", gap: 3, justifyContent: "flex-end", marginTop: 2, paddingRight: 2 },
  readLabel: { fontSize: 10 },
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
