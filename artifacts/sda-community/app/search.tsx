import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
  StatusBar,
  ScrollView,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

// ─── Data ─────────────────────────────────────────────────────────────────────
const PEOPLE = [
  { id: "p1", name: "Pastor James Osei", role: "Pastor", roleColor: "#6B7B5A", desc: "Senior Pastor · Daily devotionals", color: "#3B5BDB", isFollowing: true },
  { id: "p2", name: "Elder Ruth Nakamura", role: "Elder", roleColor: "#B8860B", desc: "Elder · Sabbath School Director", color: "#B8860B", isFollowing: true },
  { id: "p3", name: "David Mensah", role: "Deacon", roleColor: "#3B5BDB", desc: "Pathfinder Leader · Youth Ministry", color: "#C85200", isFollowing: false },
  { id: "p4", name: "Grace Adetokunbo", desc: "Worship team · Photography", color: "#0E7B5B", isFollowing: true },
  { id: "p5", name: "Samuel Boateng", role: "Deacon", roleColor: "#3B5BDB", desc: "Deacon · Bible study facilitator", color: "#8B5E00", isFollowing: false },
  { id: "p6", name: "Abigail Owusu", desc: "Choir director · Music ministry", color: "#8B3A8B", isFollowing: true },
  { id: "p7", name: "Joseph Asante", desc: "Deacon · Bible student", color: "#4A5A7A", isFollowing: false },
  { id: "p8", name: "Mary Adjei", desc: "Women's Ministry · Prayer warrior", color: "#6B3A7A", isFollowing: true },
  { id: "p9", name: "Elder Philip Kojo", role: "Elder", roleColor: "#B8860B", desc: "Elder · Finance Committee · Mentor", color: "#2A6B4A", isFollowing: false },
  { id: "p10", name: "Sarah Owusu-Acheampong", desc: "Children's Ministry · Sabbath School", color: "#7A3A3A", isFollowing: true },
];

const SHORTS = [
  { id: "s1", creator: "Pastor James Osei", creatorColor: "#3B5BDB", desc: "Jeremiah 29:11 — God's plans for you 🙏", bg: "#0A1225", accent: "#3B5BDB", icon: "book-outline", likes: 1240 },
  { id: "s2", creator: "David Mensah", creatorColor: "#C85200", desc: "Holy, Holy, Holy — choir preview 🎶", bg: "#1A0A00", accent: "#C85200", icon: "musical-notes-outline", likes: 876 },
  { id: "s3", creator: "Grace Adetokunbo", creatorColor: "#0E7B5B", desc: "My testimony: God restored my health 💚", bg: "#001A0A", accent: "#0E7B5B", icon: "heart-outline", likes: 2100 },
  { id: "s4", creator: "Elder Ruth Nakamura", creatorColor: "#B8860B", desc: "Be still and know — Psalm 46:10 ☀️", bg: "#1A1000", accent: "#B8860B", icon: "sunny-outline", likes: 654 },
];

const TOPICS = [
  { id: "t1", label: "Sabbath", icon: "sunny-outline", count: "1.2K posts" },
  { id: "t2", label: "Prayer", icon: "hand-right-outline", count: "890 posts" },
  { id: "t3", label: "Bible Study", icon: "book-outline", count: "654 posts" },
  { id: "t4", label: "Worship", icon: "musical-notes-outline", count: "543 posts" },
  { id: "t5", label: "Testimony", icon: "heart-outline", count: "432 posts" },
  { id: "t6", label: "Pathfinders", icon: "people-outline", count: "321 posts" },
  { id: "t7", label: "Devotional", icon: "star-outline", count: "298 posts" },
  { id: "t8", label: "Community", icon: "home-outline", count: "210 posts" },
];

const TABS = ["All", "People", "Shorts", "Topics"] as const;
type Tab = typeof TABS[number];

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function fmtCount(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
}

function AvatarCircle({ name, color, size = 44 }: { name: string; color: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#FFF", fontWeight: "700", fontSize: size * 0.36 }}>{initials(name)}</Text>
    </View>
  );
}

