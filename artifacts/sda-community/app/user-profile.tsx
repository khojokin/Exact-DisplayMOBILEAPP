import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Platform, StatusBar, FlatList, Modal, Share, Alert, Dimensions,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";

const { width: SCREEN_W } = Dimensions.get("window");
const GRID_SIZE = (SCREEN_W - 4) / 3;

interface UserData {
  name: string;
  username: string;
  role?: string;
  roleColor?: string;
  color: string;
  bio: string;
  posts: number;
  followers: number;
  following: number;
  verified: boolean;
  gridPosts: { id: string; color: string }[];
  likedPosts: { id: string; text: string; author: string; timeAgo: string; reactions: number }[];
  taggedPosts: { id: string; text: string; author: string; timeAgo: string; reactions: number }[];
  followersList: { id: string; name: string; role?: string; color: string; verified?: boolean; isFollowing: boolean }[];
  followingList: { id: string; name: string; role?: string; color: string; verified?: boolean; isFollowing: boolean }[];
}

const USERS: Record<string, UserData> = {
  "Pastor James Osei": {
    name: "Pastor James Osei", username: "pastorjamesosei",
    role: "Pastor", roleColor: "#6B7B5A", color: "#3B5BDB",
    bio: "Senior Pastor at SDA Community. Servant of God, husband, father. Preaching the everlasting gospel. 🙏",
    posts: 143, followers: 1240, following: 88, verified: true,
    gridPosts: [
      { id: "g1", color: "#1A2A3A" }, { id: "g2", color: "#2A1A3A" }, { id: "g3", color: "#2A3A1A" },
      { id: "g4", color: "#3A2A1A" }, { id: "g5", color: "#1A3A2A" }, { id: "g6", color: "#3A1A2A" },
      { id: "g7", color: "#2A2A3A" }, { id: "g8", color: "#3A3A1A" }, { id: "g9", color: "#1A3A3A" },
    ],
    likedPosts: [
      { id: "l1", text: "\"Be still and know that I am God\" – Psalm 46:10.", author: "Elder Ruth Nakamura", timeAgo: "2d ago", reactions: 134 },
      { id: "l2", text: "Pathfinders camp registration is open! Don't miss the blessing 🏕️", author: "Grace Adetokunbo", timeAgo: "4d ago", reactions: 56 },
    ],
    taggedPosts: [
      { id: "t1", text: "Grateful for the wisdom and leadership of Pastor James Osei 🙌", author: "Elder Ruth Nakamura", timeAgo: "3d ago", reactions: 89 },
    ],
    followersList: [
      { id: "f1", name: "Elder Ruth Nakamura", role: "Elder", color: "#B8860B", verified: true, isFollowing: true },
      { id: "f2", name: "David Mensah", color: "#C85200", isFollowing: false },
      { id: "f3", name: "Grace Adetokunbo", color: "#0E7B5B", isFollowing: true },
    ],
    followingList: [
      { id: "fw1", name: "Elder Ruth Nakamura", role: "Elder", color: "#B8860B", verified: true, isFollowing: true },
      { id: "fw2", name: "Grace Adetokunbo", color: "#0E7B5B", isFollowing: true },
    ],
  },
  "Elder Ruth Nakamura": {
    name: "Elder Ruth Nakamura", username: "elderruthnakamura",
    role: "Elder", roleColor: "#B8860B", color: "#B8860B",
    bio: "Elder & Women's Ministry Leader. Passionate about God's Word and discipleship. Making disciples one day at a time.",
    posts: 87, followers: 654, following: 112, verified: true,
    gridPosts: [
      { id: "g1", color: "#3A2A0A" }, { id: "g2", color: "#2A3A0A" }, { id: "g3", color: "#0A2A3A" },
      { id: "g4", color: "#3A0A2A" }, { id: "g5", color: "#0A3A2A" }, { id: "g6", color: "#2A0A3A" },
    ],
    likedPosts: [
      { id: "l1", text: "Sabbath Service at 9:30 AM. Come expecting a blessing!", author: "Pastor James Osei", timeAgo: "5h ago", reactions: 92 },
    ],
    taggedPosts: [
      { id: "t1", text: "Thank you Elder Ruth for leading our Women's Bible Study! 💛", author: "Grace Adetokunbo", timeAgo: "5d ago", reactions: 78 },
    ],
    followersList: [
      { id: "f1", name: "Pastor James Osei", role: "Pastor", color: "#3B5BDB", verified: true, isFollowing: true },
      { id: "f2", name: "David Mensah", color: "#C85200", isFollowing: false },
    ],
    followingList: [
      { id: "fw1", name: "Pastor James Osei", role: "Pastor", color: "#3B5BDB", verified: true, isFollowing: true },
    ],
  },
  "David Mensah": {
    name: "David Mensah", username: "davidmensah",
    color: "#C85200",
    bio: "Worship leader & choir director at SDA Community. Music is my ministry. God gets all the glory 🎵",
    posts: 56, followers: 380, following: 204, verified: false,
    gridPosts: [
      { id: "g1", color: "#3A1A0A" }, { id: "g2", color: "#2A2A0A" }, { id: "g3", color: "#1A2A2A" },
      { id: "g4", color: "#3A0A0A" }, { id: "g5", color: "#0A3A1A" }, { id: "g6", color: "#2A0A2A" },
    ],
    likedPosts: [
      { id: "l1", text: "Sabbath Service at 9:30 AM this week!", author: "Pastor James Osei", timeAgo: "5h ago", reactions: 92 },
    ],
    taggedPosts: [
      { id: "t1", text: "David and the choir brought heaven down last Sabbath 🎶🙏", author: "Pastor James Osei", timeAgo: "1w ago", reactions: 176 },
    ],
    followersList: [
      { id: "f1", name: "Grace Adetokunbo", color: "#0E7B5B", isFollowing: true },
    ],
    followingList: [
      { id: "fw1", name: "Pastor James Osei", role: "Pastor", color: "#3B5BDB", verified: true, isFollowing: true },
    ],
  },
  "Grace Adetokunbo": {
    name: "Grace Adetokunbo", username: "graceadetokunbo",
    color: "#0E7B5B",
    bio: "SDA member & Pathfinder leader. Raising the next generation for Christ. Ghana 🇬🇭",
    posts: 34, followers: 211, following: 198, verified: false,
    gridPosts: [
      { id: "g1", color: "#0A2A1A" }, { id: "g2", color: "#1A3A0A" }, { id: "g3", color: "#0A1A2A" },
      { id: "g4", color: "#2A1A0A" }, { id: "g5", color: "#0A2A2A" }, { id: "g6", color: "#1A0A3A" },
    ],
    likedPosts: [
      { id: "l1", text: "\"Be still and know that I am God\" – Psalm 46:10.", author: "Elder Ruth Nakamura", timeAgo: "7h ago", reactions: 134 },
    ],
    taggedPosts: [
      { id: "t1", text: "Grace and her Pathfinders unit came through for community outreach 🏅", author: "Pastor James Osei", timeAgo: "2w ago", reactions: 89 },
    ],
    followersList: [
      { id: "f1", name: "Samuel Boateng", color: "#8B5E00", isFollowing: false },
    ],
    followingList: [
      { id: "fw1", name: "Pastor James Osei", role: "Pastor", color: "#3B5BDB", verified: true, isFollowing: true },
    ],
  },
  "Samuel Boateng": {
    name: "Samuel Boateng", username: "samuelboateng",
    color: "#8B5E00",
    bio: "Bible student. Deacon in training. Spreading joy and scripture every day. 📖",
    posts: 29, followers: 145, following: 176, verified: false,
    gridPosts: [
      { id: "g1", color: "#2A1A0A" }, { id: "g2", color: "#1A2A0A" }, { id: "g3", color: "#0A1A1A" },
    ],
    likedPosts: [
      { id: "l1", text: "Sabbath Service at 9:30 AM!", author: "Pastor James Osei", timeAgo: "5h ago", reactions: 92 },
    ],
    taggedPosts: [],
    followersList: [
      { id: "f1", name: "Grace Adetokunbo", color: "#0E7B5B", isFollowing: true },
    ],
    followingList: [
      { id: "fw1", name: "Pastor James Osei", role: "Pastor", color: "#3B5BDB", verified: true, isFollowing: true },
    ],
  },
};

