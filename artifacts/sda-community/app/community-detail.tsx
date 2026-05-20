import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Platform,
  StatusBar,
  Share,
  Alert,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

const COMMUNITY_DATA: Record<string, {
  id: string; name: string; color: string; icon: string;
  members: string; description: string; category: string; founded: string;
}> = {
  sc1: { id: "sc1", name: "SDA Youth Network",       color: "#3B5BDB", icon: "people-outline",        members: "3,204", description: "A space for SDA young adults to connect, share testimonies, and grow together in faith. Weekly challenges, Bible studies, and events.", category: "Youth", founded: "2018" },
  sc2: { id: "sc2", name: "Prayer Warriors",          color: "#6B4F9B", icon: "hand-right-outline",    members: "1,842", description: "Intercessors standing in the gap for our church family. Daily prayer requests, 24-hour prayer chain, and fasting schedules.", category: "Prayer", founded: "2016" },
  sc3: { id: "sc3", name: "SDA Music Ministry",       color: "#8B3A8B", icon: "musical-notes-outline", members: "940",   description: "Choir, praise teams, and instrumentalists serving together for God's glory. Sheet music, rehearsal schedules, and worship resources.", category: "Worship", founded: "2015" },
  sc4: { id: "sc4", name: "Sabbath School Teachers",  color: "#B8860B", icon: "book-outline",          members: "620",   description: "Equipping Sabbath School teachers with lesson resources, teaching strategies, and encouragement for their vital ministry.", category: "Education", founded: "2019" },
  sc5: { id: "sc5", name: "Health & Wellness",        color: "#0E7B5B", icon: "leaf-outline",          members: "1,102", description: "Living the SDA health message — plant-based recipes, fitness challenges, mental health support, and whole-person wellness resources.", category: "Health", founded: "2020" },
};

const COMMUNITY_POSTS: Record<string, { id: string; author: string; authorColor: string; timeAgo: string; content: string; likes: number; comments: number; liked: boolean }[]> = {
  sc1: [
    { id: "1", author: "Pastor James Osei", authorColor: "#3B5BDB", timeAgo: "2h ago", content: "Reminder: Youth Sabbath is THIS week! Come ready to worship, connect, and be inspired. 9:30 AM at the main sanctuary. Bring a friend! 🎉", likes: 54, comments: 12, liked: false },
    { id: "2", author: "Naomi Asante", authorColor: "#0E7B5B", timeAgo: "5h ago", content: "Just finished our youth devotional this morning — 'The God Who Sees' based on Genesis 16:13. What a reminder that God sees every one of us personally. 🙏", likes: 38, comments: 7, liked: true },
  ],
  sc2: [
    { id: "1", author: "Elder Ruth Nakamura", authorColor: "#B8860B", timeAgo: "1h ago", content: "Prayer request: Please intercede for Sister Mary who is recovering from surgery. God is our healer and our strength. Isaiah 41:10 🙏", likes: 67, comments: 22, liked: false },
    { id: "2", author: "Samuel Boateng", authorColor: "#8B5E00", timeAgo: "4h ago", content: "The 6 AM prayer chain has been such a blessing this week. Thank you to everyone who has been joining. Let's keep it going! Psalms 55:17", likes: 45, comments: 8, liked: true },
  ],
  sc3: [
    { id: "1", author: "Abigail Owusu", authorColor: "#8B3A8B", timeAgo: "3h ago", content: "Choir rehearsal this Thursday at 6 PM. We're preparing a special anthem for the anniversary service. Voices needed! 🎵 All skill levels welcome.", likes: 29, comments: 14, liked: false },
    { id: "2", author: "David Mensah", authorColor: "#C85200", timeAgo: "8h ago", content: "New hymn arrangement uploaded to our shared folder. 'Great Is Thy Faithfulness' — four-part harmony. Let me know what you think. 🎶", likes: 43, comments: 18, liked: false },
  ],
  sc4: [
    { id: "1", author: "Elder Ruth Nakamura", authorColor: "#B8860B", timeAgo: "6h ago", content: "This week's Sabbath School lesson focus: 'Faith and Works in James'. Discussion questions and activity ideas are in the resources folder.", likes: 31, comments: 9, liked: false },
    { id: "2", author: "Grace Adetokunbo", authorColor: "#0E7B5B", timeAgo: "1d ago", content: "My class had the most amazing discussion today — the kids asked questions that even gave me pause! God's word truly is alive and active. Hebrews 4:12", likes: 52, comments: 16, liked: true },
  ],
  sc5: [
    { id: "1", author: "Joseph Asante", authorColor: "#4A5A7A", timeAgo: "4h ago", content: "Day 7 of the plant-based challenge! Sharing today's lunch — lentil and sweet potato stew. Recipe in the comments. Feeling amazing! 🌿", likes: 78, comments: 31, liked: false },
    { id: "2", author: "Mary Adjei", authorColor: "#6B3A7A", timeAgo: "12h ago", content: "Mental wellness reminder: rest is not laziness. God rested on the seventh day for good reason. Give yourself permission to pause this Sabbath. 💚", likes: 94, comments: 19, liked: true },
  ],
};

