import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useVideoPosts } from "@/hooks/useVideoPosts";

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_W - 36) / 2;

const FALLBACK_SHORTS = [
  { id: "ss1", creator: "James", title: "Morning devotion in 30 seconds", color: "#5A3E2B" },
  { id: "ss2", creator: "Grace", title: "Worship chorus for today", color: "#2D4A66" },
  { id: "ss3", creator: "Ruth", title: "Prayer tip before bedtime", color: "#3A5A3A" },
  { id: "ss4", creator: "David", title: "Choir rehearsal highlight", color: "#5C2F3E" },
  { id: "ss5", creator: "Abigail", title: "Faith in daily life", color: "#6D4A2B" },
  { id: "ss6", creator: "Samuel", title: "Sabbath prep reminder", color: "#30525A" },
];

export default function ShortsSeeAllScreen() {
  const insets = useSafeAreaInsets();
  const { videoPosts } = useVideoPosts();

  const items = useMemo(() => {
    if (!videoPosts.length) return FALLBACK_SHORTS;
    return videoPosts.map((vp, idx) => ({
      id: `v-${vp.id}`,
      creator: vp.creator.split(" ")[0],
      title: vp.caption,
      color: idx % 2 === 0 ? "#2D4A66" : "#5A3E2B",
    }));
  }, [videoPosts]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 22 : insets.top + 6 }]}> 
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Suggested Videos</Text>
        <View style={styles.headerBtn} />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.column}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: insets.bottom + 24 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: item.color }]}
            activeOpacity={0.9}
            onPress={() => router.push("/shorts")}
          >
            <View style={styles.overlay} />
            <View style={styles.playPill}>
              <Ionicons name="play" size={10} color="#FFF" />
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaHandle}>@{item.creator.toLowerCase()}</Text>
              <View style={styles.metaDot} />
              <Text style={styles.metaViews}>For You</Text>
            </View>
            <Text style={styles.creator}>{item.creator}</Text>
          </TouchableOpacity>
        )}
      />
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
  column: { gap: 10 },
  card: {
    width: CARD_WIDTH,
    height: 220,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2C2C2E",
    padding: 10,
    justifyContent: "flex-end",
    marginBottom: 10,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.24)",
  },
  playPill: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  playText: { color: "#FFF", fontSize: 10, fontWeight: "700" },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 5,
  },
  metaHandle: { color: "#FFF", fontSize: 10, fontWeight: "700", opacity: 0.95 },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.75)" },
  metaViews: { color: "#FFF", fontSize: 10, opacity: 0.85 },
  creator: { color: "#F4F4F5", fontSize: 12, fontWeight: "700" },
});
