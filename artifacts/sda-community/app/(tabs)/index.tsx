import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  ScrollView,
  StatusBar,
  Alert,
  Share,
  Modal,
  Dimensions,
  Animated,
  Image,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useNotifications } from "@/hooks/useNotifications";

const { height: SCREEN_H } = Dimensions.get("window");

const DAILY_VERSES = [
  { ref: "Jeremiah 29:11", text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future." },
  { ref: "Philippians 4:13", text: "I can do all this through him who gives me strength." },
  { ref: "Romans 8:28", text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose." },
  { ref: "Proverbs 3:5-6", text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight." },
  { ref: "Psalm 23:1", text: "The Lord is my shepherd, I lack nothing." },
  { ref: "Isaiah 40:31", text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint." },
  { ref: "Matthew 11:28", text: "Come to me, all you who are weary and burdened, and I will give you rest." },
  { ref: "John 3:16", text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life." },
  { ref: "Psalm 46:1", text: "God is our refuge and strength, an ever-present help in trouble." },
  { ref: "2 Timothy 1:7", text: "For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline." },
  { ref: "Lamentations 3:22-23", text: "Because of the Lord's great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness." },
  { ref: "Joshua 1:9", text: "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go." },
  { ref: "Psalm 119:105", text: "Your word is a lamp for my feet, a light on my path." },
  { ref: "Romans 12:2", text: "Do not conform to the pattern of this world, but be transformed by the renewing of your mind." },
  { ref: "Psalm 37:4", text: "Take delight in the Lord, and he will give you the desires of your heart." },
  { ref: "Ephesians 2:8-9", text: "For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God—not by works, so that no one can boast." },
  { ref: "John 14:6", text: "Jesus answered, 'I am the way and the truth and the life. No one comes to the Father except through me.'" },
  { ref: "Psalm 91:1-2", text: "Whoever dwells in the shelter of the Most High will rest in the shadow of the Almighty. I will say of the Lord, 'He is my refuge and my fortress, my God, in whom I trust.'" },
  { ref: "Galatians 5:22-23", text: "But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control." },
  { ref: "Hebrews 11:1", text: "Now faith is confidence in what we hope for and assurance about what we do not see." },
  { ref: "1 John 4:19", text: "We love because he first loved us." },
  { ref: "Psalm 34:8", text: "Taste and see that the Lord is good; blessed is the one who takes refuge in him." },
  { ref: "Micah 6:8", text: "He has shown you, O mortal, what is good. And what does the Lord require of you? To act justly and to love mercy and to walk humbly with your God." },
  { ref: "Romans 5:8", text: "But God demonstrates his own love for us in this: While we were still sinners, Christ died for us." },
  { ref: "Psalm 28:7", text: "The Lord is my strength and my shield; my heart trusts in him, and he helps me. My heart leaps for joy, and with my song I praise him." },
  { ref: "Colossians 3:2", text: "Set your minds on things above, not on earthly things." },
  { ref: "James 1:17", text: "Every good and perfect gift is from above, coming down from the Father of the heavenly lights, who does not change like shifting shadows." },
  { ref: "1 Corinthians 13:13", text: "And now these three remain: faith, hope and love. But the greatest of these is love." },
  { ref: "Revelation 21:4", text: "He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain, for the old order of things has passed away." },
  { ref: "Deuteronomy 31:8", text: "The Lord himself goes before you and will be with you; he will never leave you nor forsake you. Do not be afraid; do not be discouraged." },
];

function getDailyVerse() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return DAILY_VERSES[dayOfYear % DAILY_VERSES.length];
}

function VerseOfTheDayCard({ onShare }: { onShare: () => void }) {
  const verse = getDailyVerse();
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const glowOpacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.05, 0.15] });

  return (
    <TouchableOpacity
      style={styles.verseCard}
      activeOpacity={0.9}
      onPress={() => router.push("/bible")}
    >
      <Animated.View style={[StyleSheet.absoluteFill, styles.verseGlow, { opacity: glowOpacity }]} />
      <View style={styles.verseCardTop}>
        <View style={styles.verseIconWrap}>
          <Ionicons name="book-outline" size={16} color="#B8860B" />
        </View>
        <Text style={styles.verseCardLabel}>VERSE OF THE DAY</Text>
        <TouchableOpacity style={styles.verseShareBtn} onPress={onShare}>
          <Feather name="share-2" size={14} color="#8E8E93" />
        </TouchableOpacity>
      </View>
      <Text style={styles.verseText}>"{verse.text}"</Text>
      <Text style={styles.verseRef}>— {verse.ref}</Text>
    </TouchableOpacity>
  );
}

interface CommunityPost {
  id: string;
  author: string;
  role?: string;
  roleColor?: string;
  timeAgo: string;
  content: string;
  hasMedia?: boolean;
  imageKey?: "banner" | "logo";
  reactions: number;
  comments: number;
  liked: boolean;
  saved: boolean;
  commentsPreview?: { author: string; text: string }[];
}

type FeedItem =
  | { type: "post"; data: CommunityPost }
  | { type: "suggested_people" };

const STORIES = [
  { id: "you", label: "Your Story", color: "#4A6741", isYou: true },
  { id: "pj", label: "James", color: "#3B5BDB", initials: "PJ" },
  { id: "er", label: "Ruth", color: "#B8860B", initials: "ER" },
  { id: "ga", label: "Grace", color: "#0E7B5B", initials: "GA" },
  { id: "ao", label: "Abigail", color: "#8B3A8B", initials: "AO" },
  { id: "dm", label: "David", color: "#C85200", initials: "DM" },
];

const COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: "1",
    author: "Pastor James Osei",
    role: "Pastor",
    roleColor: "#6B7B5A",
    timeAgo: "5h ago",
    content:
      "Sabbath Service this week will be held at our main sanctuary at 9:30 AM. We'll be celebrating our 25th church anniversary with a special programme.",
    hasMedia: true,
    imageKey: "banner",
    reactions: 92,
    comments: 14,
    liked: false,
    saved: false,
    commentsPreview: [{ author: "Grace Adetokunbo", text: "Praying with you, David. God is faithful" }],
  },
  {
    id: "2",
    author: "David Mensah",
    timeAgo: "5h ago",
    content:
      "Rehearsal night with the most talented voices in SDA. We're preparing something special for the anniversary service. God is getting all the glory!",
    hasMedia: true,
    imageKey: "banner",
    reactions: 95,
    comments: 5,
    liked: true,
    saved: false,
    commentsPreview: [{ author: "Grace Adetokunbo", text: "Praying with you, David. God is faithful" }],
  },
  {
    id: "3",
    author: "Elder Ruth Nakamura",
    role: "Elder",
    roleColor: "#B8860B",
    timeAgo: "8h ago",
    content:
      "Prayer meeting this Wednesday evening at 7:00 PM. All are welcome to join us in lifting our community and families before God.",
    hasMedia: true,
    imageKey: "banner",
    reactions: 67,
    comments: 9,
    liked: false,
    saved: true,
    commentsPreview: [],
  },
];

