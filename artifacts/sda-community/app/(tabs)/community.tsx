import React, { useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  Share,
  TextInput,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useVideoPosts } from "@/hooks/useVideoPosts";

interface Post {
  id: string;
  author: string;
  username: string;
  role?: string;
  roleColor?: string;
  timeAgo: string;
  content: string;
  flair?: string;
  flairColor?: string;
  mediaType?: "video";
  upvotes: number;
  comments: number;
  userVote: number;
  saved: boolean;
}

type FeedItem =
  | { type: "post"; data: Post }
  | { type: "suggested_communities" }
  | { type: "verse_of_day" };

const POSTS: Post[] = [
  {
    id: "1",
    author: "Pastor James Osei",
    username: "u/Pastor_James_Osei",
    role: "Pastor",
    roleColor: "#6B7B5A",
    timeAgo: "5h ago",
    content:
      "Sabbath Service this week will be held at our main sanctuary at 9:30 AM. We'll be celebrating our 25th church anniversary with a special programme and felt...",
    flair: "Announcement",
    flairColor: "#3B5BDB",
    upvotes: 78,
    comments: 14,
    userVote: 0,
    saved: false,
  },
  {
    id: "2",
    author: "David Mensah",
    username: "u/David_Mensah",
    timeAgo: "5h ago",
    content:
      "Please pray for my mother who is going in for surgery tomorrow morning. We trust in the Lord's healing hand...",
    flair: "Prayer",
    flairColor: "#6B4F9B",
    upvotes: 45,
    comments: 8,
    userVote: 1,
    saved: true,
  },
  {
    id: "3",
    author: "Elder Ruth Nakamura",
    username: "u/Elder_Ruth",
    role: "Elder",
    roleColor: "#B8860B",
    timeAgo: "7h ago",
    content:
      "Today's devotional: 'Be still and know that I am God' (Psalm 46:10). In the busyness of our daily lives, let us remember to pause and commune with our Father.",
    flair: "Devotional",
    flairColor: "#0E7B5B",
    upvotes: 134,
    comments: 22,
    userVote: 1,
    saved: false,
  },
  {
    id: "4",
    author: "Grace Adetokunbo",
    username: "u/Grace_Adetokunbo",
    timeAgo: "9h ago",
    content:
      "Our children's ministry is looking for Sabbath School teachers! If you have a heart for kids and a passion for God's word, please reach out to the education committee.",
    flair: "Announcement",
    flairColor: "#3B5BDB",
    upvotes: 56,
    comments: 11,
    userVote: 0,
    saved: false,
  },
  {
    id: "5",
    author: "Samuel Boateng",
    username: "u/Samuel_Boateng",
    timeAgo: "12h ago",
    content:
      "Sharing this beautiful verse that has been guiding me this week: \"I can do all things through Christ who strengthens me\" – Philippians 4:13. Stay strong, family!",
    flair: "Prayer",
    flairColor: "#6B4F9B",
    upvotes: 210,
    comments: 31,
    userVote: 0,
    saved: false,
  },
];

const SORT_OPTIONS = ["Hot", "New", "Top", "Rising"];

// Verse of the Day
const VERSE_OF_THE_DAY = {
  ref: "Psalm 46:10",
  text: "Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth!",
  date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
};

const SUGGESTED_PEOPLE = [
  { id: "sp1", name: "Pastor James Osei", role: "Pastor", color: "#3B5BDB", verified: true },
  { id: "sp2", name: "Elder Ruth Nakamura", role: "Elder", color: "#B8860B", verified: true },
  { id: "sp3", name: "Abigail Owusu", role: "Member", color: "#8B3A8B", verified: false },
  { id: "sp4", name: "Emmanuel Darko", role: "Deacon", color: "#C85200", verified: false },
  { id: "sp5", name: "Naomi Asante", role: "Youth Leader", color: "#0E7B5B", verified: false },
];

