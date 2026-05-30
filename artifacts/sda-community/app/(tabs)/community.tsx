import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { fetchCommunities, fetchCommunityFeed, type CommunityItem, type CommunityPostItem } from "@/lib/community";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function relativeTime(input: string) {
  const ms = Date.now() - new Date(input).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [communities, setCommunities] = useState<CommunityItem[]>([]);
  const [feed, setFeed] = useState<CommunityPostItem[]>([]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [communityRows, feedRows] = await Promise.all([
        fetchCommunities(30),
        fetchCommunityFeed(80),
      ]);
      setCommunities(communityRows);
      setFeed(feedRows);
    } catch (loadError: any) {
      setError(loadError?.message ?? "Unable to load community content.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const communityStrip = useMemo(() => {
    if (!communities.length) {
      return (
        <View style={styles.emptyCommunities}>
          <Text style={styles.emptyText}>No real communities found yet.</Text>
        </View>
      );
    }

    return (
      <FlatList
        horizontal
        data={communities}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 14, gap: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.communityPill}
            onPress={() => router.push({ pathname: "/community-detail", params: { id: item.id } })}
          >
            <Text style={styles.communityPillTitle} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.communityPillMeta}>{item.memberCount} members</Text>
          </TouchableOpacity>
        )}
      />
    );
  }, [communities]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      <View style={[styles.header, { paddingTop: topPad }]}> 
        <Text style={styles.headerTitle}>Community</Text>
        <TouchableOpacity onPress={() => router.push("/new-community" as any)} style={styles.headerBtn}>
          <Ionicons name="add-circle-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionLabel}>Communities</Text>
      {communityStrip}

      <Text style={[styles.sectionLabel, { marginTop: 14 }]}>Community Feed</Text>

      {loading ? (
        <View style={styles.center}><Text style={styles.helper}>Loading community feed...</Text></View>
      ) : error ? (
        <View style={styles.center}><Text style={[styles.helper, { textAlign: "center" }]}>{error}</Text></View>
      ) : (
        <FlatList
          data={feed}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: insets.bottom + 36 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="newspaper-outline" size={32} color="#8E8E93" />
              <Text style={[styles.helper, { marginTop: 8 }]}>No real posts available yet.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.postCard} onPress={() => router.push({ pathname: "/post/[id]", params: { id: item.id } })}>
              <View style={styles.postHeader}>
                <View style={styles.postAvatar}>
                  <Text style={styles.postAvatarText}>{initials(item.authorName)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.postAuthor}>{item.authorName}</Text>
                  <Text style={styles.postMeta}>{relativeTime(item.createdAt)}</Text>
                </View>
                {item.mediaType === "video" && <Ionicons name="videocam" size={16} color="#6B7B5A" />}
              </View>
              <Text style={styles.postBody}>{item.caption || "No caption"}</Text>
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
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "700" },
  headerBtn: { padding: 4 },
  sectionLabel: {
    color: "#8E8E93",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginHorizontal: 16,
    marginBottom: 8,
  },
  communityPill: {
    width: 170,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2C2C2E",
    backgroundColor: "#111113",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  communityPillTitle: { color: "#fff", fontSize: 14, fontWeight: "700" },
  communityPillMeta: { color: "#8E8E93", fontSize: 12, marginTop: 4 },
  emptyCommunities: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2C2C2E",
    padding: 12,
    backgroundColor: "#111113",
  },
  emptyText: { color: "#8E8E93", fontSize: 13 },
  center: { alignItems: "center", justifyContent: "center", paddingTop: 42, paddingHorizontal: 20 },
  helper: { color: "#B3B3B8", fontSize: 14 },
  postCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2C2C2E",
    backgroundColor: "#111113",
    padding: 12,
    marginBottom: 10,
  },
  postHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  postAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B5BDB",
  },
  postAvatarText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  postAuthor: { color: "#fff", fontSize: 14, fontWeight: "600" },
  postMeta: { color: "#8E8E93", fontSize: 12, marginTop: 2 },
  postBody: { color: "#E5E5EA", fontSize: 14, lineHeight: 21, marginTop: 10 },
});
