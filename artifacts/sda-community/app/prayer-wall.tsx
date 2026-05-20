import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Platform, StatusBar, TextInput, ScrollView, Modal, Alert,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

interface PrayerRequest {
  id: string;
  author: string;
  initials: string;
  avatarColor: string;
  category: string;
  text: string;
  timeAgo: string;
  prayingCount: number;
  isPraying: boolean;
  isAnonymous?: boolean;
}

const INITIAL_REQUESTS: PrayerRequest[] = [
  {
    id: "p1",
    author: "Pastor James Osei",
    initials: "PJ",
    avatarColor: "#6B7B5A",
    category: "Church",
    text: "Pray for our upcoming evangelism series beginning next Sabbath. May God use our church to bring many souls to His kingdom. The harvest is plentiful but the laborers are few.",
    timeAgo: "1h ago",
    prayingCount: 24,
    isPraying: false,
  },
  {
    id: "p2",
    author: "Anonymous",
    initials: "AN",
    avatarColor: "#3B5BDB",
    category: "Health",
    text: "Please pray for my mother who was diagnosed with cancer this week. We trust in God's healing power and believe He is still in the business of miracles. Lord, You are our healer.",
    timeAgo: "2h ago",
    prayingCount: 41,
    isPraying: false,
    isAnonymous: true,
  },
  {
    id: "p3",
    author: "Grace Adetokunbo",
    initials: "GA",
    avatarColor: "#0E7B5B",
    category: "Family",
    text: "Seeking prayer for my children who have drifted away from the church. I pray every day that God will restore them and draw them back to Himself. Prodigal children can come home.",
    timeAgo: "3h ago",
    prayingCount: 18,
    isPraying: false,
  },
  {
    id: "p4",
    author: "Elder Ruth Nakamura",
    initials: "ER",
    avatarColor: "#B8860B",
    category: "Personal",
    text: "I'm going through a financial trial — unexpected bills after a medical emergency. Please pray for provision and wisdom in managing what I have. God has always been faithful.",
    timeAgo: "4h ago",
    prayingCount: 32,
    isPraying: false,
  },
  {
    id: "p5",
    author: "David Mensah",
    initials: "DM",
    avatarColor: "#C85200",
    category: "World",
    text: "Let us pray for peace in our world. So many nations are in conflict. May world leaders be guided by the Holy Spirit to seek peace. Come, Lord Jesus.",
    timeAgo: "5h ago",
    prayingCount: 57,
    isPraying: false,
  },
  {
    id: "p6",
    author: "Abigail Owusu",
    initials: "AO",
    avatarColor: "#8B3A8B",
    category: "Personal",
    text: "Pray for me as I prepare for my board exams next week. I've been studying faithfully but I'm anxious. I know God has not given us a spirit of fear but of power and a sound mind.",
    timeAgo: "6h ago",
    prayingCount: 29,
    isPraying: false,
  },
  {
    id: "p7",
    author: "Samuel Boateng",
    initials: "SB",
    avatarColor: "#4A6741",
    category: "Church",
    text: "We need prayer warriors for our youth department. Our young people need mentors and spiritual guidance. Pray that God raises up dedicated leaders to invest in the next generation.",
    timeAgo: "8h ago",
    prayingCount: 15,
    isPraying: false,
  },
  {
    id: "p8",
    author: "Anonymous",
    initials: "AN",
    avatarColor: "#636366",
    category: "Family",
    text: "My marriage is in crisis. We are a Seventh-day Adventist family but we are struggling. Please pray that God restores our home and that we seek counseling. God is a restorer.",
    timeAgo: "12h ago",
    prayingCount: 44,
    isPraying: false,
    isAnonymous: true,
  },
  {
    id: "p9",
    author: "Mary Johnson",
    initials: "MJ",
    avatarColor: "#3B5BDB",
    category: "Health",
    text: "My father had a stroke last night and is in the ICU. Doctors are not sure of the outcome. But our God is a God of miracles. Please storm heaven on our behalf.",
    timeAgo: "1d ago",
    prayingCount: 88,
    isPraying: false,
  },
  {
    id: "p10",
    author: "Isaac Darko",
    initials: "ID",
    avatarColor: "#0E7B5B",
    category: "World",
    text: "Praying for our SDA missionaries in restricted countries who risk their lives to share the gospel. May God protect them and prosper the work of their hands.",
    timeAgo: "1d ago",
    prayingCount: 36,
    isPraying: false,
  },
];

const CATEGORIES = ["All", "Personal", "Family", "Health", "Church", "World"];

const CATEGORY_COLORS: Record<string, string> = {
  Personal: "#3B5BDB",
  Family: "#6B7B5A",
  Health: "#FF453A",
  Church: "#B8860B",
  World: "#0E7B5B",
};

