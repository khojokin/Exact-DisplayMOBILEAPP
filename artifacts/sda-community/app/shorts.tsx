import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Platform, StatusBar, Modal, TextInput, Dimensions,
  Share, Animated, Alert, ScrollView,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useVideoPosts, VideoAudience } from "@/hooks/useVideoPosts";

const { width: SW, height: SH } = Dimensions.get("window");

interface Comment {
  id: string;
  user: string;
  userColor: string;
  text: string;
  time: string;
  likes: number;
}
interface Short {
  id: string;
  creator: string;
  creatorRole?: string;
  creatorColor: string;
  description: string;
  bg: string;
  accent: string;
  likes: number;
  commentCount: number;
  shares: number;
  audio: string;
  icon: string;
  comments: Comment[];
  audience?: VideoAudience;
}

const SHORTS: Short[] = [
  {
    id: "1",
    creator: "Pastor James Osei",
    creatorRole: "Pastor",
    creatorColor: "#3B5BDB",
    description: '"For I know the plans I have for you," declares the Lord — Jeremiah 29:11. Hold on to God\'s promises! 🙏 #SDAcommunity #Faith #BibleVerse',
    bg: "#0A1225",
    accent: "#3B5BDB",
    likes: 1240,
    commentCount: 89,
    shares: 234,
    audio: "Original Audio · Pastor James Osei",
    icon: "book-outline",
    comments: [
      { id: "c1", user: "Elder Ruth Nakamura", userColor: "#B8860B", text: "Powerful word, Pastor! Amen 🙏", time: "2h", likes: 24 },
      { id: "c2", user: "Grace Adetokunbo", userColor: "#0E7B5B", text: "This is exactly what I needed today. God bless you!", time: "1h", likes: 18 },
      { id: "c3", user: "David Mensah", userColor: "#C85200", text: "Playing this on repeat 🔥", time: "45m", likes: 12 },
      { id: "c4", user: "Samuel Boateng", userColor: "#8B5E00", text: "The Lord is good all the time!", time: "30m", likes: 8 },
      { id: "c5", user: "Abigail Owusu", userColor: "#8B3A8B", text: "Sharing this with my whole family!", time: "10m", likes: 5 },
    ],
  },
  {
    id: "2",
    creator: "David Mensah",
    creatorRole: "Worship Leader",
    creatorColor: "#C85200",
    description: '"Holy, Holy, Holy" — our choir rehearsal preview for this Sabbath. Come worship with us at 9:30 AM 🎶 #SDAhymns #Worship #Sabbath',
    bg: "#1A0A00",
    accent: "#C85200",
    likes: 876,
    commentCount: 54,
    shares: 130,
    audio: "Holy, Holy, Holy · SDA Community Choir",
    icon: "musical-notes-outline",
    comments: [
      { id: "c1", user: "Pastor James Osei", userColor: "#3B5BDB", text: "The Lord inhabits our praises! 🙌", time: "3h", likes: 56 },
      { id: "c2", user: "Grace Adetokunbo", userColor: "#0E7B5B", text: "I can't wait for Sabbath! This is beautiful.", time: "2h", likes: 31 },
      { id: "c3", user: "Elder Ruth Nakamura", userColor: "#B8860B", text: "Praise God from whom all blessings flow!", time: "1h", likes: 27 },
    ],
  },
  {
    id: "3",
    creator: "Grace Adetokunbo",
    creatorRole: "Pathfinder Leader",
    creatorColor: "#0E7B5B",
    description: "My testimony: God restored my health when doctors gave up. If you're going through something, don't lose faith! 💚 #Testimony #GodIsGood #Healing",
    bg: "#001A0A",
    accent: "#0E7B5B",
    likes: 2100,
    commentCount: 210,
    shares: 890,
    audio: "Original Audio · Grace Adetokunbo",
    icon: "heart-outline",
    comments: [
      { id: "c1", user: "Pastor James Osei", userColor: "#3B5BDB", text: "What a testimony! God is faithful 🙏", time: "5h", likes: 145 },
      { id: "c2", user: "Elder Ruth Nakamura", userColor: "#B8860B", text: "This brought tears to my eyes. Thank you for sharing!", time: "4h", likes: 98 },
      { id: "c3", user: "Samuel Boateng", userColor: "#8B5E00", text: "God is still in the healing business!", time: "3h", likes: 67 },
    ],
  },
  {
    id: "4",
    creator: "Elder Ruth Nakamura",
    creatorRole: "Elder",
    creatorColor: "#B8860B",
    description: 'Morning devotional: "Be still and know that I am God" — Psalm 46:10. Take 60 seconds to be still before Him today ☀️ #Devotional #Prayer #BeStill',
    bg: "#1A1000",
    accent: "#B8860B",
    likes: 654,
    commentCount: 41,
    shares: 189,
    audio: "Original Audio · Elder Ruth Nakamura",
    icon: "sunny-outline",
    comments: [
      { id: "c1", user: "Grace Adetokunbo", userColor: "#0E7B5B", text: "Starting every morning with this verse. Thank you Elder!", time: "6h", likes: 32 },
      { id: "c2", user: "David Mensah", userColor: "#C85200", text: "Exactly what my soul needed this morning 🙏", time: "4h", likes: 18 },
    ],
  },
  {
    id: "5",
    creator: "Samuel Boateng",
    creatorColor: "#8B5E00",
    description: "Pathfinders outdoor Bible challenge this Saturday! Kids learning scripture through fun activities. Come join us! 🏕️📖 #SDAYouth #Pathfinders #FaithAndFun",
    bg: "#140A00",
    accent: "#8B5E00",
    likes: 432,
    commentCount: 28,
    shares: 78,
    audio: "Praise Music · SDA Youth Band",
    icon: "people-outline",
    comments: [
      { id: "c1", user: "Pastor James Osei", userColor: "#3B5BDB", text: "So proud of our youth ministry! 🙌", time: "2h", likes: 22 },
      { id: "c2", user: "Grace Adetokunbo", userColor: "#0E7B5B", text: "My kids are already excited for Saturday!", time: "1h", likes: 15 },
    ],
  },
];

function fmtCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function SpinningDisc({ accent }: { accent: string }) {
  const spin = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 3000, useNativeDriver: false })
    ).start();
  }, []);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  return (
    <Animated.View style={[styles.audioDisk, { transform: [{ rotate }] }]}>
      <View style={[styles.audioDiskInner, { backgroundColor: accent + "40" }]}>
        <Ionicons name="musical-note" size={14} color="#FFF" />
      </View>
    </Animated.View>
  );
}

// ─── Upload Modal ─────────────────────────────────────────────────────────────
function UploadModal({
  visible,
  onClose,
  insets,
  onPublish,
}: {
  visible: boolean;
  onClose: () => void;
  insets: ReturnType<typeof useSafeAreaInsets>;
  onPublish: (caption: string, audience: VideoAudience) => Promise<void>;
}) {
  const [caption, setCaption] = useState("");
  const [selectedSource, setSelectedSource] = useState<"camera" | "library" | null>(null);
  const [posting, setPosting] = useState(false);
  const [audience, setAudience] = useState<VideoAudience>("everyone");

  async function handlePost() {
    if (!selectedSource) {
      Alert.alert("Select a source", "Please choose to record a video or pick from your library.");
      return;
    }
    setPosting(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    await onPublish(caption.trim() || "New suggested video", audience);
    setPosting(false);
    setCaption("");
    setSelectedSource(null);
    setAudience("everyone");
    onClose();
    Alert.alert("Posted!", "Your video has been shared with the community.");
  }

  function handleGoLive() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleClose();
    router.push("/meeting");
  }

  function handleClose() {
    setCaption("");
    setSelectedSource(null);
    setAudience("everyone");
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <View style={[up.container, { paddingTop: Platform.OS === "web" ? 24 : insets.top + 8 }]}>
        {/* Header */}
        <View style={up.header}>
          <TouchableOpacity onPress={handleClose} style={up.headerBtn}>
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={up.headerTitle}>New Video</Text>
          <TouchableOpacity
            style={[up.postBtn, (!selectedSource || posting) && up.postBtnDisabled]}
            onPress={handlePost}
            disabled={!selectedSource || posting}
          >
            <Text style={up.postBtnText}>{posting ? "Posting…" : "Post"}</Text>
          </TouchableOpacity>
        </View>

        {/* Preview area */}
        <View style={up.previewArea}>
          {selectedSource ? (
            <View style={up.previewSelected}>
              <Ionicons
                name={selectedSource === "camera" ? "videocam" : "images"}
                size={56}
                color="#6B7B5A"
              />
              <Text style={up.previewSelectedText}>
                {selectedSource === "camera" ? "Video recorded" : "Video selected"}
              </Text>
              <TouchableOpacity onPress={() => setSelectedSource(null)} style={up.changeBtn}>
                <Text style={up.changeBtnText}>Change</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={up.previewEmpty}>
              <Ionicons name="videocam-outline" size={52} color="#3C3C3E" />
              <Text style={up.previewEmptyTitle}>Add a video</Text>
              <Text style={up.previewEmptyText}>Record or upload a suggested video to share with the community</Text>
            </View>
          )}
        </View>

        {/* Source buttons */}
        <View style={up.sourceRow}>
          <TouchableOpacity
            style={[up.sourceBtn, selectedSource === "camera" && up.sourceBtnActive]}
            onPress={() => setSelectedSource("camera")}
          >
            <View style={[up.sourceIcon, selectedSource === "camera" && up.sourceIconActive]}>
              <Ionicons name="videocam" size={26} color={selectedSource === "camera" ? "#FFF" : "#8E8E93"} />
            </View>
            <Text style={[up.sourceLabel, selectedSource === "camera" && up.sourceLabelActive]}>
              Record
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[up.sourceBtn, selectedSource === "library" && up.sourceBtnActive]}
            onPress={() => setSelectedSource("library")}
          >
            <View style={[up.sourceIcon, selectedSource === "library" && up.sourceIconActive]}>
              <Ionicons name="images" size={26} color={selectedSource === "library" ? "#FFF" : "#8E8E93"} />
            </View>
            <Text style={[up.sourceLabel, selectedSource === "library" && up.sourceLabelActive]}>
              Upload
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={up.sourceBtn} onPress={handleGoLive}>
            <View style={up.sourceIcon}>
              <Ionicons name="radio" size={26} color="#FF453A" />
            </View>
            <Text style={up.sourceLabel}>Go Live</Text>
          </TouchableOpacity>
        </View>

        {/* Caption */}
        <View style={up.captionSection}>
          <Text style={up.captionLabel}>Caption</Text>
          <TextInput
            style={up.captionInput}
            placeholder="Share what this is about… #SDAcommunity"
            placeholderTextColor="#48484A"
            multiline
            maxLength={300}
            value={caption}
            onChangeText={setCaption}
          />
          <Text style={up.charCount}>{caption.length}/300</Text>
        </View>

        {/* Options */}
        <View style={up.optionsSection}>
          <View style={up.optionRow}>
            <Ionicons name="people-outline" size={20} color="#8E8E93" />
            <Text style={up.optionLabel}>Audience</Text>
          </View>
          <View style={up.audienceRow}>
            {([
              { id: "everyone", label: "Everyone" },
              { id: "followers", label: "Followers only" },
              { id: "community", label: "My Community" },
            ] as const).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[up.audiencePill, audience === item.id && up.audiencePillActive]}
                onPress={() => setAudience(item.id)}
              >
                <Text style={[up.audienceText, audience === item.id && up.audienceTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: insets.bottom + 20 }} />
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ShortsScreen() {
  const insets = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = 50;
  const bottomNavPad = Platform.OS === "web" ? 34 : insets.bottom;
  const bottomNavHeight = TAB_BAR_HEIGHT + bottomNavPad;
  const bottomOverlayOffset = bottomNavHeight;
  const [liked, setLiked] = useState<Record<string, number>>({});
  const [followed, setFollowed] = useState<Set<string>>(new Set());
  const [unfollowedDefaults, setUnfollowedDefaults] = useState<Set<string>>(new Set());
  const [showComments, setShowComments] = useState(false);
  const [activeShort, setActiveShort] = useState<Short | null>(null);
  const [playing, setPlaying] = useState<Record<string, boolean>>({});
  const [commentText, setCommentText] = useState("");
  const [extraComments, setExtraComments] = useState<Record<string, Comment[]>>({});
  const [activeTab, setActiveTab] = useState<"following" | "foryou">("foryou");
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { videoPosts } = useVideoPosts();
  const flatRef = useRef<FlatList>(null);
  const defaultFollowing = useMemo(() => new Set<string>(["Pastor James Osei", "Grace Adetokunbo"]), []);

  function toggleLike(id: string, baseLikes: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLiked((prev) => {
      const current = prev[id];
      if (current === undefined) return { ...prev, [id]: baseLikes + 1 };
      return { ...prev, [id]: current === baseLikes + 1 ? baseLikes : baseLikes + 1 };
    });
  }

  function isLiked(id: string, baseLikes: number) {
    return liked[id] !== undefined && liked[id] > baseLikes;
  }

  function getLikes(id: string, baseLikes: number) {
    return liked[id] !== undefined ? liked[id] : baseLikes;
  }

  function isCreatorFollowing(creator: string) {
    if (followed.has(creator)) return true;
    if (unfollowedDefaults.has(creator)) return false;
    return defaultFollowing.has(creator);
  }

  function toggleFollow(creator: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const currentlyFollowing = isCreatorFollowing(creator);
    if (defaultFollowing.has(creator)) {
      setUnfollowedDefaults((prev) => {
        const next = new Set(prev);
        if (currentlyFollowing) next.add(creator);
        else next.delete(creator);
        return next;
      });
      return;
    }

    setFollowed((prev) => {
      const next = new Set(prev);
      if (currentlyFollowing) next.delete(creator);
      else next.add(creator);
      return next;
    });
  }

  const uploadedShorts = useMemo<Short[]>(
    () =>
      videoPosts.map((vp) => ({
        id: `up-${vp.id}`,
        creator: vp.creator,
        creatorRole: vp.creatorRole,
        creatorColor: vp.creatorColor,
        description: vp.caption,
        bg: "#111A2E",
        accent: "#3B5BDB",
        likes: 0,
        commentCount: 0,
        shares: 0,
        audio: "Original Audio · SDA Community",
        icon: "play-outline",
        comments: [],
        audience: vp.audience,
      })),
    [videoPosts]
  );

  const combinedShorts = useMemo<Short[]>(() => [...uploadedShorts, ...SHORTS], [uploadedShorts]);

  const filteredShorts = useMemo(() => combinedShorts, [combinedShorts]);

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const searchVideos = useMemo(() => {
    if (!normalizedSearch) return combinedShorts.slice(0, 6);
    return combinedShorts
      .filter(
        (short) =>
          short.description.toLowerCase().includes(normalizedSearch) ||
          short.creator.toLowerCase().includes(normalizedSearch)
      )
      .slice(0, 10);
  }, [combinedShorts, normalizedSearch]);

  const searchCreators = useMemo(() => {
    const creatorMap = new Map<string, { name: string; color: string; count: number }>();
    combinedShorts.forEach((short) => {
      const current = creatorMap.get(short.creator);
      if (current) {
        creatorMap.set(short.creator, { ...current, count: current.count + 1 });
      } else {
        creatorMap.set(short.creator, { name: short.creator, color: short.creatorColor, count: 1 });
      }
    });
    return Array.from(creatorMap.values())
      .filter((creator) => !normalizedSearch || creator.name.toLowerCase().includes(normalizedSearch))
      .slice(0, 8);
  }, [combinedShorts, normalizedSearch]);

  const searchSounds = useMemo(() => {
    const soundMap = new Map<string, number>();
    combinedShorts.forEach((short) => {
      soundMap.set(short.audio, (soundMap.get(short.audio) ?? 0) + 1);
    });
    return Array.from(soundMap.entries())
      .map(([name, count]) => ({ name, count }))
      .filter((sound) => !normalizedSearch || sound.name.toLowerCase().includes(normalizedSearch))
      .slice(0, 8);
  }, [combinedShorts, normalizedSearch]);

  const searchHashtags = useMemo(() => {
    const hashtagMap = new Map<string, number>();
    combinedShorts.forEach((short) => {
      const tags = short.description.match(/#[a-z0-9_]+/gi) ?? [];
      tags.forEach((tag) => {
        const key = tag.toLowerCase();
        hashtagMap.set(key, (hashtagMap.get(key) ?? 0) + 1);
      });
    });
    return Array.from(hashtagMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .filter((entry) => !normalizedSearch || entry.tag.includes(normalizedSearch))
      .slice(0, 8);
  }, [combinedShorts, normalizedSearch]);

  function openSearchResult(shortId: string) {
    const target = combinedShorts.find((short) => short.id === shortId);
    if (!target) return;

    const targetTab = isCreatorFollowing(target.creator) ? "following" : "foryou";
    setActiveTab(targetTab);
    setShowSearch(false);

    requestAnimationFrame(() => {
      const resultList = targetTab === "following"
        ? combinedShorts.filter((short) => isCreatorFollowing(short.creator))
        : combinedShorts.filter((short) => !isCreatorFollowing(short.creator));
      const index = resultList.findIndex((short) => short.id === shortId);
      if (index >= 0) {
        flatRef.current?.scrollToIndex({ index, animated: true });
      }
    });
  }

  function openComments(short: Short) {
    Haptics.selectionAsync();
    setActiveShort(short);
    setShowComments(true);
  }

  function postComment() {
    if (!commentText.trim() || !activeShort) return;
    const newComment: Comment = {
      id: String(Date.now()),
      user: "You",
      userColor: "#4A6741",
      text: commentText.trim(),
      time: "now",
      likes: 0,
    };
    setExtraComments((prev) => ({
      ...prev,
      [activeShort.id]: [...(prev[activeShort.id] ?? []), newComment],
    }));
    setCommentText("");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function togglePlay(id: string) {
    setPlaying((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const renderShort = useCallback(({ item: short }: { item: Short }) => {
    const likedState = isLiked(short.id, short.likes);
    const isFollowing = isCreatorFollowing(short.creator);
    const isPlaying = playing[short.id] ?? false;
    const likeCount = getLikes(short.id, short.likes);
    const commentTotal = short.commentCount + (extraComments[short.id]?.length ?? 0);

    return (
      <View style={{ width: SW, height: SH, backgroundColor: "#000" }}>
        {/* Full-screen video background */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => {
            togglePlay(short.id);
          }}
        >
          <View style={[styles.videoBg, { backgroundColor: short.bg }]}>
            <Ionicons name={short.icon as any} size={200} color={short.accent + "15"} />
            {!isPlaying && (
              <View style={styles.pauseHint}>
                <Ionicons name="play" size={52} color="rgba(255,255,255,0.18)" />
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Gradient overlay — fades dark at bottom so text is always readable */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.55)", "rgba(0,0,0,0.88)"]}
          locations={[0, 0.55, 1]}
          style={styles.bottomGradient}
          pointerEvents="none"
        />

        {/* Right sidebar */}
        <View style={[styles.sidebar, { bottom: bottomOverlayOffset + 8 }]}> 
          {/* Creator avatar with follow + */}
          <View style={styles.creatorWrap}>
            <TouchableOpacity
              style={[styles.creatorAvatar, { backgroundColor: short.creatorColor }]}
              onPress={() => router.push({ pathname: "/user-profile", params: { name: short.creator } })}
            >
              <Text style={styles.creatorInitials}>{initials(short.creator)}</Text>
            </TouchableOpacity>
            {!isFollowing && (
              <TouchableOpacity style={styles.followPlus} onPress={() => toggleFollow(short.creator)}>
                <Ionicons name="add" size={12} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Like */}
          <TouchableOpacity style={styles.sideAction} onPress={() => toggleLike(short.id, short.likes)}>
            <Ionicons
              name={likedState ? "heart" : "heart-outline"}
              size={30}
              color={likedState ? "#FF3040" : "#FFF"}
            />
            <Text style={styles.sideCount}>{fmtCount(likeCount)}</Text>
          </TouchableOpacity>

          {/* Comment */}
          <TouchableOpacity style={styles.sideAction} onPress={() => openComments(short)}>
            <Ionicons name="chatbubble-ellipses" size={28} color="#FFF" />
            <Text style={styles.sideCount}>{fmtCount(commentTotal)}</Text>
          </TouchableOpacity>

          {/* Share */}
          <TouchableOpacity
            style={styles.sideAction}
            onPress={() => Share.share({ message: short.description + "\n\n— SDA Community" })}
          >
            <Feather name="send" size={26} color="#FFF" />
            <Text style={styles.sideCount}>{fmtCount(short.shares)}</Text>
          </TouchableOpacity>

          {/* Spinning audio disc */}
          <SpinningDisc accent={short.accent} />
        </View>

        {/* Bottom info over gradient */}
        <View style={[styles.bottomOverlay, { paddingBottom: bottomOverlayOffset }]}> 
          <View style={styles.creatorRow}>
            <TouchableOpacity onPress={() => router.push({ pathname: "/user-profile", params: { name: short.creator } })}>
              <Text style={styles.creatorHandle}>
                @{short.creator.split(" ").join("").toLowerCase()}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.followInlineBtn, isFollowing && styles.followInlineBtnFollowing]}
              onPress={() => toggleFollow(short.creator)}
            >
              <Text style={[styles.followInlineText, isFollowing && styles.followInlineTextFollowing]}>
                {isFollowing ? "Unfollow" : "Follow"}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.shortDesc} numberOfLines={2}>{short.description}</Text>

          <View style={styles.audioRow}>
            <Ionicons name="musical-notes" size={13} color="rgba(255,255,255,0.85)" />
            <Text style={styles.audioName} numberOfLines={1}>{short.audio}</Text>
          </View>
        </View>

      </View>
    );
  }, [liked, followed, unfollowedDefaults, playing, extraComments, bottomOverlayOffset]);

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: Platform.OS === "web" ? 52 : insets.top + 2 }]}>
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={styles.topBackBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>

        {/* Following / For you tabs — centred absolutely */}
        <View style={styles.topTabsWrap}>
          <TouchableOpacity onPress={() => setActiveTab("following")}>
            <Text style={[styles.topTab, activeTab === "following" && styles.topTabActive]}>
              Following
            </Text>
          </TouchableOpacity>
          <View style={styles.topTabDivider} />
          <TouchableOpacity onPress={() => setActiveTab("foryou")}>
            <Text style={[styles.topTab, activeTab === "foryou" && styles.topTabActive]}>
              For you
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <TouchableOpacity style={styles.topCameraBtn} onPress={() => setShowSearch(true)}>
          <Ionicons name="search-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Feed */}
      <FlatList
        ref={flatRef}
        data={filteredShorts}
        keyExtractor={(s) => s.id}
        pagingEnabled
        snapToInterval={SH}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        renderItem={renderShort}
        getItemLayout={(_, index) => ({ length: SH, offset: SH * index, index })}
      />

      <Modal visible={showSearch} animationType="slide" onRequestClose={() => setShowSearch(false)}>
        <View style={sr.container}>
          <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
          <View style={[sr.header, { paddingTop: Platform.OS === "web" ? 26 : insets.top + 8 }]}>
            <TouchableOpacity style={sr.backBtn} onPress={() => setShowSearch(false)}>
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={sr.searchInputWrap}>
              <Ionicons name="search-outline" size={16} color="#8E8E93" />
              <TextInput
                style={sr.searchInput}
                placeholder="Search videos, creators, sounds"
                placeholderTextColor="#636366"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
            </View>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
            <View style={sr.section}>
              <Text style={sr.sectionTitle}>Videos</Text>
              {searchVideos.map((item) => (
                <TouchableOpacity key={item.id} style={sr.videoRow} onPress={() => openSearchResult(item.id)}>
                  <View style={[sr.videoThumb, { backgroundColor: item.bg }]}>
                    <Ionicons name={item.icon as any} size={20} color={item.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} style={sr.videoText}>{item.description}</Text>
                    <Text style={sr.metaText}>@{item.creator.replace(/\s+/g, "").toLowerCase()}</Text>
                  </View>
                  <Text style={sr.metaText}>{fmtCount(item.likes)} likes</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={sr.section}>
              <Text style={sr.sectionTitle}>Creators</Text>
              {searchCreators.map((creator) => (
                <TouchableOpacity
                  key={creator.name}
                  style={sr.creatorRow}
                  onPress={() => {
                    const firstVideo = combinedShorts.find((short) => short.creator === creator.name);
                    if (firstVideo) openSearchResult(firstVideo.id);
                  }}
                >
                  <View style={[sr.creatorAvatar, { backgroundColor: creator.color }]}>
                    <Text style={sr.creatorAvatarText}>{initials(creator.name)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={sr.creatorName}>{creator.name}</Text>
                    <Text style={sr.metaText}>{creator.count} videos</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#636366" />
                </TouchableOpacity>
              ))}
            </View>

            <View style={sr.section}>
              <Text style={sr.sectionTitle}>Sounds</Text>
              {searchSounds.map((sound) => (
                <View key={sound.name} style={sr.soundRow}>
                  <Ionicons name="musical-notes-outline" size={16} color="#8E8E93" />
                  <Text style={sr.soundName} numberOfLines={1}>{sound.name}</Text>
                  <Text style={sr.metaText}>{sound.count}</Text>
                </View>
              ))}
            </View>

            <View style={sr.section}>
              <Text style={sr.sectionTitle}>Hashtags</Text>
              <View style={sr.hashtagWrap}>
                {searchHashtags.map((item) => (
                  <View key={item.tag} style={sr.hashtagChip}>
                    <Text style={sr.hashtagText}>{item.tag}</Text>
                    <Text style={sr.hashtagCount}>{item.count}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Bottom nav (same routes as tab app) */}
      <View
        style={[
          styles.bottomNav,
          {
            height: bottomNavHeight,
            paddingBottom: bottomNavPad,
          },
        ]}
      >
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => router.replace("/(tabs)")}>
          <Feather name="home" size={21} color="#636366" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => router.replace("/(tabs)/community")}>
          <Ionicons name="people-outline" size={23} color="#636366" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => router.replace("/(tabs)/new-post")}>
          <View style={styles.bottomNavPlusWrap}>
            <Feather name="plus" size={20} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => router.replace("/(tabs)/messages")}>
          <Feather name="send" size={21} color="#636366" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => router.replace("/(tabs)/profile")}>
          <Ionicons name="person-circle-outline" size={25} color="#636366" />
        </TouchableOpacity>
      </View>

      {/* Comments bottom sheet */}
      <Modal
        visible={showComments}
        animationType="slide"
        transparent
        onRequestClose={() => setShowComments(false)}
      >
        <TouchableOpacity
          style={cms.overlay}
          activeOpacity={1}
          onPress={() => setShowComments(false)}
        >
          <TouchableOpacity activeOpacity={1} style={cms.sheet}>
            <View style={cms.handle} />
            <View style={cms.header}>
              <View style={{ flex: 1 }} />
              <Text style={cms.title}>
                {activeShort
                  ? fmtCount(activeShort.commentCount + (extraComments[activeShort.id]?.length ?? 0))
                  : "0"}{" "}
                comments
              </Text>
              <TouchableOpacity style={{ flex: 1, alignItems: "flex-end" }} onPress={() => setShowComments(false)}>
                <Ionicons name="close" size={22} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            <View style={cms.divider} />

            <FlatList
              data={activeShort ? [...activeShort.comments, ...(extraComments[activeShort.id] ?? [])] : []}
              keyExtractor={(c) => c.id}
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, gap: 18 }}
              ListEmptyComponent={
                <View style={{ alignItems: "center", paddingTop: 40 }}>
                  <Ionicons name="chatbubble-outline" size={32} color="#3C3C3E" />
                  <Text style={{ color: "#636366", marginTop: 10, fontSize: 14 }}>Be the first to comment</Text>
                </View>
              }
              renderItem={({ item: c }) => (
                <View style={cms.commentRow}>
                  <View style={[cms.commentAvatar, { backgroundColor: c.userColor }]}>
                    <Text style={cms.commentAvatarText}>{initials(c.user)}</Text>
                  </View>
                  <View style={{ flex: 1, gap: 3 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Text style={cms.commentUser}>{c.user}</Text>
                      <Text style={cms.commentTime}>{c.time}</Text>
                    </View>
                    <Text style={cms.commentText}>{c.text}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginTop: 4 }}>
                      <TouchableOpacity
                        onPress={() => Haptics.selectionAsync()}
                        style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                      >
                        <Ionicons name="heart-outline" size={13} color="#636366" />
                        <Text style={{ color: "#636366", fontSize: 11 }}>{c.likes}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            />

            <View style={[cms.inputRow, { paddingBottom: Math.max(insets.bottom, 16) }]}>
              <View style={[cms.myAvatar, { backgroundColor: "#4A6741" }]}>
                <Text style={cms.myAvatarText}>ME</Text>
              </View>
              <View style={cms.inputWrap}>
                <TextInput
                  style={cms.input}
                  placeholder="Add a comment..."
                  placeholderTextColor="#636366"
                  value={commentText}
                  onChangeText={setCommentText}
                />
              </View>
              {commentText.trim().length > 0 && (
                <TouchableOpacity onPress={postComment} style={cms.postBtn}>
                  <Text style={cms.postBtnText}>Post</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  topBar: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    zIndex: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  topBackBtn: {
    width: 36, height: 36,
    alignItems: "center", justifyContent: "center",
  },
  topTabsWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  topTab: { color: "rgba(255,255,255,0.55)", fontSize: 14, fontWeight: "600" },
  topTabActive: { color: "#FFF", fontWeight: "700" },
  topTabDivider: { width: 1, height: 12, backgroundColor: "rgba(255,255,255,0.3)" },
  topCameraBtn: {
    width: 36, height: 36,
    alignItems: "center", justifyContent: "center",
  },

  videoBg: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pauseHint: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },

  bottomGradient: {
    position: "absolute",
    left: 0, right: 0, bottom: 0,
    height: SH * 0.52,
  },

  sidebar: {
    position: "absolute",
    right: 10,
    alignItems: "center",
    gap: 22,
  },
  creatorWrap: { alignItems: "center", marginBottom: 4 },
  creatorAvatar: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#FFF",
  },
  creatorInitials: { color: "#FFF", fontSize: 14, fontWeight: "700" },
  followPlus: {
    position: "absolute",
    bottom: -8,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: "#FE2C55",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: "#000",
  },

  sideAction: { alignItems: "center", gap: 3 },
  sideCount: { color: "#FFF", fontSize: 12, fontWeight: "600" },

  audioDisk: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#1C1C1E",
    borderWidth: 6, borderColor: "#2C2C2E",
    alignItems: "center", justifyContent: "center",
    overflow: "hidden",
  },
  audioDiskInner: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },

  bottomOverlay: {
    position: "absolute",
    left: 0, right: 68, bottom: 0,
    paddingHorizontal: 14,
    gap: 6,
  },
  creatorRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  creatorHandle: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  followInlineBtn: {
    borderWidth: 1, borderColor: "rgba(255,255,255,0.7)",
    borderRadius: 6, paddingHorizontal: 12, paddingVertical: 4,
  },
  followInlineText: { color: "#FFF", fontSize: 13, fontWeight: "700" },
  followInlineBtnFollowing: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderColor: "rgba(255,255,255,0.65)",
  },
  followInlineTextFollowing: { color: "#FFFFFF" },

  shortDesc: { color: "rgba(255,255,255,0.92)", fontSize: 13, lineHeight: 19 },
  audioRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  audioName: { color: "rgba(255,255,255,0.85)", fontSize: 12 },

  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 4,
    backgroundColor: "#111111",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#2C2C2E",
  },
  bottomNavItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomNavPlusWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6B7B5A",
    alignItems: "center",
    justifyContent: "center",
  },
});

