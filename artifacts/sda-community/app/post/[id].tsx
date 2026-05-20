import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  Share,
  Alert,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

interface Comment {
  id: string;
  author: string;
  color: string;
  text: string;
  timeAgo: string;
  likes: number;
}

const POSTS_DATA: Record<string, {
  author: string;
  color: string;
  role?: string;
  roleColor?: string;
  timeAgo: string;
  content: string;
  reactions: number;
  liked: boolean;
  saved: boolean;
  comments: Comment[];
}> = {
  "1": {
    author: "Pastor James Osei",
    color: "#3B5BDB",
    role: "Pastor",
    roleColor: "#6B7B5A",
    timeAgo: "5h ago",
    content: "Sabbath Service this week will be held at our main sanctuary at 9:30 AM. We'll be celebrating our 25th church anniversary with a special programme and fellowship lunch after service. All are welcome — bring your family and friends!\n\nDress code: Formal/Smart Casual\nVenue: Main Sanctuary, SDA Church\n\n\"And let us not neglect our meeting together, as some people do, but encourage one another\" — Hebrews 10:25",
    reactions: 78,
    liked: false,
    saved: false,
    comments: [
      { id: "c1", author: "Grace Adetokunbo", color: "#0E7B5B", text: "Praying with you, Pastor. God is faithful!", timeAgo: "4h ago", likes: 12 },
      { id: "c2", author: "Samuel Boateng", color: "#8B5E00", text: "We will be there! God bless the congregation.", timeAgo: "3h ago", likes: 8 },
      { id: "c3", author: "Elder Ruth Nakamura", color: "#B8860B", text: "Amen! Looking forward to the celebration service.", timeAgo: "2h ago", likes: 15 },
    ],
  },
  "2": {
    author: "Abigail Owusu",
    color: "#8B3A8B",
    timeAgo: "14 ago",
    content: "Rehearsal night with the most talented voices in SDA. We're preparing something special for the anniversary service. God is getting all the glory! 🎵\n\nIf you want to join the choir, contact the worship team leader. All voices are welcome — God created every single one of them beautifully.",
    reactions: 95,
    liked: true,
    saved: false,
    comments: [
      { id: "c1", author: "Grace Adetokunbo", color: "#0E7B5B", text: "Praying with you, David. God is faithful", timeAgo: "5h ago", likes: 3 },
      { id: "c2", author: "David Mensah", color: "#C85200", text: "Thank you all for the support!", timeAgo: "4h ago", likes: 7 },
    ],
  },
};

