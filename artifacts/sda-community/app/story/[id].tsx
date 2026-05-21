import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  StatusBar,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const STORIES_DATA: Record<string, {
  name: string;
  initials: string;
  color: string;
  bgColor: string;
  timeAgo: string;
  createdAt: number; // timestamp in ms
  scripture?: string;
  content: string;
  icon: "book-outline" | "musical-notes-outline" | "heart-outline" | "sunny-outline" | "leaf-outline";
}> = {
  "pj": {
    name: "Pastor James Osei",
    initials: "PJ",
    color: "#3B5BDB",
    bgColor: "#2A4A2A",
    timeAgo: "Just now",
    createdAt: Date.now(),
    scripture: "ISAIAH 40:31",
    content: "Daily reflection shared by Pastor",
    icon: "book-outline",
  },
  "er": {
    name: "Elder Ruth Nakamura",
    initials: "ER",
    color: "#B8860B",
    bgColor: "#3A3A1A",
    timeAgo: "12m ago",
    createdAt: Date.now() - 12 * 60 * 1000,
    scripture: "PSALM 23:1",
    content: "Morning devotional from Elder Ruth",
    icon: "sunny-outline",
  },
  "ga": {
    name: "Grace Adetokunbo",
    initials: "GA",
    color: "#0E7B5B",
    bgColor: "#1A3A2A",
    timeAgo: "45m ago",
    createdAt: Date.now() - 45 * 60 * 1000,
    scripture: "PHILIPPIANS 4:13",
    content: "Worship team praise moment",
    icon: "musical-notes-outline",
  },
  "ao": {
    name: "Abigail Owusu",
    initials: "AO",
    color: "#8B3A8B",
    bgColor: "#2A1A3A",
    timeAgo: "1h ago",
    createdAt: Date.now() - 60 * 60 * 1000,
    content: "Choir rehearsal highlight",
    icon: "musical-notes-outline",
  },
  "dm": {
    name: "David Mensah",
    initials: "DM",
    color: "#C85200",
    bgColor: "#3A2010",
    timeAgo: "2h ago",
    createdAt: Date.now() - 2 * 60 * 60 * 1000,
    content: "Youth Ministry update",
    icon: "leaf-outline",
  },
};

const DEFAULT_STORY = STORIES_DATA["pj"];

export default function StoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const story = STORIES_DATA[id ?? "pj"] ?? DEFAULT_STORY;
  const [message, setMessage] = useState("");
  const [liked, setLiked] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Check if story is expired (older than 24 hours)
  useEffect(() => {
    const now = Date.now();
    const age = now - story.createdAt;
    const twentyFourHoursMs = 24 * 60 * 60 * 1000;
    if (age > twentyFourHoursMs) {
      setIsExpired(true);
      router.back();
      return;
    }
    // Set remaining time for progress bar (8 seconds per story, but max 24 hours)
    const remainingMs = Math.max(8000, twentyFourHoursMs - age);
    progressAnim.setValue(0);
    const anim = Animated.timing(progressAnim, {
      toValue: 1,
      duration: 8000, // Always 8 seconds for viewer experience
      useNativeDriver: false,
    });
    anim.start(({ finished }) => {
      if (finished) router.back();
    });
    return () => anim.stop();
  }, [id]);

  function handleLike() {
    Haptics.selectionAsync();
    setLiked((v) => !v);
  }

  function handleSend() {
    if (!message.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setMessage("");
  }

  if (isExpired) {
    return (
      <View style={[styles.container, { backgroundColor: "#0A0A0A" }]}>
        <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 }}>
          <Ionicons name="time-outline" size={56} color="#636366" style={{ marginBottom: 12 }} />
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#FFFFFF", marginBottom: 8 }}>Story Expired</Text>
          <Text style={{ fontSize: 14, color: "#8E8E93", textAlign: "center", marginBottom: 20 }}>This story is older than 24 hours and is no longer available.</Text>
          <TouchableOpacity style={{ backgroundColor: "#3B5BDB", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }} onPress={() => router.back()}>
            <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: story.bgColor }]}>
      <StatusBar barStyle="light-content" backgroundColor={story.bgColor} />

      <View style={[styles.progressBar, { paddingTop: topPad + 4 }]}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.storyHeader}>
        <View style={styles.authorInfo}>
          <View style={[styles.authorAvatar, { backgroundColor: story.color }]}>
            <Text style={styles.authorInitials}>{story.initials}</Text>
          </View>
          <View>
            <Text style={styles.authorName}>{story.name}</Text>
            <Text style={styles.authorTime}>{story.timeAgo}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.storyBody}>
        {story.scripture && (
          <Text style={styles.scriptureRef}>{story.scripture}</Text>
        )}
        <View style={styles.iconContainer}>
          <Ionicons name={story.icon} size={64} color="rgba(255,255,255,0.5)" />
        </View>
        <Text style={styles.storyContent}>{story.content}</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.footer, { paddingBottom: bottomPad + 12 }]}>
          <TextInput
            style={styles.messageInput}
            placeholder="Send message..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={message}
            onChangeText={setMessage}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity onPress={handleLike} style={styles.footerIcon}>
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={26}
              color={liked ? "#FF3B5B" : "rgba(255,255,255,0.8)"}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSend} style={styles.footerIcon}>
            <Feather name="send" size={22} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  progressBar: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  progressTrack: {
    height: 2.5,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
  },
  storyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
  },
  authorInitials: { color: "#FFF", fontWeight: "700", fontSize: 13 },
  authorName: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  authorTime: { color: "rgba(255,255,255,0.6)", fontSize: 12 },
  closeBtn: { padding: 6 },
  storyBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 32,
  },
  scriptureRef: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  storyContent: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  messageInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: "#FFFFFF",
    fontSize: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.25)",
  },
  footerIcon: { padding: 4 },
});
