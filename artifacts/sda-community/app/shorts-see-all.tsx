import React from "react";
import {
  FlatList,
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

export default function ShortsSeeAllScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 22 : insets.top + 6;
  const { ready, videoPosts } = useVideoPosts();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      <View style={[styles.header, { paddingTop: topPad }]}> 
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Real Videos</Text>
        <View style={styles.headerBtn} />
      </View>

      {!ready ? (
        <View style={styles.center}><Text style={styles.helper}>Loading videos...</Text></View>
      ) : (
        <FlatList
          data={videoPosts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: insets.bottom + 24 }}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="videocam-off-outline" size={36} color="#8E8E93" />
              <Text style={[styles.helper, { marginTop: 8 }]}>No videos available.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => router.push("/shorts")}> 
              <View style={styles.thumb}>
                <Ionicons name="play" size={16} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title} numberOfLines={1}>{item.caption || "Untitled"}</Text>
                <Text style={styles.meta} numberOfLines={1}>@{item.creator.replace(/\s+/g, "_")}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#8E8E93" />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  center: { alignItems: "center", justifyContent: "center", paddingTop: 70 },
  helper: { color: "#B3B3B8", fontSize: 14 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2C2C2E",
    backgroundColor: "#111113",
    padding: 10,
    marginBottom: 8,
  },
  thumb: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B5BDB",
  },
  title: { color: "#fff", fontSize: 14, fontWeight: "600" },
  meta: { color: "#8E8E93", fontSize: 12, marginTop: 2 },
});
