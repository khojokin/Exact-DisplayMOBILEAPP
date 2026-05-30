import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
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
import { fetchProfileById } from "@/lib/profiles";

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
  const [profile, setProfile] = useState<{ fullName: string; username?: string; bio?: string; avatarUrl?: string } | null>(null);

  const load = useCallback(async () => {
    if (!userId) {
      setPosts([]);
      setProfile(null);
      setLoading(false);
      return;
    }

    setError(null);
    try {
      const [profileRow, userPosts] = await Promise.all([
        fetchProfileById(userId),
        fetchPostsByUserId(userId, 120),
      ]);

      setProfile(
        profileRow
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
            }
      );
      setPosts(userPosts);
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
              <Text style={styles.statValue}>-</Text>
              <Text style={[styles.statLabel, { color: t.subtext }]}>Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statBlock} onPress={() => router.push({ pathname: "/followers", params: { type: "following" } })}>
              <Text style={styles.statValue}>-</Text>
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
          <View style={styles.emptyTab}>
            <Ionicons name="grid-outline" size={44} color="#3C3C3E" />
            <Text style={[styles.emptyTabText, { color: t.subtext }]}>No posts yet</Text>
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
});