const SUGGESTED_COMMUNITIES = [
  { id: "sc1", name: "SDA Youth Network", members: "3.2K", color: "#3B5BDB", icon: "people-outline" },
  { id: "sc2", name: "Prayer Warriors", members: "1.8K", color: "#6B4F9B", icon: "hand-right-outline" },
  { id: "sc3", name: "SDA Music Ministry", members: "940", color: "#8B3A8B", icon: "musical-notes-outline" },
  { id: "sc4", name: "Sabbath School Teachers", members: "620", color: "#B8860B", icon: "book-outline" },
  { id: "sc5", name: "Health & Wellness", members: "1.1K", color: "#0E7B5B", icon: "leaf-outline" },
];

function AvatarCircle({ name, color = "#4A6741", size = 32 }: { name: string; color?: string; size?: number }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

function VoteCluster({ post, onVote }: { post: Post; onVote: (id: string, vote: number) => void }) {
  const score = post.upvotes + post.userVote;
  return (
    <View style={styles.voteCluster}>
      <TouchableOpacity onPress={() => { Haptics.selectionAsync(); onVote(post.id, post.userVote === 1 ? 0 : 1); }}>
        <Ionicons
          name={post.userVote === 1 ? "arrow-up" : "arrow-up-outline"}
          size={20}
          color={post.userVote === 1 ? "#FF6314" : "#636366"}
        />
      </TouchableOpacity>
      <Text style={[styles.voteCount, post.userVote !== 0 && { color: post.userVote === 1 ? "#FF6314" : "#6B8FFF" }]}>
        {score}
      </Text>
      <TouchableOpacity onPress={() => { Haptics.selectionAsync(); onVote(post.id, post.userVote === -1 ? 0 : -1); }}>
        <Ionicons
          name={post.userVote === -1 ? "arrow-down" : "arrow-down-outline"}
          size={20}
          color={post.userVote === -1 ? "#6B8FFF" : "#636366"}
        />
      </TouchableOpacity>
    </View>
  );
}

function PostCard({ post, onVote, onSave }: { post: Post; onVote: (id: string, v: number) => void; onSave: (id: string) => void }) {
  const avatarColors = ["#4A6741", "#3B5BDB", "#B8860B", "#0E7B5B", "#8B3A8B"];
  const color = avatarColors[parseInt(post.id) % avatarColors.length];

  function handleShare() {
    Haptics.selectionAsync();
    Share.share({ message: `${post.author} on r/SDAcommunity:\n\n"${post.content}"` });
  }

  return (
    <TouchableOpacity style={styles.postCard} activeOpacity={0.85} onPress={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })}>
      <VoteCluster post={post} onVote={onVote} />
      <View style={styles.postContent}>
        <View style={styles.postMeta}>
          <AvatarCircle name={post.author} color={color} size={26} />
          <Text style={styles.username}>{post.username}</Text>
          <Text style={styles.timeAgo}>{post.timeAgo}</Text>
        </View>
        <Text style={styles.postText} numberOfLines={3}>{post.content}</Text>
        {post.mediaType === "video" && (
          <View style={styles.videoCardPreview}>
            <Ionicons name="play-circle" size={26} color="#FFF" />
            <Text style={styles.videoCardText}>Video post</Text>
          </View>
        )}
        {post.flair && (
          <View style={[styles.flairPill, { backgroundColor: post.flairColor + "22", borderColor: post.flairColor + "55" }]}>
            <Text style={[styles.flairText, { color: post.flairColor }]}>{post.flair}</Text>
          </View>
        )}
        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })}
          >
            <Ionicons name="chatbubble-outline" size={16} color="#636366" />
            <Text style={styles.actionText}>{post.comments}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
            <Feather name="share-2" size={16} color="#636366" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => { Haptics.selectionAsync(); onSave(post.id); }}>
            <Ionicons
              name={post.saved ? "bookmark" : "bookmark-outline"}
              size={16}
              color={post.saved ? "#6B7B5A" : "#636366"}
            />
            <Text style={styles.actionText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function VerseOfDayCard() {
  return (
    <View style={styles.verseCard}>
      <View style={styles.verseCertification}>
        <Ionicons name="book-outline" size={18} color="#3B5BDB" />
        <Text style={styles.verseLabel}>VERSE OF THE DAY</Text>
        <Text style={styles.verseDate}>{VERSE_OF_THE_DAY.date}</Text>
      </View>
      <Text style={styles.verseReference}>{VERSE_OF_THE_DAY.ref}</Text>
      <Text style={styles.verseText}>\"{VERSE_OF_THE_DAY.text}\"</Text>
      <TouchableOpacity style={styles.verseShareBtn} onPress={() => {
        Haptics.selectionAsync();
        Share.share({ message: `Verse of the Day: ${VERSE_OF_THE_DAY.ref}\\n\\n\"${VERSE_OF_THE_DAY.text}\"` });
      }}>
        <Ionicons name="share-social-outline" size={18} color="#3B5BDB" />
        <Text style={styles.verseShareText}>Share Verse</Text>
      </TouchableOpacity>
    </View>
  );
}

function SuggestedCommunitiesCard() {
  const [joinedSet, setJoinedSet] = useState<Set<string>>(new Set());
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <View style={styles.inlineCard}>
      <View style={styles.inlineCardHeader}>
        <View style={styles.inlineCardLeft}>
          <Ionicons name="grid-outline" size={15} color="#6B7B5A" />
          <Text style={styles.inlineCardTitle}>Suggested Communities</Text>
        </View>
        <TouchableOpacity onPress={() => setDismissed(true)}>
          <Ionicons name="close" size={17} color="#636366" />
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.inlineCardScroll}>
        {SUGGESTED_COMMUNITIES.map((comm) => {
          const isJoined = joinedSet.has(comm.id);
          return (
            <TouchableOpacity key={comm.id} style={styles.commCard} onPress={() => { Haptics.selectionAsync(); router.push({ pathname: "/community-detail", params: { id: comm.id } }); }}>
              <View style={[styles.commIcon, { backgroundColor: comm.color + "22" }]}>
                <Ionicons name={comm.icon as any} size={22} color={comm.color} />
              </View>
              <Text style={styles.commName} numberOfLines={2}>{comm.name}</Text>
              <Text style={styles.commMembers}>{comm.members} members</Text>
              <TouchableOpacity
                style={[styles.joinSmallBtn, { borderColor: isJoined ? "#2C2C2E" : comm.color, backgroundColor: isJoined ? "#2C2C2E" : "transparent" }]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setJoinedSet((prev) => {
                    const next = new Set(prev);
                    if (next.has(comm.id)) next.delete(comm.id); else next.add(comm.id);
                    return next;
                  });
                }}
              >
                <Text style={[styles.joinSmallText, { color: isJoined ? "#8E8E93" : comm.color }]}>
                  {isJoined ? "Joined" : "Join"}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState<Post[]>(POSTS);
  const [activeSort, setActiveSort] = useState("Hot");
  const [joined, setJoined] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const { videoPosts } = useVideoPosts();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  // Decide once on mount where to inject suggested cards
  const suggestConfig = useRef({
    commPos: Math.floor(Math.random() * 2) + 2,  // after post 2 or 3
  });

  function handleVote(id: string, vote: number) {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, userVote: vote } : p)));
  }

  function handleSave(id: string) {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, saved: !p.saved } : p)));
  }

  function handleJoin() {
    Haptics.selectionAsync();
    setJoined((v) => !v);
  }

  const communityVideoPosts: Post[] = useMemo(
    () =>
      videoPosts
        .filter((vp) => vp.audience === "community" || vp.audience === "everyone")
        .map((vp) => ({
          id: `vp-${vp.id}`,
          author: vp.creator,
          username: `u/${vp.creator.replace(/\s+/g, "_")}`,
          role: vp.creatorRole,
          roleColor: "#6B7B5A",
          timeAgo: "now",
          content: vp.caption,
          flair: vp.audience === "community" ? "Community Video" : "Video",
          flairColor: vp.audience === "community" ? "#0E7B5B" : "#3B5BDB",
          mediaType: "video",
          upvotes: 0,
          comments: 0,
          userVote: 0,
          saved: false,
        })),
    [videoPosts]
  );

  const mergedPosts = useMemo(() => [...communityVideoPosts, ...posts], [communityVideoPosts, posts]);

  const sortedPosts = [...mergedPosts].sort((a, b) => {
    if (activeSort === "Top") return (b.upvotes + b.userVote) - (a.upvotes + a.userVote);
    return 0;
  });

  const filteredPosts = searchText
    ? sortedPosts.filter((p) => p.content.toLowerCase().includes(searchText.toLowerCase()) || p.author.toLowerCase().includes(searchText.toLowerCase()))
    : sortedPosts;

  // Build mixed feed with suggested communities injected at a random position
  const feedItems = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = filteredPosts.map((p) => ({ type: "post", data: p }));
    const pos = Math.min(suggestConfig.current.commPos, items.length);
    items.splice(pos, 0, { type: "suggested_communities" });
    return items;
  }, [filteredPosts]);

  const header = (
    <View>
      <View style={[styles.topBar, { paddingTop: topPad }]}>
        <Text style={styles.subredditLabel}>r/SDAcommunity</Text>
        <View style={styles.topBarActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => { Haptics.selectionAsync(); setSearchVisible((v) => !v); }}>
            <Ionicons name={searchVisible ? "close" : "search"} size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push("/activity")}>
            <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {searchVisible && (
        <View style={styles.searchWrapper}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={16} color="#636366" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search posts, people, flairs..."
              placeholderTextColor="#636366"
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText("")}>
                <Ionicons name="close-circle" size={16} color="#636366" />
              </TouchableOpacity>
            )}
          </View>
          {searchText.length > 0 && (
            <View style={styles.searchSuggestions}>
              {/* People suggestions */}
              {SUGGESTED_PEOPLE.filter((p) =>
                p.name.toLowerCase().includes(searchText.toLowerCase())
              ).map((person) => {
                const initials = person.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <TouchableOpacity
                    key={person.id}
                    style={styles.searchSugRow}
                    onPress={() => { setSearchText(""); setSearchVisible(false); router.push({ pathname: "/user-profile", params: { name: person.name } }); }}
                  >
                    <View style={[styles.searchSugAvatar, { backgroundColor: person.color }]}>
                      <Text style={styles.searchSugAvatarText}>{initials}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.searchSugName}>{person.name}</Text>
                      <Text style={styles.searchSugMeta}>{person.role} · Member</Text>
                    </View>
                    {person.verified && <Ionicons name="checkmark-circle" size={14} color="#0E7B5B" />}
                    <Ionicons name="person-outline" size={14} color="#636366" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                );
              })}
              {/* Flair / tag suggestions */}
              {["Announcement", "Prayer", "Devotional"].filter((f) =>
                f.toLowerCase().includes(searchText.toLowerCase())
              ).map((flair) => (
                <TouchableOpacity
                  key={flair}
                  style={styles.searchSugRow}
                  onPress={() => setSearchText(flair)}
                >
                  <View style={styles.searchSugTagIcon}>
                    <Ionicons name="pricetag-outline" size={14} color="#6B7B5A" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.searchSugName}>{flair}</Text>
                    <Text style={styles.searchSugMeta}>Post flair</Text>
                  </View>
                </TouchableOpacity>
              ))}
              {SUGGESTED_PEOPLE.filter((p) => p.name.toLowerCase().includes(searchText.toLowerCase())).length === 0 &&
               !["Announcement", "Prayer", "Devotional"].some((f) => f.toLowerCase().includes(searchText.toLowerCase())) && (
                <View style={styles.searchSugEmpty}>
                  <Text style={styles.searchSugEmptyText}>Search posts for "{searchText}"</Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      <View style={styles.bannerContainer}>
        <Image
          source={require("@/assets/images/banner.png")}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <View style={styles.bannerOverlay} />
        <View style={styles.communityInfo}>
          <View style={styles.communityAvatar}>
            <Ionicons name="star" size={26} color="#FFFFFF" />
          </View>
          <View style={styles.communityDetails}>
            <Text style={styles.communityName}>SDA Community</Text>
            <Text style={styles.communityHandle}>#SeventhDayAdventist</Text>
          </View>
          <TouchableOpacity style={[styles.joinButton, joined && styles.joinButtonActive]} onPress={handleJoin}>
            <Ionicons name={joined ? "checkmark" : "add-circle-outline"} size={14} color="#FFFFFF" />
            <Text style={styles.joinText}>{joined ? "Joined" : "Join"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>12.4K</Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>847</Text>
          <Text style={styles.statLabel}>Online</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: "#6B7B5A" }]}>Top 5%</Text>
          <Text style={styles.statLabel}>This week</Text>
        </View>
      </View>

      <View style={styles.joinedWrap}>
        <Text style={styles.joinedTitle}>Joined Communities</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.joinedRow}>
          {["SDA Community", "Prayer Warriors", ...Array.from(new Set(videoPosts.filter((v) => v.audience === "community" && v.communityName).map((v) => v.communityName as string)))].map((name) => (
            <TouchableOpacity
              key={name}
              style={styles.joinedChip}
              onPress={() => router.push({ pathname: "/community-detail", params: { id: name.toLowerCase().replace(/\s+/g, "-") } })}
            >
              <Ionicons name="checkmark-circle" size={14} color="#6B7B5A" />
              <Text style={styles.joinedChipText}>{name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sortBar}
        contentContainerStyle={styles.sortBarContent}
      >
        {SORT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.sortTab, activeSort === opt && styles.sortTabActive]}
            onPress={() => { Haptics.selectionAsync(); setActiveSort(opt); }}
          >
            {opt === "New" && <View style={styles.newDot} />}
            <Text style={[styles.sortText, activeSort === opt && styles.sortTextActive]}>
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: "#0A0A0A" }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <FlatList
        data={feedItems}
        keyExtractor={(item, index) => {
          if (item.type === "post") return item.data.id;
          return `${item.type}-${index}`;
        }}
        renderItem={({ item }) => {
          if (item.type === "verse_of_day") return <VerseOfDayCard />;
          if (item.type === "suggested_communities") return <SuggestedCommunitiesCard />;
          return <PostCard post={item.data} onVote={handleVote} onSave={handleSave} />;
        }}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 40 }}>
            <Ionicons name="search-outline" size={40} color="#3C3C3E" />
            <Text style={{ color: "#636366", marginTop: 12, fontSize: 15 }}>No posts found</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: "#0A0A0A",
  },
  subredditLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  topBarActions: {
    flexDirection: "row",
    gap: 4,
  },
  iconBtn: {
    padding: 8,
  },
  searchWrapper: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    paddingVertical: 10,
  },
  searchSuggestions: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    marginTop: 6,
    overflow: "hidden",
  },
  searchSugRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2C2C2E",
  },
  searchSugAvatar: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: "center", justifyContent: "center",
  },
  searchSugAvatarText: { color: "#FFF", fontSize: 12, fontWeight: "700" },
  searchSugTagIcon: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: "#6B7B5A22",
    alignItems: "center", justifyContent: "center",
  },
  searchSugName: { color: "#FFF", fontSize: 13, fontWeight: "600" },
  searchSugMeta: { color: "#636366", fontSize: 11, marginTop: 1 },
  searchSugEmpty: { paddingHorizontal: 14, paddingVertical: 12 },
  searchSugEmptyText: { color: "#636366", fontSize: 13 },
  bannerContainer: {
    height: 130,
    position: "relative",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  communityInfo: {
    position: "absolute",
    bottom: 10,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  communityAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#4A6741",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#0A0A0A",
  },
  communityDetails: {
    flex: 1,
  },
  communityName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  communityHandle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
  },
  joinButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4A6741",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 4,
  },
  joinButtonActive: {
    backgroundColor: "#2C2C2E",
  },
  joinText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111111",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2C2C2E",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  statLabel: {
    color: "#8E8E93",
    fontSize: 11,
    marginTop: 1,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 28,
    backgroundColor: "#2C2C2E",
  },
  sortBar: {
    backgroundColor: "#111111",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2C2C2E",
  },
  sortBarContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
    flexDirection: "row",
  },
  joinedWrap: { paddingHorizontal: 16, paddingTop: 12 },
  joinedTitle: { color: "#8E8E93", fontSize: 12, fontWeight: "700", marginBottom: 8 },
  joinedRow: { gap: 8 },
  joinedChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#162117",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2C4930",
  },
  joinedChipText: { color: "#B8D9BE", fontSize: 12, fontWeight: "600" },
  sortTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
    backgroundColor: "#1C1C1E",
  },
  sortTabActive: {
    backgroundColor: "#2C2C2E",
  },
  sortText: {
    color: "#8E8E93",
    fontSize: 13,
    fontWeight: "500",
  },
  sortTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  newDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#6B7B5A",
  },
  // Inline suggested cards
  inlineCard: {
    backgroundColor: "#111111",
    paddingTop: 14,
    paddingBottom: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#2C2C2E",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2C2C2E",
  },
  inlineCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  inlineCardLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  inlineCardTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  inlineCardScroll: { paddingHorizontal: 14, gap: 10 },
  personCard: {
    width: 94,
    backgroundColor: "#1C1C1E",
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
    gap: 3,
  },
  personAvatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center", marginBottom: 2,
  },
  personAvatarText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  personNameRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  personName: { color: "#FFF", fontSize: 11, fontWeight: "600", maxWidth: 58 },
  personRole: { color: "#8E8E93", fontSize: 10 },
  followBtn: {
    marginTop: 4, backgroundColor: "#4A6741",
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10,
  },
  followBtnActive: { backgroundColor: "#2C2C2E" },
  followBtnText: { color: "#FFF", fontSize: 10, fontWeight: "700" },
  followBtnTextActive: { color: "#8E8E93" },
  commCard: {
    width: 130,
    backgroundColor: "#1C1C1E",
    borderRadius: 14,
    padding: 12,
    alignItems: "flex-start",
    gap: 4,
  },
  commIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  commName: { color: "#FFF", fontSize: 12, fontWeight: "700", lineHeight: 16 },
  commMembers: { color: "#8E8E93", fontSize: 11 },
  joinSmallBtn: {
    marginTop: 4, paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: 10, borderWidth: 1,
  },
  joinSmallText: { fontSize: 11, fontWeight: "700" },
  // Post styles
  postCard: {
    flexDirection: "row",
    backgroundColor: "#111111",
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 10,
  },
  voteCluster: {
    alignItems: "center",
    gap: 4,
    width: 32,
    paddingTop: 2,
  },
  voteCount: {
    color: "#AEAEB2",
    fontSize: 12,
    fontWeight: "700",
  },
  postContent: {
    flex: 1,
    gap: 6,
  },
  postMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  avatar: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  username: {
    color: "#8E8E93",
    fontSize: 12,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
  },
  roleText: {
    fontSize: 10,
    fontWeight: "600",
  },
  timeAgo: {
    color: "#636366",
    fontSize: 11,
  },
  postText: {
    color: "#DADADB",
    fontSize: 14,
    lineHeight: 20,
  },
  flairPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  flairText: {
    fontSize: 11,
    fontWeight: "600",
  },
  postActions: {
    flexDirection: "row",
    gap: 16,
    marginTop: 4,
  },
  videoCardPreview: {
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: "#1B2436",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2A3857",
    borderRadius: 10,
    height: 110,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  videoCardText: { color: "#C9D9FF", fontSize: 12, fontWeight: "700" },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  actionText: {
    color: "#636366",
    fontSize: 12,
    fontWeight: "500",
  },
  separator: {
    height: 6,
    backgroundColor: "#0A0A0A",
  },
  verseCard: {
    marginHorizontal: 12,
    marginBottom: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 16,
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#3B5BDB",
  },
  verseCertification: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  verseLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
    letterSpacing: 0.5,
    flex: 1,
  },
  verseDate: {
    fontSize: 12,
    color: "#636366",
  },
  verseReference: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3B5BDB",
    marginBottom: 8,
  },
  verseText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#FFFFFF",
    marginBottom: 14,
    fontStyle: "italic",
  },
  verseShareBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#3B5BDB20",
    borderRadius: 8,
    gap: 8,
    alignSelf: "flex-start",
  },
  verseShareText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#3B5BDB",
  },
});
