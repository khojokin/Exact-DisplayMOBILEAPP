import React, { useMemo } from "react";
import {
  FlatList,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useVideoPosts } from "@/hooks/useVideoPosts";

function relativeTime(input: string) {
  const ms = Date.now() - new Date(input).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function ShortsScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { ready, videoPosts } = useVideoPosts();

  const rows = useMemo(() => videoPosts, [videoPosts]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <View style={[styles.header, { paddingTop: topPad }]}> 
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Video Posts</Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/new-post")} style={styles.headerBtn}>
          <Ionicons name="add-circle-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {!ready ? (
        <View style={styles.center}><Text style={styles.helper}>Loading real videos...</Text></View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: insets.bottom + 28 }}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="videocam-outline" size={38} color="#8E8E93" />
              <Text style={[styles.helper, { marginTop: 10 }]}>No real videos yet.</Text>
              <Text style={[styles.helper, { marginTop: 4, fontSize: 13 }]}>Create one from New Post.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHead}>
                <Text style={styles.creator}>{item.creator}</Text>
                <Text style={styles.time}>{relativeTime(item.createdAt)}</Text>
              </View>

              <TouchableOpacity activeOpacity={0.9} style={styles.previewWrap}>
                <Image source={{ uri: item.mediaUrl }} style={styles.preview} resizeMode="cover" />
                <View style={styles.playBadge}>
                  <Ionicons name="play" size={18} color="#fff" />
                </View>
              </TouchableOpacity>

              <Text style={styles.caption}>{item.caption || "Untitled video"}</Text>
            </View>
          )}
        />
      )}
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
  center: { alignItems: "center", justifyContent: "center", paddingTop: 80, paddingHorizontal: 24 },
  helper: { color: "#B3B3B8", fontSize: 14 },
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2C2C2E",
    backgroundColor: "#111113",
    padding: 10,
    marginBottom: 10,
  },
  cardHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  creator: { color: "#fff", fontSize: 14, fontWeight: "600" },
  time: { color: "#8E8E93", fontSize: 12 },
  previewWrap: {
    width: "100%",
    height: 210,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#1A1A1D",
  },
  preview: { width: "100%", height: "100%" },
  playBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  caption: { color: "#E5E5EA", fontSize: 14, lineHeight: 20, marginTop: 9 },
});
