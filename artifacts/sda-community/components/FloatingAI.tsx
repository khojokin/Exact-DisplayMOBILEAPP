import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
  PanResponder,
  Dimensions,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAI } from "@/hooks/useAI";

const FAB_SIZE = 52;
const EDGE_MARGIN = 14;

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
}

const GREETINGS = [
  "Hi! I'm your SDA Community assistant. Ask me anything — about the app, your faith, or church life. 🙏",
];

const AI_REPLIES: Record<string, string> = {
  default: "I'm here to help! You can ask me about navigating the app, Sabbath topics, Bible verses, or church events. What would you like to know?",
};

const QUICK_PROMPTS = [
  "How do I join a meeting?",
  "What is the Sabbath School?",
  "Give me a Bible verse for today",
  "How do I post in the community?",
];

function getAIReply(input: string): string {
  const q = input.toLowerCase();
  if (q.includes("meeting") || q.includes("join")) return "To join a meeting, go to the Messages tab and tap the calendar icon, then select 'Join with ID' and enter the meeting code shared by your pastor. 📅";
  if (q.includes("sabbath school")) return "Sabbath School is available in the app's Resources section. It features quarterly lesson guides, audio devotionals, and discussion prompts for each week. 📖";
  if (q.includes("bible") || q.includes("verse")) return `Here's a verse for you:\n\n"Be still and know that I am God." — Psalm 46:10\n\nYou can explore more scriptures in the Bible tab. 🙏`;
  if (q.includes("post") || q.includes("community") || q.includes("share")) return "Tap the ＋ button in the bottom tab bar to create a new post. You can add text, choose a flair like Prayer or Devotional, and share it with the whole SDA Community. ✨";
  if (q.includes("profile") || q.includes("edit")) return "Go to the Profile tab (bottom right) and tap 'Edit Profile' to update your name, bio, or profile photo. 👤";
  if (q.includes("message") || q.includes("dm") || q.includes("chat")) return "Open the Messages tab (the arrow icon) to see all your conversations. Tap the compose icon at the top right to start a new direct message. 💬";
  if (q.includes("logout") || q.includes("sign out")) return "To log out, go to your Profile tab → tap the menu icon → Settings → scroll to 'Account Actions' → tap 'Log Out'. See you next time! 👋";
  if (q.includes("prayer") || q.includes("pray")) return "You can share prayer requests in the Community tab using the 'Prayer' flair, or message specific people directly. The SDA Prayer Group chat is also available in Messages. 🙏";
  if (q.includes("hymn") || q.includes("music")) return "The Hymns section is available through Profile → Resources. You'll find the full SDA Hymnal with lyrics and audio playback. 🎵";
  if (q.includes("event") || q.includes("calendar")) return "Church events are listed in the Resources section under 'Church Events'. You can also schedule meetings through the Meetings page accessed from Messages. 📅";
  if (q.includes("hello") || q.includes("hi") || q.includes("hey")) return "Hello! Welcome to erha — your SDA Community app. How can I help you today? 😊";
  if (q.includes("thank")) return "You're so welcome! God bless you. 🙏 Feel free to ask me anything anytime.";
  return AI_REPLIES.default;
}