// Comments sheet styles
const cms = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#1C1C1E", borderTopLeftRadius: 24, borderTopRightRadius: 24, height: SH * 0.72 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#48484A", alignSelf: "center", marginTop: 10, marginBottom: 12 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginBottom: 12 },
  title: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#3C3C3E" },
  commentRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  commentAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  commentAvatarText: { color: "#FFF", fontSize: 11, fontWeight: "700" },
  commentUser: { color: "#FFF", fontSize: 13, fontWeight: "700" },
  commentTime: { color: "#636366", fontSize: 11 },
  commentText: { color: "#AEAEB2", fontSize: 14, lineHeight: 20 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#3C3C3E" },
  myAvatar: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  myAvatarText: { color: "#FFF", fontSize: 11, fontWeight: "700" },
  inputWrap: { flex: 1, backgroundColor: "#2C2C2E", borderRadius: 22, paddingHorizontal: 14, paddingVertical: 10 },
  input: { color: "#FFF", fontSize: 14 },
  postBtn: { paddingHorizontal: 4 },
  postBtnText: { color: "#3B9EF9", fontSize: 14, fontWeight: "700" },
});

const sr = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2C2C2E",
  },
  backBtn: { padding: 4 },
  searchInputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, color: "#FFF", fontSize: 14, paddingVertical: 10 },
  section: { paddingHorizontal: 14, paddingTop: 14 },
  sectionTitle: {
    color: "#8E8E93",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  videoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#1C1C1E",
  },
  videoThumb: {
    width: 54,
    height: 74,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  videoText: { color: "#FFF", fontSize: 13, fontWeight: "600" },
  metaText: { color: "#8E8E93", fontSize: 12 },
  creatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#1C1C1E",
  },
  creatorAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  creatorAvatarText: { color: "#FFF", fontSize: 11, fontWeight: "700" },
  creatorName: { color: "#FFF", fontSize: 14, fontWeight: "600" },
  soundRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#1C1C1E",
  },
  soundName: { flex: 1, color: "#FFF", fontSize: 13 },
  hashtagWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  hashtagChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#1C1C1E",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2C2C2E",
  },
  hashtagText: { color: "#FFF", fontSize: 12, fontWeight: "600" },
  hashtagCount: { color: "#8E8E93", fontSize: 11 },
});