const TABS = ["Posts", "About", "Members"] as const;

function AvatarCircle({ name, color, size = 36 }: { name: string; color: string; size?: number }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#FFF", fontWeight: "700", fontSize: size * 0.36 }}>{initials}</Text>
    </View>
  );
}

export default function CommunityDetailScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const { id } = useLocalSearchParams<{ id: string }>();

  const community = COMMUNITY_DATA[id] ?? COMMUNITY_DATA.sc1;
  const posts = COMMUNITY_POSTS[id] ?? COMMUNITY_POSTS.sc1;

  const [joined, setJoined] = useState(false);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("Posts");
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set(posts.filter((p) => p.liked).map((p) => p.id)));

  function toggleLike(postId: string) {
    Haptics.selectionAsync();
    setLikedPosts((prev) => {
      const next = new Set(prev);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
  }

  function handleJoin() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setJoined((prev) => !prev);
  }

  const MEMBERS_PREVIEW = [
    { id: "1", name: "Pastor James Osei", role: "Admin",    color: "#3B5BDB" },
    { id: "2", name: "Elder Ruth Nakamura", role: "Moderator", color: "#B8860B" },
    { id: "3", name: "David Mensah",       role: "Member",  color: "#C85200" },
    { id: "4", name: "Grace Adetokunbo",   role: "Member",  color: "#0E7B5B" },
    { id: "5", name: "Abigail Owusu",      role: "Member",  color: "#8B3A8B" },
  ];

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      {/* ── Banner ── */}
      <View style={[styles.banner, { backgroundColor: community.color + "18" }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={() => Share.share({ message: `Join the ${community.name} community on erha!` })}
        >
          <Feather name="share-2" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* ── Community header ── */}
      <View style={styles.communityHeader}>
        <View style={[styles.communityIcon, { backgroundColor: community.color + "22", borderColor: community.color + "55" }]}>
          <Ionicons name={community.icon as any} size={28} color={community.color} />
        </View>
        <View style={styles.communityMeta}>
          <Text style={styles.communityName}>{community.name}</Text>
          <View style={styles.communityStats}>
            <Text style={styles.statText}>{community.members} members</Text>
            <Text style={styles.statDot}>·</Text>
            <Text style={styles.statText}>{community.category}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.joinBtn, joined && styles.joinedBtn]}
          onPress={handleJoin}
        >
          {joined && <Ionicons name="checkmark" size={14} color="#FFF" style={{ marginRight: 4 }} />}
          <Text style={styles.joinBtnText}>{joined ? "Joined" : "Join"}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Tabs ── */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => { Haptics.selectionAsync(); setActiveTab(tab); }}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            {activeTab === tab && <View style={[styles.tabIndicator, { backgroundColor: community.color }]} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Content ── */}
      {activeTab === "Posts" && (
        <FlatList
          data={posts}
          keyExtractor={(p) => p.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
          renderItem={({ item }) => {
            const isLiked = likedPosts.has(item.id);
            return (
              <View style={styles.postCard}>
                <View style={styles.postHeader}>
                  <AvatarCircle name={item.author} color={item.authorColor} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.postAuthor}>{item.author}</Text>
                    <Text style={styles.postTime}>{item.timeAgo}</Text>
                  </View>
                </View>
                <Text style={styles.postContent}>{item.content}</Text>
                <View style={styles.postActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => toggleLike(item.id)}>
                    <Ionicons name={isLiked ? "heart" : "heart-outline"} size={18} color={isLiked ? "#FF3B5B" : "#636366"} />
                    <Text style={[styles.actionText, isLiked && { color: "#FF3B5B" }]}>
                      {item.likes + (isLiked && !item.liked ? 1 : !isLiked && item.liked ? -1 : 0)}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => router.push({ pathname: "/post/[id]", params: { id: item.id } })}>
                    <Ionicons name="chatbubble-outline" size={18} color="#636366" />
                    <Text style={styles.actionText}>{item.comments}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => Share.share({ message: `"${item.content.slice(0, 80)}..." — ${item.author} in ${community.name}` })}
                  >
                    <Feather name="share-2" size={16} color="#636366" />
                    <Text style={styles.actionText}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      {activeTab === "About" && (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 60 }} showsVerticalScrollIndicator={false}>
          <Text style={styles.aboutSection}>About</Text>
          <Text style={styles.aboutBody}>{community.description}</Text>

          <View style={styles.aboutStatRow}>
            <View style={styles.aboutStat}>
              <Text style={[styles.aboutStatNum, { color: community.color }]}>{community.members}</Text>
              <Text style={styles.aboutStatLabel}>Members</Text>
            </View>
            <View style={styles.aboutStat}>
              <Text style={[styles.aboutStatNum, { color: community.color }]}>{community.category}</Text>
              <Text style={styles.aboutStatLabel}>Category</Text>
            </View>
            <View style={styles.aboutStat}>
              <Text style={[styles.aboutStatNum, { color: community.color }]}>{community.founded}</Text>
              <Text style={styles.aboutStatLabel}>Founded</Text>
            </View>
          </View>

          <Text style={[styles.aboutSection, { marginTop: 24 }]}>Community Rules</Text>
          {["Be respectful and kind to all members", "Share faith-building content", "No spam or self-promotion", "Keep discussions on-topic", "Pray for one another"].map((rule, i) => (
            <View key={i} style={styles.ruleRow}>
              <View style={[styles.ruleDot, { backgroundColor: community.color }]} />
              <Text style={styles.ruleText}>{rule}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {activeTab === "Members" && (
        <FlatList
          data={MEMBERS_PREVIEW}
          keyExtractor={(m) => m.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}
          ListHeaderComponent={
            <TouchableOpacity
              style={styles.viewAllMembersBtn}
              onPress={() => router.push("/members")}
            >
              <Ionicons name="people-outline" size={16} color={community.color} />
              <Text style={[styles.viewAllMembersText, { color: community.color }]}>
                View all {community.members} members
              </Text>
            </TouchableOpacity>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.memberRow}
              onPress={() => router.push({ pathname: "/user-profile", params: { name: item.name } })}
            >
              <AvatarCircle name={item.name} color={item.color} size={44} />
              <View style={{ flex: 1 }}>
                <Text style={styles.memberName}>{item.name}</Text>
                <Text style={styles.memberRole}>{item.role}</Text>
              </View>
              {item.role === "Admin" && (
                <View style={[styles.adminBadge, { backgroundColor: community.color + "22" }]}>
                  <Text style={[styles.adminBadgeText, { color: community.color }]}>Admin</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: "#1C1C1E", marginLeft: 72 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },

  banner: {
    height: 80,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  shareBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },

  communityHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2C2C2E",
  },
  communityIcon: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, flexShrink: 0,
  },
  communityMeta: { flex: 1 },
  communityName: { color: "#FFFFFF", fontSize: 17, fontWeight: "700", marginBottom: 3 },
  communityStats: { flexDirection: "row", alignItems: "center", gap: 6 },
  statText: { color: "#8E8E93", fontSize: 12 },
  statDot: { color: "#636366", fontSize: 12 },

  joinBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18, paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#4A6741",
  },
  joinedBtn: { backgroundColor: "#2C2C2E", borderWidth: 1, borderColor: "#3C3C3E" },
  joinBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },

  tabBar: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2C2C2E",
  },
  tab: {
    flex: 1, alignItems: "center", paddingVertical: 12,
    position: "relative",
  },
  tabActive: {},
  tabText: { color: "#8E8E93", fontSize: 14, fontWeight: "500" },
  tabTextActive: { color: "#FFFFFF", fontWeight: "700" },
  tabIndicator: {
    position: "absolute", bottom: 0, left: "20%", right: "20%",
    height: 2, borderRadius: 2,
  },

  postCard: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#1C1C1E",
  },
  postHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  postAuthor: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  postTime: { color: "#636366", fontSize: 12, marginTop: 1 },
  postContent: { color: "#AEAEB2", fontSize: 14, lineHeight: 20, marginBottom: 12 },
  postActions: { flexDirection: "row", gap: 20 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  actionText: { color: "#636366", fontSize: 13 },

  aboutSection: { color: "#FFFFFF", fontSize: 16, fontWeight: "700", marginBottom: 10 },
  aboutBody: { color: "#AEAEB2", fontSize: 14, lineHeight: 22, marginBottom: 20 },
  aboutStatRow: { flexDirection: "row", gap: 12 },
  aboutStat: {
    flex: 1, backgroundColor: "#111111", borderRadius: 12,
    padding: 14, alignItems: "center",
  },
  aboutStatNum: { fontSize: 18, fontWeight: "800", marginBottom: 3 },
  aboutStatLabel: { color: "#8E8E93", fontSize: 11 },
  ruleRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  ruleDot: { width: 7, height: 7, borderRadius: 3.5, marginTop: 6, flexShrink: 0 },
  ruleText: { color: "#AEAEB2", fontSize: 14, lineHeight: 20, flex: 1 },

  viewAllMembersBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#1C1C1E",
  },
  viewAllMembersText: { fontSize: 14, fontWeight: "600" },
  memberRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12, gap: 12,
  },
  memberName: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  memberRole: { color: "#636366", fontSize: 12, marginTop: 1 },
  adminBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  adminBadgeText: { fontSize: 11, fontWeight: "700" },
});