const SUGGESTED_PEOPLE = [
  { id: "sp1", name: "Pastor James Osei", role: "Pastor", color: "#3B5BDB", verified: true },
  { id: "sp2", name: "Elder Ruth Nakamura", role: "Elder", color: "#B8860B", verified: true },
  { id: "sp3", name: "Abigail Owusu", role: "Member", color: "#8B3A8B", verified: false },
  { id: "sp4", name: "Emmanuel Darko", role: "Deacon", color: "#C85200", verified: false },
  { id: "sp5", name: "Naomi Asante", role: "Youth Leader", color: "#0E7B5B", verified: false },
];


const AVATAR_COLORS: Record<string, string> = {
  "Pastor James Osei": "#3B5BDB",
  "David Mensah": "#C85200",
  "Elder Ruth Nakamura": "#B8860B",
  "Grace Adetokunbo": "#0E7B5B",
};

function getColor(name: string) {
  return AVATAR_COLORS[name] ?? "#4A6741";
}

function AvatarCircle({ name, color, size = 36 }: { name: string; color?: string; size?: number }) {
  const c = color ?? getColor(name);
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: c, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#FFF", fontWeight: "700", fontSize: size * 0.38 }}>{initials}</Text>
    </View>
  );
}

function StoryCircle({ story }: { story: typeof STORIES[0] }) {
  function handlePress() {
    if (story.isYou) {
      router.push({ pathname: "/(tabs)/new-post" });
    } else {
      router.push({ pathname: "/story/[id]", params: { id: story.id } });
    }
  }
  return (
    <TouchableOpacity style={styles.storyItem} onPress={handlePress} activeOpacity={0.8}>
      <View style={[styles.storyRing, { borderColor: story.isYou ? "#2C2C2E" : "#6B7B5A" }]}>
        <View style={[styles.storyAvatar, { backgroundColor: story.color }]}>
          {story.isYou ? (
            <Ionicons name="add" size={22} color="#FFFFFF" />
          ) : (
            <Text style={styles.storyInitials}>{story.initials}</Text>
          )}
        </View>
      </View>
      <Text style={styles.storyLabel} numberOfLines={1}>{story.label}</Text>
    </TouchableOpacity>
  );
}