// Upload modal styles
const up = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 16 },
  headerBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#FFF", fontSize: 17, fontWeight: "700" },
  postBtn: { backgroundColor: "#4A6741", borderRadius: 10, paddingHorizontal: 18, paddingVertical: 8 },
  postBtnDisabled: { opacity: 0.4 },
  postBtnText: { color: "#FFF", fontSize: 14, fontWeight: "700" },

  previewArea: {
    marginHorizontal: 16, marginBottom: 20,
    height: 220, borderRadius: 16,
    backgroundColor: "#111",
    borderWidth: StyleSheet.hairlineWidth, borderColor: "#2C2C2E",
    alignItems: "center", justifyContent: "center",
  },
  previewEmpty: { alignItems: "center", gap: 8, paddingHorizontal: 32 },
  previewEmptyTitle: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  previewEmptyText: { color: "#636366", fontSize: 13, textAlign: "center", lineHeight: 18 },
  previewSelected: { alignItems: "center", gap: 10 },
  previewSelectedText: { color: "#6B7B5A", fontSize: 14, fontWeight: "600" },
  changeBtn: { backgroundColor: "#1C1C1E", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 6, marginTop: 4 },
  changeBtnText: { color: "#FFF", fontSize: 13, fontWeight: "600" },

  sourceRow: { flexDirection: "row", gap: 16, paddingHorizontal: 16, marginBottom: 24 },
  sourceBtn: { flex: 1, alignItems: "center", gap: 8, paddingVertical: 16, borderRadius: 14, backgroundColor: "#111", borderWidth: StyleSheet.hairlineWidth, borderColor: "#2C2C2E" },
  sourceBtnActive: { borderColor: "#4A6741", backgroundColor: "#4A674118" },
  sourceIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#1C1C1E", alignItems: "center", justifyContent: "center" },
  sourceIconActive: { backgroundColor: "#4A6741" },
  sourceLabel: { color: "#8E8E93", fontSize: 13, fontWeight: "600" },
  sourceLabelActive: { color: "#6B7B5A" },

  captionSection: { paddingHorizontal: 16, marginBottom: 16 },
  captionLabel: { color: "#8E8E93", fontSize: 12, fontWeight: "600", marginBottom: 8 },
  captionInput: { backgroundColor: "#111", borderRadius: 12, padding: 14, color: "#FFF", fontSize: 14, minHeight: 80, borderWidth: StyleSheet.hairlineWidth, borderColor: "#2C2C2E", textAlignVertical: "top" },
  charCount: { color: "#48484A", fontSize: 11, textAlign: "right", marginTop: 4 },

  optionsSection: { marginHorizontal: 16, borderRadius: 14, backgroundColor: "#111", borderWidth: StyleSheet.hairlineWidth, borderColor: "#2C2C2E", overflow: "hidden" },
  optionRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#1C1C1E" },
  optionLabel: { flex: 1, color: "#FFF", fontSize: 14 },
  optionValue: { color: "#636366", fontSize: 14 },
  audienceRow: { flexDirection: "row", gap: 8, paddingHorizontal: 12, paddingBottom: 12 },
  audiencePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#1C1C1E",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2C2C2E",
  },
  audiencePillActive: { backgroundColor: "#2B3E24", borderColor: "#6B7B5A" },
  audienceText: { color: "#8E8E93", fontSize: 12, fontWeight: "600" },
  audienceTextActive: { color: "#D4E9CB" },
});