export default function FloatingAI() {
  const insets = useSafeAreaInsets();
  const { aiEnabled } = useAI();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "0", role: "ai", text: GREETINGS[0] },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const listRef = useRef<FlatList>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const mountedRef = useRef(true);
  const pendingTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ── Drag state ────────────────────────────────────────────────────────────
  const { width: SW, height: SH } = Dimensions.get("window");
  const tabBarH = Platform.OS === "web" ? 58 : insets.bottom + 54;
  const topSafe = Platform.OS === "web" ? 20 : insets.top + 8;

  // Initial position: right edge, ~35% down
  const initX = SW - FAB_SIZE - EDGE_MARGIN;
  const initY = SH * 0.38;

  const pos = useRef(new Animated.ValueXY({ x: initX, y: initY })).current;
  const lastPos = useRef({ x: initX, y: initY });
  const isDragging = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragStartTouch = useRef({ x: 0, y: 0 });

  // Snap to nearest edge when finger is released
  const snapToEdge = useCallback((rawX: number, rawY: number) => {
    const { width, height } = Dimensions.get("window");
    const snapX = rawX + FAB_SIZE / 2 < width / 2
      ? EDGE_MARGIN
      : width - FAB_SIZE - EDGE_MARGIN;
    const clampedY = Math.max(topSafe, Math.min(rawY, height - tabBarH - FAB_SIZE - EDGE_MARGIN));

    Animated.spring(pos, {
      toValue: { x: snapX, y: clampedY },
      useNativeDriver: false,
      friction: 7,
      tension: 120,
    }).start();
    lastPos.current = { x: snapX, y: clampedY };
  }, [pos, topSafe, tabBarH]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 4 || Math.abs(g.dy) > 4,

      onPanResponderGrant: (e) => {
        isDragging.current = false;
        dragStartPos.current = { ...lastPos.current };
        dragStartTouch.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
        pos.stopAnimation();
      },

      onPanResponderMove: (e) => {
        const dx = e.nativeEvent.pageX - dragStartTouch.current.x;
        const dy = e.nativeEvent.pageY - dragStartTouch.current.y;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) isDragging.current = true;
        const newX = dragStartPos.current.x + dx;
        const newY = dragStartPos.current.y + dy;
        pos.setValue({ x: newX, y: newY });
        lastPos.current = { x: newX, y: newY };
      },

      onPanResponderRelease: () => {
        if (isDragging.current) {
          snapToEdge(lastPos.current.x, lastPos.current.y);
        }
        // tap (no drag) → handled by TouchableOpacity press
      },

      onPanResponderTerminate: () => {
        snapToEdge(lastPos.current.x, lastPos.current.y);
      },
    })
  ).current;

  // Pulse when idle
  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  React.useEffect(() => {
    return () => {
      mountedRef.current = false;
      pendingTimersRef.current.forEach((timerId) => clearTimeout(timerId));
      pendingTimersRef.current = [];
    };
  }, []);

  function queueTimer(cb: () => void, ms: number) {
    const id = setTimeout(() => {
      if (mountedRef.current) cb();
      pendingTimersRef.current = pendingTimersRef.current.filter((t) => t !== id);
    }, ms);
    pendingTimersRef.current.push(id);
  }

  function send() {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { id: String(Date.now()), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);
    queueTimer(() => {
      const reply: Message = { id: String(Date.now() + 1), role: "ai", text: getAIReply(text) };
      setMessages((prev) => [...prev, reply]);
      setTyping(false);
      queueTimer(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }, 900);
  }

  function quickPrompt(prompt: string) {
    const userMsg: Message = { id: String(Date.now()), role: "user", text: prompt };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);
    queueTimer(() => {
      const reply: Message = { id: String(Date.now() + 1), role: "ai", text: getAIReply(prompt) };
      setMessages((prev) => [...prev, reply]);
      setTyping(false);
      queueTimer(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }, 900);
  }

  if (!aiEnabled) return null;

  return (
    <>
      {/* ── Draggable FAB ── */}
      {!open && (
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.fab,
            {
              left: pos.x,
              top: pos.y,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.fabInner}
            onPress={() => {
              if (!isDragging.current) setOpen(true);
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="sparkles" size={22} color="#FFF" />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* ── Chat modal ── */}
      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.panel, { paddingBottom: Math.max(insets.bottom, 12) }]}>
              {/* Header */}
              <View style={styles.panelHeader}>
                <View style={styles.aiAvatar}>
                  <Ionicons name="sparkles" size={16} color="#FFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.panelTitle}>erha AI</Text>
                  <Text style={styles.panelSub}>Always here to help</Text>
                </View>
                <TouchableOpacity onPress={() => setOpen(false)} style={styles.closeBtn}>
                  <Ionicons name="chevron-down" size={22} color="#8E8E93" />
                </TouchableOpacity>
              </View>

              {/* Messages */}
              <FlatList
                ref={listRef}
                data={messages}
                keyExtractor={(m) => m.id}
                style={styles.msgList}
                contentContainerStyle={{ padding: 14, gap: 12 }}
                onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
                renderItem={({ item }) => (
                  <View style={[styles.bubble, item.role === "user" ? styles.bubbleUser : styles.bubbleAI]}>
                    {item.role === "ai" && (
                      <View style={styles.aiBubbleAvatar}>
                        <Ionicons name="sparkles" size={10} color="#FFF" />
                      </View>
                    )}
                    <View style={[styles.bubbleBody, item.role === "user" ? styles.bodyUser : styles.bodyAI]}>
                      <Text style={[styles.bubbleText, item.role === "user" && styles.bubbleTextUser]}>
                        {item.text}
                      </Text>
                    </View>
                  </View>
                )}
                ListFooterComponent={
                  typing ? (
                    <View style={[styles.bubble, styles.bubbleAI]}>
                      <View style={styles.aiBubbleAvatar}><Ionicons name="sparkles" size={10} color="#FFF" /></View>
                      <View style={[styles.bubbleBody, styles.bodyAI, { paddingVertical: 12, paddingHorizontal: 16 }]}>
                        <Text style={{ color: "#8E8E93", fontSize: 16, letterSpacing: 4 }}>···</Text>
                      </View>
                    </View>
                  ) : null
                }
              />

              {/* Quick prompts */}
              {messages.length <= 1 && (
                <View style={styles.quickRow}>
                  {QUICK_PROMPTS.slice(0, 2).map((p) => (
                    <TouchableOpacity key={p} style={styles.quickChip} onPress={() => quickPrompt(p)}>
                      <Text style={styles.quickChipText} numberOfLines={2}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Input */}
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Ask me anything…"
                  placeholderTextColor="#636366"
                  value={input}
                  onChangeText={setInput}
                  onSubmitEditing={send}
                  returnKeyType="send"
                  multiline
                />
                <TouchableOpacity
                  style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
                  onPress={send}
                  disabled={!input.trim()}
                >
                  <Ionicons name="arrow-up" size={18} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    zIndex: 999,
    width: FAB_SIZE,
    height: FAB_SIZE,
  },
  fabInner: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: "#6264A7",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6264A7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  panel: {
    backgroundColor: "#111111",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    minHeight: "55%",
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2C2C2E",
  },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#6264A7",
    alignItems: "center",
    justifyContent: "center",
  },
  panelTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  panelSub: { color: "#8E8E93", fontSize: 12, marginTop: 1 },
  closeBtn: { padding: 4 },
  msgList: { flex: 1 },
  bubble: { flexDirection: "row", alignItems: "flex-end", gap: 6 },
  bubbleUser: { flexDirection: "row-reverse" },
  bubbleAI: {},
  aiBubbleAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#6264A7",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginBottom: 2,
  },
  bubbleBody: {
    maxWidth: "78%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bodyAI: { backgroundColor: "#1C1C1E", borderBottomLeftRadius: 4 },
  bodyUser: { backgroundColor: "#4A6741", borderBottomRightRadius: 4 },
  bubbleText: { color: "#AEAEB2", fontSize: 14, lineHeight: 20 },
  bubbleTextUser: { color: "#FFFFFF" },
  quickRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  quickChip: {
    flex: 1,
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2C2C2E",
    padding: 10,
  },
  quickChipText: { color: "#AEAEB2", fontSize: 12, lineHeight: 16 },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#2C2C2E",
  },
  input: {
    flex: 1,
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#3C3C3E",
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#FFFFFF",
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#6264A7",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { backgroundColor: "#2C2C2E" },
});