function AvatarCircle({ name, color, size = 36 }: { name: string; color: string; size?: number }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#FFF", fontWeight: "700", fontSize: size * 0.38 }}>{initials}</Text>
    </View>
  );
}

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const post = POSTS_DATA[id ?? "1"] ?? POSTS_DATA["1"];
  const [liked, setLiked] = useState(post.liked);
  const [saved, setSaved] = useState(post.saved);
  const [reactions, setReactions] = useState(post.reactions);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>(post.comments);

  function handleLike() {
    Haptics.selectionAsync();
    setLiked((v) => !v);
    setReactions((r) => liked ? r - 1 : r + 1);
  }

  function handleSubmitComment() {
    if (!newComment.trim()) return;
    const c: Comment = {
      id: Date.now().toString(),
      author: "Abigail Owusu",
      color: "#8B3A8B",
      text: newComment.trim(),
      timeAgo: "Just now",
      likes: 0,
    };
    setComments((prev) => [...prev, c]);
    setNewComment("");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <TouchableOpacity style={styles.shareBtn} onPress={() => { Haptics.selectionAsync(); Share.share({ message: `${post.author} on SDA Community:\n\n"${post.content.slice(0, 200)}"` }); }}>
          <Feather name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView style={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.postHeader}>
            <AvatarCircle name={post.author} color={post.color} />
            <View style={styles.postHeaderText}>
              <View style={styles.authorRow}>
                <Text style={styles.authorName}>{post.author}</Text>
                {post.role && (
                  <View style={[styles.roleBadge, { backgroundColor: post.roleColor + "33" }]}>
                    <Text style={[styles.roleText, { color: post.roleColor }]}>{post.role}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.timeAgo}>{post.timeAgo}</Text>
            </View>
            <TouchableOpacity style={styles.moreBtn} onPress={() => { Haptics.selectionAsync(); Alert.alert("Post Options", undefined, [ { text: "Copy Link", onPress: () => Alert.alert("Copied", "Post link copied to clipboard.") }, { text: "Share Post", onPress: () => Share.share({ message: `${post.author} on SDA Community:\n\n"${post.content.slice(0, 200)}"` }) }, { text: "Report Post", style: "destructive", onPress: () => Alert.alert("Report Submitted", "Thank you for helping keep SDA Community safe.") }, { text: "Cancel", style: "cancel" }]); }}>
              <Feather name="more-horizontal" size={20} color="#636366" />
            </TouchableOpacity>
          </View>

          <View style={styles.mediaPlaceholder}>
            <Ionicons name="image-outline" size={44} color="#3C3C3E" />
          </View>

          <View style={styles.reactionBar}>
            <TouchableOpacity style={styles.reactionBtn} onPress={handleLike}>
              <Ionicons name={liked ? "heart" : "heart-outline"} size={24} color={liked ? "#FF3B5B" : "#8E8E93"} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.reactionBtn} onPress={() => { Haptics.selectionAsync(); }}>
              <Ionicons name="chatbubble-outline" size={23} color="#8E8E93" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.reactionBtn} onPress={() => { Haptics.selectionAsync(); Share.share({ message: `${post.author} on SDA Community:\n\n"${post.content.slice(0, 200)}"` }); }}>
              <Feather name="send" size={21} color="#8E8E93" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.reactionBtn} onPress={() => { Haptics.selectionAsync(); Alert.alert(`${reactions} Reactions`, `${post.author}'s post has received ${reactions} reactions from the community.\n\n❤️ Love  😮 Wow  🙏 Amen  😢 Sad`); }}>
              <Ionicons name="people-outline" size={23} color="#8E8E93" />
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
            <TouchableOpacity onPress={() => { Haptics.selectionAsync(); setSaved((v) => !v); }}>
              <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={23} color={saved ? "#6B7B5A" : "#8E8E93"} />
            </TouchableOpacity>
          </View>

          <View style={styles.reactionsCount}>
            <Text style={styles.reactionsCountText}>{reactions} reactions</Text>
          </View>

          <View style={styles.postContent}>
            <Text style={styles.authorCredit}>
              <Text style={styles.authorCreditName}>{post.author} </Text>
            </Text>
            <Text style={styles.postText}>{post.content}</Text>
          </View>

          {comments.length > 0 && (
            <View style={styles.viewAllComments}>
              <Text style={styles.viewAllCommentsText}>
                {comments.length} comment{comments.length !== 1 ? "s" : ""}
              </Text>
            </View>
          )}

          <View style={styles.commentsSection}>
            {comments.map((c) => (
              <View key={c.id} style={styles.commentItem}>
                <AvatarCircle name={c.author} color={c.color} size={32} />
                <View style={styles.commentBubble}>
                  <Text style={styles.commentText}>
                    <Text style={styles.commentAuthor}>{c.author} </Text>
                    {c.text}
                  </Text>
                  <View style={styles.commentFooter}>
                    <Text style={styles.commentTime}>{c.timeAgo}</Text>
                    {c.likes > 0 && (
                      <View style={styles.commentLikes}>
                        <Ionicons name="heart" size={11} color="#FF3B5B" />
                        <Text style={styles.commentLikeCount}>{c.likes}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View style={{ height: 80 }} />
        </ScrollView>

        <View style={[styles.commentInputRow, { paddingBottom: bottomPad + 8 }]}>
          <AvatarCircle name="Abigail Owusu" color="#8B3A8B" size={30} />
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            placeholderTextColor="#636366"
            value={newComment}
            onChangeText={setNewComment}
            returnKeyType="send"
            onSubmitEditing={handleSubmitComment}
          />
          {newComment.trim().length > 0 && (
            <TouchableOpacity onPress={handleSubmitComment}>
              <Ionicons name="send" size={20} color="#6B7B5A" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2C2C2E",
  },
  backBtn: { padding: 6 },
  headerTitle: { flex: 1, textAlign: "center", color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  shareBtn: { padding: 6 },
  body: { flex: 1 },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  postHeaderText: { flex: 1 },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  authorName: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
  roleBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  roleText: { fontSize: 10, fontWeight: "600" },
  timeAgo: { color: "#636366", fontSize: 12, marginTop: 2 },
  moreBtn: { padding: 4 },
  mediaPlaceholder: {
    height: 220,
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center",
  },
  reactionBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
  },
  reactionBtn: { padding: 4, marginRight: 8 },
  reactionsCount: { paddingHorizontal: 14, marginBottom: 8 },
  reactionsCountText: { color: "#AEAEB2", fontSize: 14, fontWeight: "600" },
  postContent: { paddingHorizontal: 14, marginBottom: 10 },
  authorCredit: { marginBottom: 2 },
  authorCreditName: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
  postText: { color: "#DADADB", fontSize: 14, lineHeight: 22 },
  viewAllComments: { paddingHorizontal: 14, paddingVertical: 6 },
  viewAllCommentsText: { color: "#8E8E93", fontSize: 13 },
  commentsSection: { paddingHorizontal: 14, gap: 14 },
  commentItem: { flexDirection: "row", gap: 10 },
  commentBubble: { flex: 1, backgroundColor: "#1C1C1E", borderRadius: 12, padding: 10 },
  commentText: { color: "#DADADB", fontSize: 13, lineHeight: 18 },
  commentAuthor: { color: "#FFFFFF", fontWeight: "600" },
  commentFooter: { flexDirection: "row", alignItems: "center", marginTop: 6, gap: 10 },
  commentTime: { color: "#636366", fontSize: 11 },
  commentLikes: { flexDirection: "row", alignItems: "center", gap: 3 },
  commentLikeCount: { color: "#8E8E93", fontSize: 11 },
  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#2C2C2E",
    backgroundColor: "#0A0A0A",
    gap: 10,
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: "#FFFFFF",
    fontSize: 14,
  },
});
