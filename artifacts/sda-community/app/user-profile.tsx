import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Pressable,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { useAuth } from "@clerk/clerk-expo";
import { useFocusEffect } from "@react-navigation/native";
import { fetchPostsByUserId, type FeedPost } from "@/lib/posts";
import { fetchProfileByNameOrId, fetchSuggestedProfiles, type AppProfile } from "@/lib/profiles";
import { ensureDirectConversation } from "@/lib/chat";

const { width: SCREEN_W } = Dimensions.get("window");
const GRID_SIZE = (SCREEN_W - 4) / 3;

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function UserProfileScreen() {
  const { name, id } = useLocalSearchParams<{ name?: string; id?: string }>();
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);
  const [profile, setProfile] = useState<AppProfile | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [suggested, setSuggested] = useState<AppProfile[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const identifier = (id ?? name ?? "").trim();
      if (!identifier) {
        setProfile(null);
        setPosts([]);
        setSuggested([]);
        setLoading(false);
        setError("Profile not found.");
        return;
      }

      const found = await fetchProfileByNameOrId(identifier);
      if (!found) {
        setProfile(null);
        setPosts([]);
        setSuggested([]);
        setLoading(false);
        setError("Profile not found.");
        return;
      }

      const [gridPosts, suggestedProfiles] = await Promise.all([
        fetchPostsByUserId(found.id, 120),
        fetchSuggestedProfiles([found.id, userId ?? ""].filter(Boolean), 12),
      ]);

      setProfile(found);
      setPosts(gridPosts);
      setSuggested(suggestedProfiles);
    } catch (loadError: any) {
      setError(loadError?.message ?? "Unable to load profile.");
    } finally {
      setLoading(false);
    }
  }, [id, name, userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const title = useMemo(() => {
    if (!profile) return "Profile";
    return profile.username ? `@${profile.username}` : profile.fullName;
  }, [profile]);

  async function handleMessage() {
    if (!userId || !profile) return;
    try {
      const conversationId = await ensureDirectConversation(userId, profile.id);
      router.push({ pathname: "/dm/[id]", params: { id: conversationId } });
    } catch {
      router.push({ pathname: "/dm/[id]", params: { id: profile.id } });
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 80 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.topBar, { paddingTop: topPad }]}> 
          <TouchableOpacity onPress={() => router.back()} style={styles.topBtn}>
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.topUsername} numberOfLines={1}>{title}</Text>
          <TouchableOpacity style={styles.topBtn} onPress={() => Haptics.selectionAsync()}>
            <Feather name="more-horizontal" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}><ActivityIndicator color="#6B7B5A" /><Text style={styles.helper}>Loading profile...</Text></View>
        ) : error || !profile ? (
          <View style={styles.center}><Text style={styles.helper}>{error ?? "Profile not available."}</Text></View>
        ) : (
          <>
            <View style={styles.profileHeader}>
              <View style={[styles.avatarCircle, { backgroundColor: "#4A6741" }]}> 
                {profile.avatarUrl ? (
                  <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>{initials(profile.fullName)}</Text>
                )}
              </View>

              <View style={styles.statsCol}>
                <View style={styles.statBlock}>
                  <Text style={styles.statValue}>{posts.length}</Text>
                  <Text style={styles.statLabel}>Posts</Text>
                </View>
                <View style={styles.statBlock}>
                  <Text style={styles.statValue}>-</Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </View>
                <View style={styles.statBlock}>
                  <Text style={styles.statValue}>-</Text>
                  <Text style={styles.statLabel}>Following</Text>
                </View>
              </View>
            </View>

            <View style={styles.bioSection}>
              <Text style={styles.profileName}>{profile.fullName}</Text>
              {profile.bio ? <Text style={styles.bioText}>{profile.bio}</Text> : null}
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.followBtn, following && styles.followingBtn]}
                onPress={() => { Haptics.selectionAsync(); setFollowing((v) => !v); }}
              >
                <Text style={[styles.followBtnText, following && styles.followingBtnText]}>
                  {following ? "Following" : "Follow"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.messageBtn} onPress={handleMessage}>
                <Ionicons name="chatbubble-outline" size={15} color="#FFF" />
                <Text style={styles.messageBtnText}>Message</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tabBar}>
              <View style={[styles.tabItem, styles.tabItemActive]}>
                <Ionicons name="grid-outline" size={22} color="#FFFFFF" />
              </View>
            </View>

            {posts.length === 0 ? (
              <View style={styles.emptySection}>
                <Ionicons name="camera-outline" size={48} color="#3C3C3E" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyTitle}>No Posts Yet</Text>
                <Text style={styles.emptySubtitle}>When {profile.fullName.split(" ")[0]} shares photos or videos, they'll appear here.</Text>

                {suggested.length > 0 && (
                  <View style={styles.suggestSection}>
                    <View style={styles.suggestHeaderRow}>
                      <Text style={styles.suggestTitle}>Suggested for you</Text>
                    </View>
                    {suggested.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.suggestRow}
                        onPress={() => router.push({ pathname: "/user-profile", params: { id: item.id } })}
                        activeOpacity={0.7}
                      >
                        {item.avatarUrl ? (
                          <Image source={{ uri: item.avatarUrl }} style={styles.suggestAvatar} />
                        ) : (
                          <View style={[styles.suggestAvatar, { backgroundColor: "#4A6741", alignItems: "center", justifyContent: "center" }]}>
                            <Text style={styles.suggestInitials}>{initials(item.fullName)}</Text>
                          </View>
                        )}
                        <View style={styles.suggestInfo}>
                          <Text style={styles.suggestName} numberOfLines={1}>{item.fullName}</Text>
                          <Text style={styles.suggestHandle} numberOfLines={1}>{item.username ? `@${item.username}` : "Member"}</Text>
                        </View>
                        <Pressable
                          style={styles.suggestFollowBtn}
                          onPress={() => { Haptics.selectionAsync(); router.push({ pathname: "/user-profile", params: { id: item.id } }); }}
                        >
                          <Text style={styles.suggestFollowText}>Follow</Text>
                        </Pressable>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.photoGrid}>
                {posts.map((post) => (
                  <TouchableOpacity
                    key={post.id}
                    style={styles.gridCell}
                    onPress={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })}
                  >
                    <Image source={{ uri: post.mediaUrl }} style={styles.gridImage} resizeMode="cover" />
                    {post.mediaType === "video" ? (
                      <View style={styles.videoBadge}>
                        <Ionicons name="play" size={14} color="#fff" />
                      </View>
                    ) : null}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  topBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  topUsername: { color: "#FFF", fontSize: 16, fontWeight: "700", flex: 1, textAlign: "center" },
  center: { alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 10 },
  helper: { color: "#B3B3B8", fontSize: 14 },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 24,
  },
  avatarCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#3C3C3E",
  },
  avatarImage: { width: "100%", height: "100%", borderRadius: 43 },
  avatarText: { color: "#FFF", fontSize: 30, fontWeight: "700" },
  statsCol: { flex: 1, flexDirection: "row", justifyContent: "space-around" },
  statBlock: { alignItems: "center" },
  statValue: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
  statLabel: { color: "#8E8E93", fontSize: 12, marginTop: 2 },
  bioSection: { paddingHorizontal: 16, paddingBottom: 14, gap: 4 },
  profileName: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  bioText: { color: "#AEAEB2", fontSize: 13, lineHeight: 18 },
  actionRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 16 },
  followBtn: {
    flex: 1,
    backgroundColor: "#4A6741",
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  followingBtn: {
    backgroundColor: "#1C1C1E",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#3C3C3E",
  },
  followBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  followingBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  messageBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#1C1C1E",
    borderRadius: 10,
    paddingVertical: 9,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#3C3C3E",
  },
  messageBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#2C2C2E",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2C2C2E",
    marginBottom: 2,
  },
  tabItem: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabItemActive: { borderBottomWidth: 1, borderBottomColor: "#FFFFFF" },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 2 },
  gridCell: { width: GRID_SIZE, height: GRID_SIZE, backgroundColor: "#111113" },
  gridImage: { width: "100%", height: "100%" },
  videoBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  emptySection: {
    alignItems: "center",
    paddingTop: 48,
    paddingHorizontal: 24,
    paddingBottom: 24,
    width: "100%",
  },
  emptyTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "700", marginBottom: 6 },
  emptySubtitle: { color: "#8E8E93", fontSize: 13, textAlign: "center", lineHeight: 18, marginBottom: 24 },
  suggestSection: { width: "100%", marginTop: 4 },
  suggestHeaderRow: { marginBottom: 14 },
  suggestTitle: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  suggestRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 16,
    gap: 12,
  },
  suggestAvatar: { width: 48, height: 48, borderRadius: 24 },
  suggestInitials: { color: "#fff", fontWeight: "700", fontSize: 16 },
  suggestInfo: { flex: 1 },
  suggestName: { color: "#fff", fontSize: 13, fontWeight: "600" },
  suggestHandle: { color: "#8E8E93", fontSize: 12, marginTop: 2 },
  suggestFollowBtn: {
    backgroundColor: "#4A6741",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  suggestFollowText: { color: "#fff", fontSize: 13, fontWeight: "700" },
});