// ─── Person Row ───────────────────────────────────────────────────────────────
function PersonRow({
  item,
  following,
  onFollow,
}: {
  item: typeof PEOPLE[0];
  following: boolean;
  onFollow: () => void;
}) {
  return (
    <TouchableOpacity
      style={s.personRow}
      activeOpacity={0.75}
      onPress={() => router.push({ pathname: "/user-profile", params: { name: item.name } })}
    >
      <AvatarCircle name={item.name} color={item.color} />
      <View style={s.personInfo}>
        <View style={s.nameRow}>
          <Text style={s.personName}>{item.name}</Text>
          {item.role && (
            <View style={[s.roleBadge, { backgroundColor: (item.roleColor ?? "#636366") + "33" }]}>
              <Text style={[s.roleText, { color: item.roleColor ?? "#636366" }]}>{item.role}</Text>
            </View>
          )}
        </View>
        <Text style={s.personDesc} numberOfLines={1}>{item.desc}</Text>
      </View>
      <TouchableOpacity
        style={[s.followBtn, following && s.followingBtn]}
        onPress={onFollow}
        activeOpacity={0.75}
      >
        <Text style={[s.followBtnText, following && s.followingBtnText]}>
          {following ? "Following" : "Follow"}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// ─── Short Card ───────────────────────────────────────────────────────────────
function ShortCard({ item }: { item: typeof SHORTS[0] }) {
  return (
    <TouchableOpacity
      style={[s.shortCard, { backgroundColor: item.bg }]}
      activeOpacity={0.8}
      onPress={() => router.push("/shorts")}
    >
      <Ionicons name={item.icon as any} size={36} color={item.accent + "60"} style={{ marginBottom: 8 }} />
      <Text style={[s.shortAccent, { color: item.accent }]} numberOfLines={2}>{item.desc}</Text>
      <View style={s.shortMeta}>
        <AvatarCircle name={item.creator} color={item.creatorColor} size={20} />
        <Text style={s.shortCreator} numberOfLines={1}>{item.creator.split(" ")[0]}</Text>
        <Ionicons name="heart" size={11} color="#FF3040" />
        <Text style={s.shortLikes}>{fmtCount(item.likes)}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Topic Pill ───────────────────────────────────────────────────────────────
function TopicRow({ item }: { item: typeof TOPICS[0] }) {
  return (
    <TouchableOpacity style={s.topicRow} activeOpacity={0.75} onPress={() => { Haptics.selectionAsync(); router.push({ pathname: "/community-detail", params: { id: item.id } }); }}>
      <View style={s.topicIcon}>
        <Ionicons name={item.icon as any} size={22} color="#6B7B5A" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.topicLabel}>#{item.label}</Text>
        <Text style={s.topicCount}>{item.count}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#3C3C3E" />
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [followState, setFollowState] = useState<Record<string, boolean>>(
    Object.fromEntries(PEOPLE.map((p) => [p.id, p.isFollowing]))
  );

  const topPad = Platform.OS === "web" ? 52 : insets.top;

  function toggleFollow(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFollowState((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const filteredPeople = PEOPLE.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    (p.role ?? "").toLowerCase().includes(query.toLowerCase()) ||
    p.desc.toLowerCase().includes(query.toLowerCase())
  );

  const filteredShorts = SHORTS.filter((s) =>
    s.desc.toLowerCase().includes(query.toLowerCase()) ||
    s.creator.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTopics = TOPICS.filter((t) =>
    t.label.toLowerCase().includes(query.toLowerCase())
  );

  const hasQuery = query.trim().length > 0;

  // Decide what to show
  const showPeople = activeTab === "All" || activeTab === "People";
  const showShorts = activeTab === "All" || activeTab === "Shorts";
  const showTopics = activeTab === "All" || activeTab === "Topics";

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      {/* Header */}
      <View style={[s.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Feather name="chevron-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={s.searchBar}>
          <Ionicons name="search-outline" size={17} color="#636366" />
          <TextInput
            ref={inputRef}
            style={s.searchInput}
            placeholder="Search people, shorts, topics..."
            placeholderTextColor="#636366"
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={17} color="#636366" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.tabsRow}
        contentContainerStyle={s.tabsContent}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[s.tab, activeTab === tab && s.tabActive]}
            onPress={() => { Haptics.selectionAsync(); setActiveTab(tab); }}
          >
            <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 120 : insets.bottom + 80 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Empty state when no query and "All" tab */}
        {!hasQuery && activeTab === "All" && (
          <View style={s.discoverSection}>
            <Text style={s.sectionTitle}>Trending Topics</Text>
            {TOPICS.map((t) => <TopicRow key={t.id} item={t} />)}
          </View>
        )}

        {/* People */}
        {showPeople && (filteredPeople.length > 0 || hasQuery) && (
          <View style={s.section}>
            {activeTab === "All" && <Text style={s.sectionTitle}>People</Text>}
            {filteredPeople.length === 0 ? (
              <View style={s.emptyInline}>
                <Text style={s.emptyInlineText}>No people match "{query}"</Text>
              </View>
            ) : (
              filteredPeople.map((item) => (
                <PersonRow
                  key={item.id}
                  item={item}
                  following={followState[item.id]}
                  onFollow={() => toggleFollow(item.id)}
                />
              ))
            )}
          </View>
        )}

        {/* Shorts */}
        {showShorts && (filteredShorts.length > 0 || (hasQuery && activeTab === "Shorts")) && (
          <View style={s.section}>
            {activeTab === "All" && <Text style={s.sectionTitle}>Shorts</Text>}
            {filteredShorts.length === 0 ? (
              <View style={s.emptyInline}>
                <Text style={s.emptyInlineText}>No shorts match "{query}"</Text>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.shortsRow}
              >
                {filteredShorts.map((item) => <ShortCard key={item.id} item={item} />)}
              </ScrollView>
            )}
          </View>
        )}

        {/* Topics */}
        {showTopics && (hasQuery || activeTab === "Topics") && (
          <View style={s.section}>
            {activeTab === "All" && hasQuery && <Text style={s.sectionTitle}>Topics</Text>}
            {filteredTopics.length === 0 ? (
              <View style={s.emptyInline}>
                <Text style={s.emptyInlineText}>No topics match "{query}"</Text>
              </View>
            ) : (
              filteredTopics.map((t) => <TopicRow key={t.id} item={t} />)
            )}
          </View>
        )}

        {/* Global empty state */}
        {hasQuery && filteredPeople.length === 0 && filteredShorts.length === 0 && filteredTopics.length === 0 && (
          <View style={s.emptyState}>
            <Ionicons name="search-outline" size={48} color="#3C3C3E" />
            <Text style={s.emptyTitle}>No results</Text>
            <Text style={s.emptySubtitle}>Try different keywords or check the spelling</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2C2C2E",
  },
  backBtn: { padding: 4 },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: { flex: 1, color: "#FFF", fontSize: 15, paddingVertical: 10 },

  tabsRow: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#2C2C2E" },
  tabsContent: { paddingHorizontal: 14, gap: 8, paddingVertical: 10 },
  tab: {
    paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#1C1C1E",
    borderWidth: StyleSheet.hairlineWidth, borderColor: "#2C2C2E",
  },
  tabActive: { backgroundColor: "#4A6741", borderColor: "#6B7B5A" },
  tabText: { color: "#8E8E93", fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: "#FFF", fontWeight: "700" },

  discoverSection: { paddingTop: 16 },
  section: { paddingTop: 16 },
  sectionTitle: {
    color: "#8E8E93", fontSize: 12, fontWeight: "700",
    paddingHorizontal: 16, marginBottom: 8, letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  // Person
  personRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  personInfo: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3 },
  personName: { color: "#FFF", fontSize: 15, fontWeight: "600" },
  roleBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  roleText: { fontSize: 10, fontWeight: "600" },
  personDesc: { color: "#636366", fontSize: 12 },
  followBtn: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    backgroundColor: "#1C1C1E", borderWidth: StyleSheet.hairlineWidth, borderColor: "#3C3C3E",
    minWidth: 88, alignItems: "center",
  },
  followingBtn: { backgroundColor: "#4A6741", borderColor: "#4A6741" },
  followBtnText: { color: "#AEAEB2", fontSize: 13, fontWeight: "600" },
  followingBtnText: { color: "#FFF" },

  // Shorts
  shortsRow: { paddingHorizontal: 16, gap: 12, paddingBottom: 4 },
  shortCard: {
    width: 160, borderRadius: 14,
    padding: 14,
    justifyContent: "space-between",
    minHeight: 160,
    borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(255,255,255,0.06)",
  },
  shortAccent: { fontSize: 13, fontWeight: "600", lineHeight: 18, flex: 1 },
  shortMeta: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 10, flexWrap: "nowrap" },
  shortCreator: { color: "rgba(255,255,255,0.6)", fontSize: 11, flex: 1 },
  shortLikes: { color: "rgba(255,255,255,0.6)", fontSize: 11 },

  // Topics
  topicRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 14 },
  topicIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: "#1C1C1E", alignItems: "center", justifyContent: "center",
  },
  topicLabel: { color: "#FFF", fontSize: 15, fontWeight: "600", marginBottom: 2 },
  topicCount: { color: "#636366", fontSize: 12 },

  // Empty
  emptyInline: { paddingHorizontal: 16, paddingVertical: 12 },
  emptyInlineText: { color: "#636366", fontSize: 14 },
  emptyState: { alignItems: "center", paddingTop: 80, gap: 10 },
  emptyTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  emptySubtitle: { color: "#636366", fontSize: 14, textAlign: "center", paddingHorizontal: 40 },
});