const DEFAULT_USER = USERS["Pastor James Osei"];

const TABS = [
  { id: "grid", icon: "grid-outline" as const },
  { id: "heart", icon: "heart-outline" as const },
  { id: "tag", icon: "pricetag-outline" as const },
];

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function MiniAvatar({ name, color, size = 40 }: { name: string; color: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#FFF", fontWeight: "700", fontSize: size * 0.36 }}>{initials(name)}</Text>
    </View>
  );
}

function FollowersModal({
  visible, type, user, onClose,
}: {
  visible: boolean;
  type: "followers" | "following";
  user: UserData;
  onClose: () => void;
}) {
  const list = type === "followers" ? user.followersList : user.followingList;
  const [followState, setFollowState] = useState<Record<string, boolean>>(() => {
    const s: Record<string, boolean> = {};
    list.forEach((u) => { s[u.id] = u.isFollowing; });
    return s;
  });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={mStyles.overlay}>
        <View style={mStyles.container}>
          <View style={mStyles.handle} />
          <View style={mStyles.header}>
            <Text style={mStyles.title}>{type === "followers" ? "Followers" : "Following"}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color="#8E8E93" />
            </TouchableOpacity>
          </View>
          <View style={mStyles.divider} />
          {list.length === 0 ? (
            <View style={mStyles.empty}>
              <Ionicons name="people-outline" size={40} color="#3C3C3E" />
              <Text style={mStyles.emptyText}>
                {type === "followers" ? "No followers yet" : "Not following anyone yet"}
              </Text>
            </View>
          ) : (
            <FlatList
              data={list}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 40 }}
              renderItem={({ item }) => (
                <View style={mStyles.userRow}>
                  <TouchableOpacity
                    style={mStyles.userRowLeft}
                    onPress={() => { onClose(); router.push({ pathname: "/user-profile", params: { name: item.name } }); }}
                  >
                    <MiniAvatar name={item.name} color={item.color} size={44} />
                    <View style={mStyles.userInfo}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Text style={mStyles.userName} numberOfLines={1}>{item.name}</Text>
                        {item.verified && <Ionicons name="checkmark-circle" size={14} color="#3B5BDB" />}
                      </View>
                      {item.role && <Text style={mStyles.userRole}>{item.role}</Text>}
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[mStyles.followBtn, followState[item.id] && mStyles.followBtnActive]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setFollowState((prev) => ({ ...prev, [item.id]: !prev[item.id] }));
                    }}
                  >
                    <Text style={[mStyles.followBtnText, followState[item.id] && mStyles.followBtnTextActive]}>
                      {followState[item.id] ? "Following" : "Follow"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

function ActionsSheet({
  visible, user, isFollowed, onClose, onFollow,
}: {
  visible: boolean;
  user: UserData;
  isFollowed: boolean;
  onClose: () => void;
  onFollow: () => void;
}) {
  const firstName = user.name.split(" ")[0];
  const actions = [
    {
      label: isFollowed ? `Unfollow ${firstName}` : `Follow ${firstName}`,
      icon: isFollowed ? "person-remove-outline" : "person-add-outline",
      color: isFollowed ? "#FF453A" : "#6B7B5A",
      onPress: () => { onFollow(); onClose(); },
    },
    { label: "Send Message", icon: "chatbubble-outline", color: "#FFF", onPress: () => { onClose(); router.push({ pathname: "/dm/[id]", params: { id: "1" } }); } },
    { label: "Share Profile", icon: "share-social-outline", color: "#FFF", onPress: () => { onClose(); Share.share({ message: `Check out ${user.name}'s profile on SDA Community!` }); } },
    { label: "About This Account", icon: "information-circle-outline", color: "#FFF", onPress: () => { onClose(); Alert.alert(`About ${user.name}`, `Member since 2021\n${user.posts} posts · ${user.followers.toLocaleString()} followers\n\n${user.bio}`, [{ text: "OK" }]); } },
    { label: `Mute ${firstName}`, icon: "volume-mute-outline", color: "#FFF", onPress: () => { onClose(); Alert.alert("Muted", `You won't see posts from ${firstName} in your feed.`); } },
    { label: `Report ${firstName}`, icon: "flag-outline", color: "#FF453A", onPress: () => { onClose(); Alert.alert("Report Submitted", "Thank you. Our team will review this account."); } },
    { label: `Block ${firstName}`, icon: "ban-outline", color: "#FF453A", onPress: () => { onClose(); Alert.alert(`Block ${firstName}?`, `${firstName} won't be able to see your posts.`, [{ text: `Block`, style: "destructive", onPress: () => Alert.alert("Blocked", `${firstName} has been blocked.`) }, { text: "Cancel", style: "cancel" }]); } },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={aStyles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={aStyles.container}>
          <View style={aStyles.handle} />
          <View style={aStyles.userPreview}>
            <MiniAvatar name={user.name} color={user.color} size={46} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <Text style={aStyles.previewName} numberOfLines={1}>{user.name}</Text>
                {user.verified && <Ionicons name="checkmark-circle" size={14} color="#3B5BDB" />}
              </View>
              {user.role && <Text style={aStyles.previewRole}>{user.role}</Text>}
            </View>
          </View>
          <View style={aStyles.divider} />
          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            {actions.map((action, i) => (
              <TouchableOpacity key={i} style={aStyles.action} onPress={action.onPress}>
                <View style={[aStyles.actionIcon, { backgroundColor: action.color === "#FF453A" ? "#FF453A22" : action.color === "#6B7B5A" ? "#6B7B5A22" : "#1C1C1E" }]}>
                  <Ionicons name={action.icon as any} size={20} color={action.color} />
                </View>
                <Text style={[aStyles.actionLabel, { color: action.color }]}>{action.label}</Text>
                <Ionicons name="chevron-forward" size={16} color="#3C3C3E" style={{ marginLeft: "auto" }} />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={aStyles.cancelBtn} onPress={onClose}>
            <Text style={aStyles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

function PostListItem({ post }: { post: { id: string; text: string; author: string; timeAgo: string; reactions: number } }) {
  return (
    <TouchableOpacity
      style={listStyles.card}
      onPress={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })}
      activeOpacity={0.8}
    >
      <Text style={listStyles.authorText}>{post.author}</Text>
      <Text style={listStyles.postText} numberOfLines={3}>{post.text}</Text>
      <View style={listStyles.meta}>
        <Ionicons name="heart-outline" size={13} color="#636366" />
        <Text style={listStyles.metaText}>{post.reactions} reactions</Text>
        <Text style={listStyles.dot}>·</Text>
        <Text style={listStyles.metaText}>{post.timeAgo}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function UserProfileScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const user = (name && USERS[name as string]) ? USERS[name as string] : DEFAULT_USER;
  const userInitials = user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  const [following, setFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("grid");
  const [followersModal, setFollowersModal] = useState<"followers" | "following" | null>(null);
  const [actionsVisible, setActionsVisible] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      {followersModal && (
        <FollowersModal
          visible={!!followersModal}
          type={followersModal}
          user={user}
          onClose={() => setFollowersModal(null)}
        />
      )}

      <ActionsSheet
        visible={actionsVisible}
        user={user}
        isFollowed={following}
        onClose={() => setActionsVisible(false)}
        onFollow={() => { Haptics.selectionAsync(); setFollowing((v) => !v); }}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header — back + username + more */}
        <View style={[styles.topBar, { paddingTop: topPad }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.topBtn}>
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.topCenter}>
            <Text style={styles.topUsername} numberOfLines={1}>@{user.username}</Text>
            {user.verified && (
              <Ionicons name="checkmark-circle" size={14} color="#3B5BDB" />
            )}
          </View>
          <TouchableOpacity
            style={styles.topBtn}
            onPress={() => { Haptics.selectionAsync(); setActionsVisible(true); }}
          >
            <Feather name="more-horizontal" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Avatar + Stats row — identical to own profile layout */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarCol}>
            <View style={[styles.avatarCircle, { backgroundColor: user.color }]}>
              <Text style={styles.avatarText}>{userInitials}</Text>
            </View>
          </View>

          <View style={styles.statsCol}>
            <TouchableOpacity style={styles.statBlock} onPress={() => setActiveTab("grid")}>
              <Text style={styles.statValue}>{user.posts}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statBlock} onPress={() => setFollowersModal("followers")}>
              <Text style={styles.statValue}>{user.followers.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statBlock} onPress={() => setFollowersModal("following")}>
              <Text style={styles.statValue}>{user.following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bio section — same as own profile */}
        <View style={styles.bioSection}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={styles.profileName}>{user.name}</Text>
            {user.verified && <Ionicons name="checkmark-circle" size={15} color="#3B5BDB" />}
          </View>
          {user.role && (
            <View style={[styles.roleBadge, { backgroundColor: (user.roleColor ?? "#6B7B5A") + "33" }]}>
              <Text style={[styles.roleText, { color: user.roleColor ?? "#6B7B5A" }]}>{user.role}</Text>
            </View>
          )}
          <Text style={styles.bioText}>{user.bio}</Text>
          <View style={styles.sdaRow}>
            <View style={styles.sdaBadge}>
              <Text style={styles.sdaBadgeText}>SDA</Text>
            </View>
            <Text style={styles.sdaMemberText}>Member of SDA Community</Text>
          </View>
        </View>

        {/* Action row — Follow / Message / More (matches own profile button row) */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.followBtn, following && styles.followingBtn]}
            onPress={() => { Haptics.selectionAsync(); setFollowing((v) => !v); }}
          >
            <Text style={[styles.followBtnText, following && styles.followingBtnText]}>
              {following ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.messageBtn}
            onPress={() => router.push({ pathname: "/dm/[id]", params: { id: "1" } })}
          >
            <Ionicons name="chatbubble-outline" size={15} color="#FFF" />
            <Text style={styles.messageBtnText}>Message</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.moreBtn}
            onPress={() => { Haptics.selectionAsync(); setActionsVisible(true); }}
          >
            <Feather name="chevron-down" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Tab bar — identical to own profile */}
        <View style={styles.tabBar}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabItem, activeTab === tab.id && styles.tabItemActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={tab.icon}
                size={22}
                color={activeTab === tab.id ? "#FFFFFF" : "#636366"}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Grid / Liked / Tagged content */}
        {activeTab === "grid" && (
          <View style={styles.photoGrid}>
            {user.gridPosts.map((post) => (
              <TouchableOpacity
                key={post.id}
                style={[styles.gridCell, { backgroundColor: post.color }]}
                onPress={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })}
              >
                <Ionicons name="image-outline" size={28} color="rgba(255,255,255,0.2)" />
              </TouchableOpacity>
            ))}
            {user.gridPosts.length === 0 && (
              <View style={styles.emptyTab}>
                <Ionicons name="grid-outline" size={44} color="#3C3C3E" />
                <Text style={styles.emptyTabText}>No posts yet</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === "heart" && (
          <View style={{ paddingHorizontal: 14, paddingTop: 8 }}>
            {user.likedPosts.length === 0 ? (
              <View style={styles.emptyTab}>
                <Ionicons name="heart-outline" size={44} color="#3C3C3E" />
                <Text style={styles.emptyTabText}>No liked posts</Text>
              </View>
            ) : (
              user.likedPosts.map((post) => <PostListItem key={post.id} post={post} />)
            )}
          </View>
        )}

        {activeTab === "tag" && (
          <View style={{ paddingHorizontal: 14, paddingTop: 8 }}>
            {user.taggedPosts.length === 0 ? (
              <View style={styles.emptyTab}>
                <Ionicons name="pricetag-outline" size={44} color="#3C3C3E" />
                <Text style={styles.emptyTabText}>No tagged posts</Text>
              </View>
            ) : (
              user.taggedPosts.map((post) => <PostListItem key={post.id} post={post} />)
            )}
          </View>
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
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  topBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  topCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  topUsername: { color: "#FFF", fontSize: 16, fontWeight: "700" },

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
    borderColor: "#3C3C3E",
  },
  avatarText: { color: "#FFF", fontSize: 30, fontWeight: "700" },

  statsCol: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statBlock: { alignItems: "center" },
  statValue: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
  statLabel: { color: "#8E8E93", fontSize: 12, marginTop: 2 },

  bioSection: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 4,
  },
  profileName: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  roleBadge: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  roleText: { fontSize: 11, fontWeight: "700" },
  bioText: { color: "#AEAEB2", fontSize: 13, lineHeight: 18 },
  sdaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  sdaBadge: { backgroundColor: "#4A674133", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  sdaBadgeText: { color: "#6B7B5A", fontSize: 10, fontWeight: "700" },
  sdaMemberText: { color: "#8E8E93", fontSize: 12 },

  actionRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
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
  moreBtn: {
    backgroundColor: "#1C1C1E",
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#3C3C3E",
  },

  tabBar: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#2C2C2E",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2C2C2E",
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
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTab: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
    width: "100%",
  },
  emptyTabText: { color: "#48484A", fontSize: 14 },
});

const mStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  container: { backgroundColor: "#111", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "80%" },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: "#3C3C3E", alignSelf: "center", marginTop: 10, marginBottom: 14 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, marginBottom: 12 },
  title: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#2C2C2E", marginBottom: 4 },
  userRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, gap: 12 },
  userRowLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  userInfo: { flex: 1 },
  userName: { color: "#FFF", fontSize: 14, fontWeight: "600" },
  userRole: { color: "#8E8E93", fontSize: 12, marginTop: 1 },
  followBtn: { backgroundColor: "#4A6741", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  followBtnActive: { backgroundColor: "#1C1C1E", borderWidth: StyleSheet.hairlineWidth, borderColor: "#3C3C3E" },
  followBtnText: { color: "#FFF", fontSize: 13, fontWeight: "700" },
  followBtnTextActive: { color: "#FFF", fontWeight: "600" },
  empty: { alignItems: "center", paddingVertical: 40, gap: 10 },
  emptyText: { color: "#636366", fontSize: 14 },
});

const aStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  container: { backgroundColor: "#111", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "85%", paddingBottom: 30 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: "#3C3C3E", alignSelf: "center", marginTop: 10, marginBottom: 14 },
  userPreview: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 14 },
  previewName: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  previewRole: { color: "#8E8E93", fontSize: 12, marginTop: 1 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#2C2C2E", marginBottom: 4 },
  action: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 14 },
  actionIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  actionLabel: { flex: 1, fontSize: 15 },
  cancelBtn: { marginHorizontal: 16, marginTop: 10, backgroundColor: "#1C1C1E", borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  cancelText: { color: "#FFF", fontSize: 15, fontWeight: "600" },
});

const listStyles = StyleSheet.create({
  card: { backgroundColor: "#111", borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: "#2C2C2E" },
  authorText: { color: "#6B7B5A", fontSize: 12, fontWeight: "700", marginBottom: 4 },
  postText: { color: "#AEAEB2", fontSize: 14, lineHeight: 20 },
  meta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
  metaText: { color: "#636366", fontSize: 12 },
  dot: { color: "#636366", fontSize: 12 },
});