export default function PrayerWallScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  const [requests, setRequests] = useState<PrayerRequest[]>(INITIAL_REQUESTS);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [newText, setNewText] = useState("");
  const [newCategory, setNewCategory] = useState("Personal");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const filtered = requests.filter(
    (r) => activeCategory === "All" || r.category === activeCategory
  );

  const totalPraying = requests.reduce((sum, r) => sum + r.prayingCount, 0);

  function togglePraying(id: string) {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        return {
          ...r,
          isPraying: !r.isPraying,
          prayingCount: r.isPraying ? r.prayingCount - 1 : r.prayingCount + 1,
        };
      })
    );
  }

  function submitRequest() {
    if (newText.trim().length < 10) {
      Alert.alert("Request too short", "Please share a little more about your prayer request.");
      return;
    }
    const newReq: PrayerRequest = {
      id: `p${Date.now()}`,
      author: isAnonymous ? "Anonymous" : "Maria Santos",
      initials: isAnonymous ? "AN" : "MS",
      avatarColor: isAnonymous ? "#636366" : "#6B7B5A",
      category: newCategory,
      text: newText.trim(),
      timeAgo: "Just now",
      prayingCount: 0,
      isPraying: false,
      isAnonymous,
    };
    setRequests((prev) => [newReq, ...prev]);
    setNewText("");
    setNewCategory("Personal");
    setIsAnonymous(false);
    setShowAdd(false);
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Prayer Wall</Text>
          <Text style={styles.headerSub}>{totalPraying} prayers lifted today</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Feather name="plus" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Stats banner */}
      <View style={styles.statsBanner}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{requests.length}</Text>
          <Text style={styles.statLabel}>Requests</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{totalPraying}</Text>
          <Text style={styles.statLabel}>Prayers</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{requests.filter((r) => r.isPraying).length}</Text>
          <Text style={styles.statLabel}>You're praying</Text>
        </View>
      </View>

      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow} contentContainerStyle={styles.catContent}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catPill, activeCategory === cat && styles.catPillActive]}
            onPress={() => setActiveCategory(cat)}
          >
            {cat !== "All" && (
              <View style={[styles.catDot, { backgroundColor: CATEGORY_COLORS[cat] || "#636366" }]} />
            )}
            <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 80 }}
        renderItem={({ item }) => (
          <View style={styles.requestCard}>
            <View style={styles.requestHeader}>
              <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
                <Text style={styles.avatarText}>{item.initials}</Text>
              </View>
              <View style={styles.requestMeta}>
                <View style={styles.requestMetaRow}>
                  <Text style={styles.authorName}>
                    {item.isAnonymous ? "Anonymous" : item.author}
                  </Text>
                  {item.isAnonymous && (
                    <View style={styles.anonBadge}>
                      <Text style={styles.anonBadgeText}>private</Text>
                    </View>
                  )}
                </View>
                <View style={styles.requestMetaBottom}>
                  <View style={[styles.catTag, { backgroundColor: (CATEGORY_COLORS[item.category] || "#636366") + "22" }]}>
                    <Text style={[styles.catTagText, { color: CATEGORY_COLORS[item.category] || "#636366" }]}>
                      {item.category}
                    </Text>
                  </View>
                  <Text style={styles.timeAgo}>{item.timeAgo}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.requestText}>{item.text}</Text>

            <TouchableOpacity
              style={[styles.prayBtn, item.isPraying && styles.prayBtnActive]}
              onPress={() => togglePraying(item.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.prayBtnEmoji]}>🙏</Text>
              <Text style={[styles.prayBtnText, item.isPraying && styles.prayBtnTextActive]}>
                {item.isPraying ? "Praying" : "I'm Praying"}
              </Text>
              <Text style={[styles.prayCount, item.isPraying && { color: "#6B7B5A" }]}>
                {item.prayingCount}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <Text style={{ fontSize: 40 }}>🙏</Text>
            <Text style={{ color: "#636366", marginTop: 12 }}>No requests in this category</Text>
          </View>
        }
      />

      {/* Add Prayer Request Modal */}
      <Modal visible={showAdd} animationType="slide" transparent onRequestClose={() => setShowAdd(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Share a Prayer Request</Text>
            <Text style={styles.modalSub}>Your request will be shared with the community. Others will pray for you.</Text>

            <Text style={styles.inputLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catPill, newCategory === cat && styles.catPillActive]}
                    onPress={() => setNewCategory(cat)}
                  >
                    <Text style={[styles.catText, newCategory === cat && styles.catTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.inputLabel}>Your Request</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Share your prayer request with the community..."
              placeholderTextColor="#636366"
              multiline
              numberOfLines={5}
              value={newText}
              onChangeText={setNewText}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={styles.anonToggle}
              onPress={() => setIsAnonymous(!isAnonymous)}
            >
              <View style={[styles.checkbox, isAnonymous && styles.checkboxChecked]}>
                {isAnonymous && <Ionicons name="checkmark" size={12} color="#FFF" />}
              </View>
              <View>
                <Text style={styles.anonToggleLabel}>Post anonymously</Text>
                <Text style={styles.anonToggleSub}>Your name won't be shown</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitBtn} onPress={submitRequest}>
              <Text style={styles.submitBtnText}>Submit Prayer Request</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdd(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12,
  },
  headerCenter: { alignItems: "center" },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  headerSub: { color: "#636366", fontSize: 11, marginTop: 1 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  addBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: "#6B7B5A",
    alignItems: "center", justifyContent: "center",
  },
  statsBanner: {
    flexDirection: "row", marginHorizontal: 16, marginBottom: 14,
    backgroundColor: "#111", borderRadius: 14, padding: 16,
  },
  statItem: { flex: 1, alignItems: "center" },
  statNum: { color: "#FFF", fontSize: 20, fontWeight: "700" },
  statLabel: { color: "#636366", fontSize: 11, marginTop: 2 },
  statDivider: { width: StyleSheet.hairlineWidth, backgroundColor: "#2C2C2E" },
  catRow: { marginBottom: 12, minHeight: 44 },
  catContent: { paddingHorizontal: 16, paddingVertical: 6, gap: 8, alignItems: "center" },
  catPill: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "#1C1C1E", borderWidth: StyleSheet.hairlineWidth, borderColor: "#2C2C2E", gap: 6 },
  catPillActive: { backgroundColor: "#3B5BDB", borderColor: "#3B5BDB" },
  catDot: { width: 6, height: 6, borderRadius: 3 },
  catText: { color: "#8E8E93", fontSize: 13, fontWeight: "500" },
  catTextActive: { color: "#FFF" },
  requestCard: { backgroundColor: "#111", borderRadius: 16, padding: 16 },
  requestHeader: { flexDirection: "row", gap: 10, marginBottom: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#FFF", fontSize: 13, fontWeight: "700" },
  requestMeta: { flex: 1 },
  requestMetaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  authorName: { color: "#FFF", fontSize: 14, fontWeight: "600" },
  anonBadge: { backgroundColor: "#2C2C2E", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  anonBadgeText: { color: "#636366", fontSize: 10 },
  requestMetaBottom: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  catTag: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  catTagText: { fontSize: 11, fontWeight: "600" },
  timeAgo: { color: "#636366", fontSize: 11 },
  requestText: { color: "#DADADB", fontSize: 14, lineHeight: 22, marginBottom: 14 },
  prayBtn: {
    flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start",
    backgroundColor: "#1C1C1E", paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, borderColor: "#2C2C2E",
  },
  prayBtnActive: { backgroundColor: "#6B7B5A22", borderColor: "#6B7B5A66" },
  prayBtnEmoji: { fontSize: 14 },
  prayBtnText: { color: "#8E8E93", fontSize: 13, fontWeight: "500" },
  prayBtnTextActive: { color: "#6B7B5A" },
  prayCount: { color: "#636366", fontSize: 13, fontWeight: "600" },
  // Modal
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.6)" },
  modalSheet: {
    backgroundColor: "#111", borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingTop: 12,
  },
  modalHandle: { width: 36, height: 4, backgroundColor: "#3C3C3E", borderRadius: 2, alignSelf: "center", marginBottom: 20 },
  modalTitle: { color: "#FFF", fontSize: 18, fontWeight: "700", marginBottom: 6 },
  modalSub: { color: "#8E8E93", fontSize: 13, lineHeight: 18, marginBottom: 20 },
  inputLabel: { color: "#8E8E93", fontSize: 12, fontWeight: "600", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  textArea: {
    backgroundColor: "#1C1C1E", borderRadius: 12, padding: 14,
    color: "#FFF", fontSize: 15, minHeight: 100, marginBottom: 16,
    borderWidth: StyleSheet.hairlineWidth, borderColor: "#2C2C2E",
  },
  anonToggle: {
    flexDirection: "row", alignItems: "center", gap: 12,
    marginBottom: 20, paddingVertical: 4,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "#3C3C3E",
    alignItems: "center", justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: "#6B7B5A", borderColor: "#6B7B5A" },
  anonToggleLabel: { color: "#FFF", fontSize: 14, fontWeight: "500" },
  anonToggleSub: { color: "#636366", fontSize: 12 },
  submitBtn: {
    backgroundColor: "#6B7B5A", borderRadius: 14, paddingVertical: 14,
    alignItems: "center", marginBottom: 10,
  },
  submitBtnText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  cancelBtn: { alignItems: "center", paddingVertical: 10 },
  cancelBtnText: { color: "#636366", fontSize: 15 },
});
