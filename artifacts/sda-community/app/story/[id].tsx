import React, { useCallback, useState } from "react";
import {
  Image,
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
import { useFocusEffect } from "@react-navigation/native";
import { fetchStoryById, type StoryItem } from "@/lib/stories";

function relativeTime(input: string) {
  const ms = Date.now() - new Date(input).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function StoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 24 : insets.bottom;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [story, setStory] = useState<StoryItem | null>(null);
  const [message, setMessage] = useState("");
  const [liked, setLiked] = useState(false);

  const load = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setError("Story not found.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const row = await fetchStoryById(id);
      if (!row) {
        setError("Story not found.");
        setStory(null);
      } else {
        if (row.expiresAt && new Date(row.expiresAt).getTime() <= Date.now()) {
          setError("This story expired.");
          setStory(null);
        } else {
          setStory(row);
        }
      }
    } catch (loadError: any) {
      setError(loadError?.message ?? "Unable to load this story.");
      setStory(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      <View style={[styles.header, { paddingTop: topPad }]}> 
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><Text style={styles.helper}>Loading story...</Text></View>
      ) : error || !story ? (
        <View style={styles.center}>
          <Ionicons name="time-outline" size={48} color="#8E8E93" />
          <Text style={[styles.helper, { marginTop: 12, textAlign: "center" }]}>{error ?? "Story unavailable."}</Text>
        </View>
      ) : (
        <>
          <View style={styles.storyBody}>
            <View style={styles.authorRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{story.authorName.slice(0, 2).toUpperCase()}</Text>
              </View>
              <View>
                <Text style={styles.author}>{story.authorName}</Text>
                <Text style={styles.time}>{relativeTime(story.createdAt)}</Text>
              </View>
            </View>

            {story.mediaUrl ? (
              <Image source={{ uri: story.mediaUrl }} style={styles.media} resizeMode="cover" />
            ) : (
              <View style={styles.mediaPlaceholder}>
                <Ionicons name="book-outline" size={52} color="rgba(255,255,255,0.45)" />
              </View>
            )}

            <Text style={styles.storyText}>{story.content || "No story text."}</Text>
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View style={[styles.footer, { paddingBottom: bottomPad + 10 }]}> 
              <TextInput
                style={styles.input}
                placeholder="Reply to story..."
                placeholderTextColor="rgba(255,255,255,0.58)"
                value={message}
                onChangeText={setMessage}
                onSubmitEditing={() => setMessage("")}
              />
              <TouchableOpacity onPress={() => setLiked((prev) => !prev)} style={styles.iconBtn}>
                <Ionicons name={liked ? "heart" : "heart-outline"} size={24} color={liked ? "#FF4D6D" : "#fff"} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMessage("")} style={styles.iconBtn}>
                <Feather name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  header: { paddingHorizontal: 12, paddingBottom: 8, alignItems: "flex-end" },
  headerBtn: { padding: 4 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  helper: { color: "#C7C7CC", fontSize: 14 },
  storyBody: { flex: 1, paddingHorizontal: 16, gap: 14 },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B5BDB",
  },
  avatarText: { color: "#fff", fontWeight: "700" },
  author: { color: "#fff", fontWeight: "700", fontSize: 14 },
  time: { color: "#8E8E93", fontSize: 12, marginTop: 2 },
  media: {
    width: "100%",
    height: 320,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2C2C2E",
    backgroundColor: "#1C1C1E",
  },
  mediaPlaceholder: {
    width: "100%",
    height: 320,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2C2C2E",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#121214",
  },
  storyText: { color: "#E5E5EA", fontSize: 15, lineHeight: 22 },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.28)",
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "#fff",
    paddingHorizontal: 14,
    fontSize: 14,
  },
  iconBtn: { padding: 3 },
});
