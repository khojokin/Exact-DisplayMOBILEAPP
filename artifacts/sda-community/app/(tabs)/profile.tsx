import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Dimensions,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "@/hooks/useTheme";
import { fetchPostsByUserId, type FeedPost } from "@/lib/posts";
import { fetchProfileById, fetchSuggestedProfiles, type AppProfile } from "@/lib/profiles";
import { followUser, unfollowUser, getFollowingIds } from "@/lib/follows";

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

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTheme();
  const { userId } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [followerCount, setFollowerCount] = useState<number | null>(null);
  const [followingCount, setFollowingCount] = useState<number | null>(null);
  const [profile, setProfile] = useState<{ fullName: string; username?: string; bio?: string; avatarUrl?: string } | null>(null);
  const [suggested, setSuggested] = useState<AppProfile[]>([]);
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
  const [followingInProgress, setFollowingInProgress] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    if (!userId) {
      setPosts([]);
      setProfile(null);
      setLoading(false);
      return;
    }

    setError(null);
    try {
      const { supabase } = await import("@/lib/supabase");
      const [profileRow, userPosts, followersRes, followingRes] = await Promise.all([
        fetchProfileById(userId),
        fetchPostsByUserId(userId, 120),
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", userId),
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", userId),
      ]);

      const resolvedProfile = profileRow
        ? {
            fullName: profileRow.fullName,
            username: profileRow.username,
            bio: profileRow.bio,
            avatarUrl: profileRow.avatarUrl,
          }
        : {
            fullName: "Member",
            username: undefined,
            bio: undefined,
            avatarUrl: undefined,
          };
      setProfile(resolvedProfile);
      setPosts(userPosts);
      if (followersRes.count != null) setFollowerCount(followersRes.count);
      if (followingRes.count != null) setFollowingCount(followingRes.count);

      if (userPosts.length === 0) {
        const suggestedProfiles = await fetchSuggestedProfiles([userId], 8);
        setSuggested(suggestedProfiles);
        const alreadyFollowing = await getFollowingIds(userId);
        setFollowedIds(new Set(alreadyFollowing));
      } else {
        setSuggested([]);
        setFollowedIds(new Set());
      }
    } catch (loadError: any) {
      setError(loadError?.message ?? "Unable to load your profile.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const headerName = useMemo(() => profile?.fullName ?? "Profile", [profile]);
  const username = profile?.username ? `@${profile.username}` : "@member";

  async function handleToggleFollow(profileId: string) {
    if (!userId || followingInProgress.has(profileId)) return;
    setFollowingInProgress((prev) => new Set(prev).add(profileId));
    const wasFollowing = followedIds.has(profileId);
    setFollowedIds((prev) => {
      const next = new Set(prev);
      wasFollowing ? next.delete(profileId) : next.add(profileId);
      return next;
    });
    if (wasFollowing !== undefined) {
      setFollowingCount((c) => c != null ? Math.max(0, c + (wasFollowing ? -1 : 1)) : c);
    }
    try {
      if (wasFollowing) {
        await unfollowUser(userId, profileId);
      } else {
        await followUser(userId, profileId);
      }
    } catch {
      setFollowedIds((prev) => {
        const next = new Set(prev);
        wasFollowing ? next.add(profileId) : next.delete(profileId);
        return next;
      });
      if (wasFollowing !== undefined) {
        setFollowingCount((c) => c != null ? Math.max(0, c + (wasFollowing ? 1 : -1)) : c);
      }
    } finally {
      setFollowingInProgress((prev) => { const next = new Set(prev); next.delete(profileId); return next; });
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}> 
      <StatusBar barStyle={t.statusBar} backgroundColor={t.bg} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 120 : insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      >
        <View style={[styles.topBar, { paddingTop: topPad }]}> 
          <Text style={[styles.username, { color: t.text }]}>{username}</Text>
          <TouchableOpacity onPress={() => router.push("/settings")}> 
            <Feather name="menu" size={24} color={t.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileHeader}>
          <View style={styles.avatarCol}>
            <View style={[styles.avatarCircle, { borderColor: t.accent, backgroundColor: "#4A6741" }]}> 
              {profile?.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{initials(headerName)}</Text>
              )}
            </View>
          </View>

          <View style={styles.statsCol}>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{posts.length}</Text>
              <Text style={[styles.statLabel, { color: t.subtext }]}>Posts</Text>
            </View>
            <TouchableOpacity style={styles.statBlock} onPress={() => router.push({ pathname: "/followers", params: { type: "followers" } })}>
              <Text style={styles.statValue}>{followerCount ?? "-"}</Text>
              <Text style={[styles.statLabel, { color: t.subtext }]}>Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statBlock} onPress={() => router.push({ pathname: "/followers", params: { type: "following" } })}>
              <Text style={styles.statValue}>{followingCount ?? "-"}</Text>
              <Text style={[styles.statLabel, { color: t.subtext }]}>Following</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bioSection}>
          <Text style={[styles.profileName, { color: t.text }]}>{headerName}</Text>
          {profile?.bio ? <Text style={[styles.bioText, { color: t.subtext }]}>{profile.bio}</Text> : null}
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.editProfileBtn, { backgroundColor: t.card, borderColor: t.border }]}
            onPress={() => router.push("/edit-profile")}
          >
            <Text style={[styles.editProfileText, { color: t.text }]}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.editProfileBtn, { backgroundColor: t.card, borderColor: t.border }]}
            onPress={() => router.push("/resources")}
          >
            <Text style={[styles.editProfileText, { color: t.text }]}>Resources</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.tabBar, { borderTopColor: t.border, borderBottomColor: t.border }]}> 
          <View style={[styles.tabItem, styles.tabItemActive]}>
            <Ionicons name="grid-outline" size={22} color="#FFFFFF" />
          </View>
        </View>

        {loading ? (
          <View style={styles.emptyTab}>
            <ActivityIndicator color={t.accent} />
            <Text style={[styles.emptyTabText, { color: t.subtext }]}>Loading posts...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyTab}>
            <Ionicons name="alert-circle-outline" size={42} color="#8E8E93" />
            <Text style={[styles.emptyTabText, { color: t.subtext, textAlign: "center" }]}>{error}</Text>
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.emptySection}>
            <Ionicons name="camera-outline" size={52} color="#3C3C3E" style={{ marginBottom: 10 }} />
            <Text style={[styles.emptyTitle, { color: t.text }]}>Share Your First Post</Text>
            <Text style={[styles.emptySubtitle, { color: t.subtext }]}>Photos and videos you share will appear here.</Text>

            {suggested.length > 0 && (
              <View style={styles.suggestSection}>
                <View style={styles.suggestHeaderRow}>
                  <Text style={[styles.suggestTitle, { color: t.text }]}>Suggested for you</Text>
                  <TouchableOpacity onPress={() => router.push("/search")}>
                    <Text style={[styles.suggestSeeAll, { color: t.accent }]}>See All</Text>
                  </TouchableOpacity>
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
                        <Text style={styles.suggestInitials}>
                          {item.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View style={styles.suggestInfo}>
                      <Text style={[styles.suggestName, { color: t.text }]} numberOfLines={1}>{item.fullName}</Text>
                      <Text style={styles.suggestHandle} numberOfLines={1}>{item.username ? `@${item.username}` : "Member"}</Text>
                    </View>
                    <Pressable
                      style={[
                        styles.suggestFollowBtn,
                        followedIds.has(item.id)
                          ? { backgroundColor: t.card, borderWidth: StyleSheet.hairlineWidth, borderColor: t.border }
                          : { backgroundColor: t.accent },
                        followingInProgress.has(item.id) && { opacity: 0.6 },
                      ]}
                      onPress={() => handleToggleFollow(item.id)}
                      disabled={followingInProgress.has(item.id)}
                    >
                      <Text style={[styles.suggestFollowText, followedIds.has(item.id) && { color: t.text }]}>
                        {followedIds.has(item.id) ? "Following" : "Follow"}
                      </Text>
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  username: { fontSize: 20, fontWeight: "700" },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 24,
  },
  avatarCol: {},
  avatarCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
  },
  avatarImage: { width: "100%", height: "100%", borderRadius: 999 },
  avatarText: { color: "#FFF", fontSize: 30, fontWeight: "700" },
  statsCol: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statBlock: { alignItems: "center" },
  statValue: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
  statLabel: { fontSize: 12, marginTop: 2 },
  bioSection: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 4,
  },
  profileName: { fontSize: 15, fontWeight: "700" },
  bioText: { fontSize: 13, lineHeight: 18 },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  editProfileBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  editProfileText: { fontSize: 13, fontWeight: "600" },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 2,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabItemActive: {
    borderBottomWidth: 1,
    borderBottomColor: "#FFFFFF",
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
  },
  gridCell: {
    width: GRID_SIZE,
    height: GRID_SIZE,
    backgroundColor: "#111113",
  },
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
  emptyTab: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
    width: "100%",
    paddingHorizontal: 16,
  },
  emptyTabText: { fontSize: 14 },
  emptySection: {
    alignItems: "center",
    paddingTop: 48,
    paddingHorizontal: 24,
    paddingBottom: 32,
    width: "100%",
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  emptySubtitle: { fontSize: 13, textAlign: "center", lineHeight: 18, marginBottom: 28 },
  suggestSection: { width: "100%", marginTop: 4 },
  suggestHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  suggestTitle: { fontSize: 15, fontWeight: "700" },
  suggestSeeAll: { fontSize: 13, fontWeight: "600" },
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
  suggestName: { fontSize: 13, fontWeight: "600" },
  suggestHandle: { color: "#8E8E93", fontSize: 12, marginTop: 2 },
  suggestFollowBtn: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  suggestFollowText: { color: "#fff", fontSize: 13, fontWeight: "700" },
});