function SuggestedPeopleBanner() {
  const [followed, setFollowed] = useState<Set<string>>(new Set());
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <View style={styles.suggestBanner}>
      <View style={styles.suggestBannerHeader}>
        <View style={styles.suggestBannerLeft}>
          <Ionicons name="people-outline" size={16} color="#6B7B5A" />
          <Text style={styles.suggestBannerTitle}>Suggested for You</Text>
        </View>
        <TouchableOpacity onPress={() => setDismissed(true)}>
          <Ionicons name="close" size={18} color="#636366" />
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestScroll}>
        {SUGGESTED_PEOPLE.map((person) => {
          const initials = person.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
          const isFollowed = followed.has(person.id);
          return (
            <TouchableOpacity
              key={person.id}
              style={styles.personCard}
              onPress={() => router.push({ pathname: "/user-profile", params: { name: person.name } })}
            >
              <View style={[styles.personAvatar, { backgroundColor: person.color }]}>
                <Text style={styles.personAvatarText}>{initials}</Text>
              </View>
              <View style={styles.personNameRow}>
                <Text style={styles.personName} numberOfLines={1}>{person.name.split(" ")[0]}</Text>
                {person.verified && <Ionicons name="checkmark-circle" size={11} color="#3B5BDB" />}
              </View>
              <TouchableOpacity
                style={[styles.followBtn, isFollowed && styles.followBtnActive]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setFollowed((prev) => {
                    const next = new Set(prev);
                    if (next.has(person.id)) next.delete(person.id);
                    else next.add(person.id);
                    return next;
                  });
                }}
              >
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.9}
                  style={[styles.followBtnText, isFollowed && styles.followBtnTextActive]}
                >
                  {isFollowed ? "Following" : "Follow"}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

// Instagram-style bottom sheet action menu
function PostActionsSheet({
  visible,
  post,
  isFollowed,
  onClose,
  onFollow,
  onHide,
}: {
  visible: boolean;
  post: CommunityPost | null;
  isFollowed: boolean;
  onClose: () => void;
  onFollow: () => void;
  onHide: () => void;
}) {
  if (!post) return null;

  const isOwnPost = post.author === "Maria Santos";

  const actions = isOwnPost
    ? [
        { label: "Edit Post", icon: "pencil-outline", color: "#FFF", onPress: () => { onClose(); Alert.alert("Edit Post", "Post editor would open here."); } },
        { label: "Delete Post", icon: "trash-outline", color: "#FF453A", onPress: () => { onClose(); Alert.alert("Delete Post", "Are you sure you want to delete this post?", [{ text: "Delete", style: "destructive" }, { text: "Cancel", style: "cancel" }]); } },
        { label: "Copy Link", icon: "link-outline", color: "#FFF", onPress: () => { onClose(); Alert.alert("Copied", "Post link copied to clipboard."); } },
        { label: "Share", icon: "share-outline", color: "#FFF", onPress: () => { onClose(); Share.share({ message: `Check out this post by ${post.author} on SDA Community:\n\n"${post.content}"` }); } },
      ]
    : [
        {
          label: isFollowed ? `Unfollow ${post.author.split(" ")[0]}` : `Follow ${post.author.split(" ")[0]}`,
          icon: isFollowed ? "person-remove-outline" : "person-add-outline",
          color: isFollowed ? "#FF453A" : "#6B7B5A",
          onPress: () => { onFollow(); onClose(); },
        },
        { label: "Send Message", icon: "chatbubble-outline", color: "#FFF", onPress: () => { onClose(); router.push({ pathname: "/dm/[id]", params: { id: "1" } }); } },
        { label: "Copy Link", icon: "link-outline", color: "#FFF", onPress: () => { onClose(); Alert.alert("Copied", "Post link copied to clipboard."); } },
        { label: "Share", icon: "share-outline", color: "#FFF", onPress: () => { onClose(); Share.share({ message: `Check out this post by ${post.author} on SDA Community:\n\n"${post.content}"` }); } },
        { label: "Not Interested", icon: "eye-off-outline", color: "#FFF", onPress: () => { onHide(); onClose(); } },
        { label: "Mute", icon: "volume-mute-outline", color: "#FFF", onPress: () => { onClose(); Alert.alert("Muted", `You won't see posts from ${post.author.split(" ")[0]} in your feed.`); } },
        { label: "Report Post", icon: "flag-outline", color: "#FF453A", onPress: () => { onClose(); Alert.alert("Report Submitted", "Thank you for helping keep SDA Community safe. Our team will review this post.", [{ text: "OK" }]); } },
      ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.sheetContainer}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetAuthorRow}>
            <AvatarCircle name={post.author} size={42} />
            <View style={styles.sheetAuthorInfo}>
              <Text style={styles.sheetAuthorName}>{post.author}</Text>
              <Text style={styles.sheetAuthorTime}>{post.timeAgo}</Text>
            </View>
          </View>
          <View style={styles.sheetDivider} />
          {actions.map((action, i) => (
            <TouchableOpacity key={i} style={styles.sheetAction} onPress={action.onPress}>
              <View style={[styles.sheetActionIcon, { backgroundColor: action.color === "#FF453A" ? "#FF453A22" : action.color === "#6B7B5A" ? "#6B7B5A22" : "#1C1C1E" }]}>
                <Ionicons name={action.icon as any} size={20} color={action.color} />
              </View>
              <Text style={[styles.sheetActionLabel, { color: action.color }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.sheetCancelBtn} onPress={onClose}>
            <Text style={styles.sheetCancelText}>Cancel</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

function PostCard({
  post,
  onLike,
  onSave,
  onMore,
  isFollowed,
}: {
  post: CommunityPost;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onMore: (post: CommunityPost) => void;
  isFollowed: boolean;
}) {
  const imageSource = post.imageKey === "logo"
    ? require("@/assets/images/sda-logo.png")
    : require("@/assets/images/banner.png");

  function handleShare() {
    Haptics.selectionAsync();
    Share.share({ message: `Check out this post by ${post.author} on SDA Community:\n\n"${post.content}"` });
  }

  function handleReactions() {
    Haptics.selectionAsync();
    router.push({ pathname: "/post/[id]", params: { id: post.id } });
  }

  function handleAddComment() {
    router.push({ pathname: "/post/[id]", params: { id: post.id } });
  }

  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <TouchableOpacity onPress={() => router.push({ pathname: "/user-profile", params: { name: post.author } })}>
          <AvatarCircle name={post.author} size={38} />
        </TouchableOpacity>
        <View style={styles.postHeaderText}>
          <View style={styles.authorRow}>
            <TouchableOpacity onPress={() => router.push({ pathname: "/user-profile", params: { name: post.author } })}>
              <Text style={styles.authorName}>{post.author}</Text>
            </TouchableOpacity>
            {isFollowed && (
              <View style={styles.followingBadge}>
                <Text style={styles.followingBadgeText}>Following</Text>
              </View>
            )}
          </View>
          <Text style={styles.timeAgo}>{post.timeAgo}</Text>
        </View>
        <TouchableOpacity style={styles.moreBtn} onPress={() => { Haptics.selectionAsync(); onMore(post); }}>
          <Feather name="more-horizontal" size={20} color="#636366" />
        </TouchableOpacity>
      </View>

      {post.hasMedia && (
        <TouchableOpacity
          style={styles.postImageWrap}
          activeOpacity={0.8}
          onPress={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })}
        >
          <Image source={imageSource} style={styles.postImage} resizeMode="cover" />
        </TouchableOpacity>
      )}

      <TouchableOpacity activeOpacity={0.9} onPress={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })}>
        <Text style={styles.postContent}>{post.content}</Text>
      </TouchableOpacity>

      <View style={styles.reactionBar}>
        <TouchableOpacity style={styles.reactionBtn} onPress={() => { Haptics.selectionAsync(); onLike(post.id); }}>
          <Ionicons name={post.liked ? "heart" : "heart-outline"} size={22} color={post.liked ? "#FF3B5B" : "#8E8E93"} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.reactionBtn} onPress={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })}>
          <Ionicons name="chatbubble-outline" size={21} color="#8E8E93" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.reactionBtn} onPress={handleShare}>
          <Feather name="send" size={20} color="#8E8E93" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.reactionBtn} onPress={handleReactions}>
          <Ionicons name="people-outline" size={22} color="#8E8E93" />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => { Haptics.selectionAsync(); onSave(post.id); }}>
          <Ionicons name={post.saved ? "bookmark" : "bookmark-outline"} size={22} color={post.saved ? "#6B7B5A" : "#8E8E93"} />
        </TouchableOpacity>
      </View>

      <View style={styles.reactionCount}>
        <Text style={styles.reactionCountText}>{post.reactions} reactions</Text>
      </View>

      {post.commentsPreview && post.commentsPreview.length > 0 && (
        <TouchableOpacity onPress={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })}>
          <View style={styles.commentPreview}>
            <Text style={styles.commentText}>
              <Text style={styles.commentAuthor}>{post.commentsPreview[0].author} </Text>
              {post.commentsPreview[0].text}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {post.comments > 0 && (
        <TouchableOpacity onPress={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })}>
          <Text style={styles.viewComments}>View all {post.comments} comments</Text>
        </TouchableOpacity>
      )}

      <View style={styles.addCommentRow}>
        <AvatarCircle name="You" color="#4A6741" size={26} />
        <TouchableOpacity style={styles.addCommentInput} onPress={handleAddComment} activeOpacity={0.7}>
          <Text style={styles.addCommentPlaceholder}>Add a comment...</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ newPostId?: string; newPostCaption?: string; newPostImage?: string }>();
  const [posts, setPosts] = useState<CommunityPost[]>(COMMUNITY_POSTS);
  const [followedAuthors, setFollowedAuthors] = useState<Set<string>>(new Set());
  const [sheetPost, setSheetPost] = useState<CommunityPost | null>(null);
  const { unreadCount, addNotification } = useNotifications();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const verseNotifiedRef = useRef(false);
  const consumedPostedIds = useRef<Set<string>>(new Set());

  const newPostId = Array.isArray(params.newPostId) ? params.newPostId[0] : params.newPostId;
  const newPostCaption = Array.isArray(params.newPostCaption) ? params.newPostCaption[0] : params.newPostCaption;

  useEffect(() => {
    if (!newPostId || !newPostCaption) return;
    if (consumedPostedIds.current.has(newPostId)) return;

    consumedPostedIds.current.add(newPostId);
    setPosts((prev) => [
      {
        id: `u-${newPostId}`,
        author: "You",
        timeAgo: "now",
        content: newPostCaption,
        hasMedia: true,
        imageKey: "banner",
        reactions: 0,
        comments: 0,
        liked: false,
        saved: false,
        commentsPreview: [],
      },
      ...prev,
    ]);
  }, [newPostId, newPostCaption]);

  // Decide once on mount whether and where to show suggested people
  const suggestConfig = useRef({
    show: Math.random() > 0.35,
    insertAfter: Math.floor(Math.random() * 2) + 1, // after post 1 or 2
  });

  // ── Algorithm feed: rescore + reshuffle on every visit ──
  useFocusEffect(
    useCallback(() => {
      setPosts((prev) =>
        [...prev].sort((a, b) => {
          const score = (p: CommunityPost) =>
            p.reactions * 2 + p.comments * 3 + Math.random() * 18;
          return score(b) - score(a);
        })
      );
    }, [])
  );

  useEffect(() => {
    if (verseNotifiedRef.current) return;
    verseNotifiedRef.current = true;
    const verse = getDailyVerse();
    const timer = setTimeout(() => {
      addNotification({
        title: "📖 Verse of the Day",
        body: `"${verse.text.slice(0, 80)}..." — ${verse.ref}`,
        type: "verse",
      });
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  function handleLike(id: string) {
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, liked: !p.liked, reactions: p.liked ? p.reactions - 1 : p.reactions + 1 } : p));
  }
  function handleSave(id: string) {
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, saved: !p.saved } : p));
  }
  function handleHide(postId: string) {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }
  function handleFollow(author: string) {
    setFollowedAuthors((prev) => {
      const next = new Set(prev);
      if (next.has(author)) {
        next.delete(author);
        addNotification({ title: "Unfollowed", body: `You unfollowed ${author.split(" ")[0]}.`, type: "general" });
      } else {
        next.add(author);
        addNotification({ title: "Now Following", body: `You're now following ${author.split(" ")[0]}. You'll see their posts in your feed.`, type: "general" });
      }
      return next;
    });
  }

  function handleLogoPress() {
    Haptics.selectionAsync();
    setPosts((prev) =>
      [...prev].sort((a, b) => {
        const score = (p: CommunityPost) => p.reactions * 2 + p.comments * 3 + Math.random() * 18;
        return score(b) - score(a);
      })
    );
  }

  function handleSendNotification() {
    addNotification({
      title: "New Prayer Request",
      body: "Elder Ruth posted a new prayer request for the community.",
      type: "prayer",
    });
  }

  // Build mixed feed: posts + optional suggested people card
  const feedItems = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = posts.map((p) => ({ type: "post", data: p }));
    if (suggestConfig.current.show && items.length > 0) {
      const pos = Math.min(suggestConfig.current.insertAfter, items.length);
      items.splice(pos, 0, { type: "suggested_people" });
    }
    return items;
  }, [posts]);

  const header = (
    <View>
      <View style={[styles.topBar, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={handleLogoPress} activeOpacity={0.8}>
          <Image
            source={require("@/assets/images/sda-logo.png")}
            style={styles.logoImg}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSendNotification}>
          <Text style={styles.topTitle}>SDA Community</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push("/search")}>
            <Ionicons name="search-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push("/activity")}>
            <View>
              <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
              {unreadCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storiesRow} contentContainerStyle={styles.storiesContent}>
        {STORIES.map((s) => <StoryCircle key={s.id} story={s} />)}
      </ScrollView>

    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      <PostActionsSheet
        visible={sheetPost !== null}
        post={sheetPost}
        isFollowed={sheetPost ? followedAuthors.has(sheetPost.author) : false}
        onClose={() => setSheetPost(null)}
        onFollow={() => sheetPost && handleFollow(sheetPost.author)}
        onHide={() => sheetPost && handleHide(sheetPost.id)}
      />

      <FlatList
        data={feedItems}
        keyExtractor={(item, index) => item.type === "post" ? item.data.id : `suggest-${index}`}
        renderItem={({ item }) => {
          if (item.type === "suggested_people") {
            return <SuggestedPeopleBanner />;
          }
          return (
            <PostCard
              post={item.data}
              onLike={handleLike}
              onSave={handleSave}
              onMore={(p) => setSheetPost(p)}
              isFollowed={followedAuthors.has(item.data.author)}
            />
          );
        }}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 40 }}>
            <Ionicons name="search-outline" size={40} color="#3C3C3E" />
            <Text style={{ color: "#636366", marginTop: 12, fontSize: 15 }}>No posts in this category</Text>
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
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: "#0A0A0A",
  },
  iconBtn: { padding: 8 },
  logoImg: { width: 36, height: 36, borderRadius: 8 },
  topTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  notifBadge: {
    position: "absolute",
    top: -4,
    right: -6,
    backgroundColor: "#FF3B5B",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: "#0A0A0A",
  },
  notifBadgeText: { color: "#FFF", fontSize: 9, fontWeight: "800" },
  storiesRow: { backgroundColor: "#0A0A0A" },
  storiesContent: { paddingHorizontal: 14, paddingVertical: 10, gap: 14 },
  storyItem: { alignItems: "center", width: 62 },
  storyRing: {
    width: 62, height: 62, borderRadius: 31, borderWidth: 2, padding: 2,
    alignItems: "center", justifyContent: "center",
  },
  storyAvatar: {
    width: 54, height: 54, borderRadius: 27,
    alignItems: "center", justifyContent: "center",
  },
  storyInitials: { color: "#FFF", fontWeight: "700", fontSize: 18 },
  storyLabel: { color: "#8E8E93", fontSize: 11, marginTop: 5, textAlign: "center" },
  filterRow: { backgroundColor: "#0A0A0A", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#2C2C2E" },
  filterContent: { paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  filterPill: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, backgroundColor: "#1C1C1E",
  },
  filterPillActive: { backgroundColor: "#6B7B5A" },
  filterText: { color: "#8E8E93", fontSize: 13, fontWeight: "500" },
  filterTextActive: { color: "#FFFFFF", fontWeight: "600" },
  separator: { height: 8, backgroundColor: "#0A0A0A" },
  postCard: { backgroundColor: "#111111", paddingVertical: 14 },
  postHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 10, marginBottom: 10 },
  postHeaderText: { flex: 1 },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  authorName: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  followingBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: "#3B5BDB22" },
  followingBadgeText: { fontSize: 10, fontWeight: "600", color: "#3B5BDB" },
  timeAgo: { color: "#636366", fontSize: 12, marginTop: 1 },
  moreBtn: { padding: 4 },
  postContent: { color: "#DADADB", fontSize: 14, lineHeight: 20, paddingHorizontal: 14, marginBottom: 10 },
  postImageWrap: {
    height: 210,
    backgroundColor: "#1C1C1E",
    marginBottom: 10,
    overflow: "hidden",
  },
  postImage: { width: "100%", height: "100%" },
  reactionBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, marginBottom: 6, gap: 4 },
  reactionBtn: { padding: 4, marginRight: 8 },
  reactionCount: { paddingHorizontal: 14, marginBottom: 4 },
  reactionCountText: { color: "#AEAEB2", fontSize: 13, fontWeight: "600" },
  commentPreview: { paddingHorizontal: 14, marginBottom: 4 },
  commentText: { color: "#AEAEB2", fontSize: 13, lineHeight: 18 },
  commentAuthor: { color: "#FFFFFF", fontWeight: "600" },
  viewComments: { color: "#8E8E93", fontSize: 13, paddingHorizontal: 14, marginBottom: 8 },
  addCommentRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 10 },
  addCommentInput: { flex: 1, backgroundColor: "#1C1C1E", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  addCommentPlaceholder: { color: "#636366", fontSize: 13 },
  // Suggested people banner
  suggestBanner: {
    backgroundColor: "#111111",
    paddingTop: 14,
    paddingBottom: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#2C2C2E",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2C2C2E",
  },
  suggestBannerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  suggestBannerLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  suggestBannerTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  suggestScroll: { paddingHorizontal: 14, gap: 10 },
  personCard: {
    width: 102,
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
  followBtn: {
    marginTop: 4,
    backgroundColor: "#4A6741",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  followBtnActive: { backgroundColor: "#2C2C2E" },
  followBtnText: { color: "#FFF", fontSize: 10, fontWeight: "700" },
  followBtnTextActive: { color: "#8E8E93" },
  // Bottom sheet styles
  sheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    maxHeight: SCREEN_H * 0.75,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#3C3C3E",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 16,
  },
  sheetAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  sheetAuthorInfo: { flex: 1 },
  sheetAuthorName: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  sheetAuthorTime: { color: "#8E8E93", fontSize: 12, marginTop: 2 },
  sheetDivider: { height: StyleSheet.hairlineWidth, backgroundColor: "#3C3C3E", marginBottom: 8 },
  sheetAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
  },
  sheetActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetActionLabel: { fontSize: 15, fontWeight: "500" },
  sheetCancelBtn: {
    marginTop: 8,
    backgroundColor: "#2C2C2E",
    borderRadius: 14,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetCancelText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  verseCard: {
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 4,
    backgroundColor: "#111111",
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#B8860B",
    overflow: "hidden",
    position: "relative",
  },
  verseGlow: {
    backgroundColor: "#B8860B",
    borderRadius: 16,
  },
  verseCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  verseIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: "#B8860B22",
    alignItems: "center",
    justifyContent: "center",
  },
  verseCardLabel: { flex: 1, color: "#B8860B", fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  verseShareBtn: { padding: 4 },
  verseText: { color: "#DADADB", fontSize: 14, lineHeight: 22, fontStyle: "italic", marginBottom: 8 },
  verseRef: { color: "#B8860B", fontSize: 12, fontWeight: "600" },
});
