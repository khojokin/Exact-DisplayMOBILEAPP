import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  FlatList,
  Share,
  Modal,
  Dimensions,
  Image,
  Alert,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useSubscription } from "@/hooks/useSubscription";
import { useTheme } from "@/hooks/useTheme";

const { width: SCREEN_W } = Dimensions.get("window");

const PROFILE = {
  name: "Maria Santos",
  username: "mariasantos",
  role: "Member",
  bio: "SDA member since 2019 · Daily Word devotee 🙏",
  followedBy: "Followed by Pastor, Elder",
  streak: 12,
  posts: 3,
  followers: 312,
  following: 245,
};

const TABS = [
  { id: "grid", icon: "grid-outline" as const },
  { id: "bookmark", icon: "bookmark-outline" as const },
  { id: "tag", icon: "pricetag-outline" as const },
];

const GRID_POSTS = [
  { id: "1", color: "#2A3A2A" },
  { id: "2", color: "#3A3A2A" },
  { id: "3", color: "#2A2A3A" },
  { id: "4", color: "#3A2A2A" },
  { id: "5", color: "#2A3A3A" },
  { id: "6", color: "#3A2A3A" },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { plan } = useSubscription();
  const [activeTab, setActiveTab] = useState("grid");
  const [avatarPreview, setAvatarPreview] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const isPremium = plan === "premium";
  const { t } = useTheme();
  const theme = {
    background: t.bg,
    card: t.card,
    text: t.text,
    subtext: t.subtext,
    border: t.border,
    accent: t.accent,
  };
  const avatarBorderColor = t.accent;

  async function handleAvatarBadgePress() {
    Alert.alert("Profile Photo", "Choose an option", [
      {
        text: "Upload Photo",
        onPress: async () => {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) {
            Alert.alert("Permission needed", "Please allow access to your photo library.");
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.85,
          });
          if (!result.canceled && result.assets[0]) {
            setProfileImage(result.assets[0].uri);
          }
        },
      },
      profileImage
        ? {
            text: "Remove Photo",
            style: "destructive",
            onPress: () => setProfileImage(null),
          }
        : null,
      { text: "Cancel", style: "cancel" },
    ].filter(Boolean) as any);
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <StatusBar barStyle={t.statusBar} backgroundColor={theme.background} />

      {/* Instagram-style avatar full-screen preview modal */}
      <Modal
        visible={avatarPreview}
        transparent
        animationType="fade"
        onRequestClose={() => setAvatarPreview(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setAvatarPreview(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>MS</Text>
            </View>
            <Text style={styles.modalName}>{PROFILE.name}</Text>
            <Text style={styles.modalUsername}>@mariasantos</Text>
          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 120 : insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.topBar, { paddingTop: topPad }]}> 
          <Text style={[styles.username, { color: theme.text }]}>@{PROFILE.username}</Text>
          <TouchableOpacity onPress={() => router.push("/settings")}>
            <Feather name="menu" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileHeader}>
          <View style={styles.avatarCol}>
            {/* Tapping avatar opens preview; tapping badge opens upload picker */}
            <TouchableOpacity onPress={() => setAvatarPreview(true)} activeOpacity={0.85}>
              <View style={[styles.avatarCircle, { borderColor: avatarBorderColor }]}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>MS</Text>
                )}
              </View>
              <TouchableOpacity style={styles.avatarEditBadge} onPress={handleAvatarBadgePress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="add" size={12} color="#FFF" />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>

          <View style={styles.statsCol}>
            <TouchableOpacity style={styles.statBlock} onPress={() => setActiveTab("grid")}>
              <Text style={styles.statValue}>{PROFILE.posts}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.statBlock}
              onPress={() => router.push({ pathname: "/followers", params: { type: "followers" } })}
            >
              <Text style={styles.statValue}>{PROFILE.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.statBlock}
              onPress={() => router.push({ pathname: "/followers", params: { type: "following" } })}
            >
              <Text style={styles.statValue}>{PROFILE.following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bioSection}>
          <View style={styles.nameRow}>
            <Text style={[styles.profileName, { color: theme.text }]}>{PROFILE.name}</Text>
          </View>
          <Text style={[styles.bioText, { color: theme.subtext }]}>{PROFILE.bio}</Text>
          <Text style={[styles.followedByText, { color: theme.subtext }]}>Followed by people you know</Text>

        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.editProfileBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => router.push("/edit-profile")}
          >
            <Text style={[styles.editProfileText, { color: theme.text }]}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.analyticsBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => router.push("/analytics")}
          >
            <Ionicons name="bar-chart-outline" size={15} color={theme.text} />
            <Text style={[styles.analyticsBtnText, { color: theme.text }]}>Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.shareIconBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => Share.share({ message: "Check out Maria Santos on SDA Community! A fellow believer growing in faith 🙏" })}
          >
            <Ionicons name="share-social-outline" size={18} color={theme.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.resourcesRow}>
          <TouchableOpacity
            style={[styles.resourcesBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => router.push("/resources")}
          >
            <Ionicons name="book-outline" size={15} color={theme.text} />
            <Text style={[styles.resourcesBtnText, { color: theme.text }]}>Resources</Text>
          </TouchableOpacity>
        </View>

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

        <View style={styles.photoGrid}>
          {GRID_POSTS.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={[styles.gridCell, { backgroundColor: post.color }]}
              onPress={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })}
            >
              <Ionicons name="image-outline" size={28} color="rgba(255,255,255,0.2)" />
            </TouchableOpacity>
          ))}
        </View>
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
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  username: { color: "#FFFFFF", fontSize: 20, fontWeight: "700" },
  upgradeBanner: {
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#4C3B09",
    backgroundColor: "#2A220D",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  upgradeTitle: { color: "#F7E8B0", fontSize: 14, fontWeight: "800" },
  upgradeSubtitle: { color: "#D5C17D", fontSize: 12, marginTop: 2 },
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
    backgroundColor: "#4A6741",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#6B7B5A",
  },
  avatarText: { color: "#FFF", fontSize: 30, fontWeight: "700" },
  avatarEditBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#4A6741",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#0A0A0A",
  },
  avatarVerifiedDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#0A0A0A",
    alignItems: "center",
    justifyContent: "center",
  },
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
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  bioText: { color: "#AEAEB2", fontSize: 13, lineHeight: 18 },
  followedByRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  sdaBadge: {
    backgroundColor: "#4A674133",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sdaBadgeText: { color: "#6B7B5A", fontSize: 10, fontWeight: "700" },
  followedByText: { color: "#8E8E93", fontSize: 12 },
  avatarImage: { width: "100%", height: "100%", borderRadius: 999 },
  streakRow: { marginTop: 2 },
  streakText: { color: "#8E8E93", fontSize: 12 },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  editProfileBtn: {
    flex: 1,
    backgroundColor: "#1C1C1E",
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#3C3C3E",
  },
  editProfileText: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },
  shareIconBtn: {
    width: 44,
    height: 36,
    backgroundColor: "#1C1C1E",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#3C3C3E",
  },
  analyticsBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: "#1C1C1E",
    borderRadius: 10,
    paddingVertical: 9,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#3C3C3E",
  },
  analyticsBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },
  resourcesRow: {
    alignItems: "center",
    marginBottom: 16,
  },
  resourcesBtn: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: "#1C1C1E",
    borderRadius: 10,
    paddingVertical: 9,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#3C3C3E",
  },
  resourcesBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },
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
    justifyContent: "space-between",
    rowGap: 2,
    marginBottom: 16,
    paddingHorizontal: 1,
  },
  gridCell: {
    width: "33.1%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.88)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  avatarLarge: {
    width: SCREEN_W * 0.62,
    height: SCREEN_W * 0.62,
    borderRadius: (SCREEN_W * 0.62) / 2,
    backgroundColor: "#4A6741",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#6B7B5A",
    marginBottom: 20,
  },
  avatarLargeText: { color: "#FFF", fontSize: SCREEN_W * 0.18, fontWeight: "700" },
  modalName: { color: "#FFF", fontSize: 22, fontWeight: "700", marginBottom: 4 },
  modalUsername: { color: "#8E8E93", fontSize: 14, marginBottom: 28 },
  modalActions: { flexDirection: "row", gap: 12 },
  modalBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#4A6741",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  modalBtnSecondary: { backgroundColor: "#2C2C2E" },
  modalBtnText: { color: "#FFF", fontSize: 14, fontWeight: "600" },
});
