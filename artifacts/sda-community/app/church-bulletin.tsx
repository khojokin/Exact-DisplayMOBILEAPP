import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Platform, StatusBar, ScrollView, TextInput, Share, Modal,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

type BulletinCategory = "all" | "announcement" | "order-of-service" | "notice" | "event";

interface BulletinSection {
  heading: string;
  items: string[];
}

interface Bulletin {
  id: string;
  title: string;
  category: BulletinCategory;
  author: string;
  authorInitials: string;
  authorColor: string;
  date: string;
  dateLabel: string;
  isNew: boolean;
  isPinned: boolean;
  summary: string;
  sections: BulletinSection[];
  tags: string[];
  saved: boolean;
}

const CATEGORIES = [
  { id: "all", label: "All", icon: "albums-outline" },
  { id: "announcement", label: "Announcements", icon: "megaphone-outline" },
  { id: "order-of-service", label: "Order of Service", icon: "list-outline" },
  { id: "notice", label: "Notices", icon: "information-circle-outline" },
  { id: "event", label: "Events", icon: "calendar-outline" },
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  announcement: "#3B5BDB",
  "order-of-service": "#6B7B5A",
  notice: "#B8860B",
  event: "#8B3A8B",
};

const CATEGORY_LABELS: Record<string, string> = {
  announcement: "Announcement",
  "order-of-service": "Order of Service",
  notice: "Notice",
  event: "Event",
};

function AvatarCircle({ initials, color, size = 36 }: { initials: string; color: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#FFF", fontWeight: "700", fontSize: size * 0.33 }}>{initials}</Text>
    </View>
  );
}

function CategoryPill({ category }: { category: string }) {
  const color = CATEGORY_COLORS[category] || "#636366";
  const label = CATEGORY_LABELS[category] || category;
  return (
    <View style={[styles.catPill, { backgroundColor: color + "22" }]}>
      <Text style={[styles.catPillText, { color }]}>{label}</Text>
    </View>
  );
}

export default function ChurchBulletinScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  const [bulletins, setBulletins] = useState<Bulletin[]>([]);
  const [activeCategory, setActiveCategory] = useState<BulletinCategory>("all");
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState<Set<string>>(new Set<string>());
  const [selectedBulletin, setSelectedBulletin] = useState<Bulletin | null>(null);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // Add bulletin modal state
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<Exclude<BulletinCategory, "all">>("announcement");
  const [newAuthor, setNewAuthor] = useState("");
  const [newSummary, setNewSummary] = useState("");

  const AUTHOR_COLORS = ["#6B7B5A", "#3B5BDB", "#B8860B", "#8B3A8B", "#C85200", "#0E7B5B", "#6A3A2A"];

  function buildInitials(name: string) {
    const parts = name.trim().split(" ").filter(Boolean);
    return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join("") || "??";
  }

  function handleCreateBulletin() {
    const title = newTitle.trim();
    const author = newAuthor.trim() || "Church";
    if (!title) return;
    const today = new Date();
    const created: Bulletin = {
      id: `b${Date.now()}`,
      title,
      category: newCategory,
      author,
      authorInitials: buildInitials(author),
      authorColor: AUTHOR_COLORS[Math.floor(Math.random() * AUTHOR_COLORS.length)],
      date: today.toISOString().split("T")[0],
      dateLabel: "Just now",
      isNew: true,
      isPinned: false,
      summary: newSummary.trim(),
      sections: [],
      tags: [CATEGORY_LABELS[newCategory] || newCategory],
      saved: false,
    };
    setBulletins((prev) => [created, ...prev]);
    setAddModalVisible(false);
    setNewTitle("");
    setNewCategory("announcement");
    setNewAuthor("");
    setNewSummary("");
  }

  const toggleSave = useCallback((id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const filtered = bulletins.filter((b) => {
    const matchCat = activeCategory === "all" || b.category === activeCategory;
    const matchSearch = search === "" ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.summary.toLowerCase().includes(search.toLowerCase()) ||
      b.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchSaved = !showSavedOnly || saved.has(b.id);
    return matchCat && matchSearch && matchSaved;
  });

  const pinned = filtered.filter((b) => b.isPinned);
  const regular = filtered.filter((b) => !b.isPinned);
  const newCount = bulletins.filter((b) => b.isNew).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Church Bulletin</Text>
          {newCount > 0 && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>{newCount} new</Text>
            </View>
          )}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <TouchableOpacity
            style={[styles.savedToggle, showSavedOnly && styles.savedToggleActive]}
            onPress={() => setShowSavedOnly((v) => !v)}
          >
            <Ionicons
              name={showSavedOnly ? "bookmark" : "bookmark-outline"}
              size={18}
              color={showSavedOnly ? "#3B5BDB" : "#8E8E93"}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={() => setAddModalVisible(true)}>
            <Ionicons name="add" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color="#636366" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search bulletins, notices, events..."
          placeholderTextColor="#636366"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={16} color="#636366" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow} contentContainerStyle={styles.catContent}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.catTab, activeCategory === cat.id && styles.catTabActive]}
            onPress={() => setActiveCategory(cat.id as BulletinCategory)}
          >
            <Ionicons
              name={cat.icon as any}
              size={13}
              color={activeCategory === cat.id ? "#FFF" : "#8E8E93"}
            />
            <Text style={[styles.catTabText, activeCategory === cat.id && styles.catTabTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={[...(pinned.length > 0 ? ["pinned-header" as const] : []), ...pinned, ...(regular.length > 0 ? ["regular-header" as const] : []), ...regular]}
        keyExtractor={(item) => typeof item === "string" ? item : item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          if (item === "pinned-header") {
            return (
              <View style={styles.sectionHeader}>
                <Ionicons name="pin" size={13} color="#3B5BDB" />
                <Text style={styles.sectionHeaderText}>Pinned</Text>
              </View>
            );
          }
          if (item === "regular-header") {
            return (
              <View style={styles.sectionHeader}>
                <Ionicons name="time-outline" size={13} color="#636366" />
                <Text style={[styles.sectionHeaderText, { color: "#636366" }]}>Recent</Text>
              </View>
            );
          }
          const bulletin = item as Bulletin;
          return (
            <TouchableOpacity
              style={[styles.card, bulletin.isPinned && styles.cardPinned]}
              onPress={() => setSelectedBulletin(bulletin)}
              activeOpacity={0.85}
            >
              {/* Card top */}
              <View style={styles.cardTop}>
                <View style={styles.cardMeta}>
                  <AvatarCircle initials={bulletin.authorInitials} color={bulletin.authorColor} size={32} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardAuthor}>{bulletin.author}</Text>
                    <Text style={styles.cardDate}>{bulletin.dateLabel}</Text>
                  </View>
                </View>
                <View style={styles.cardActions}>
                  {bulletin.isNew && <View style={styles.newDot} />}
                  <TouchableOpacity onPress={() => toggleSave(bulletin.id)} style={styles.saveBtn}>
                    <Ionicons
                      name={saved.has(bulletin.id) ? "bookmark" : "bookmark-outline"}
                      size={18}
                      color={saved.has(bulletin.id) ? "#3B5BDB" : "#636366"}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Category pill + title */}
              <CategoryPill category={bulletin.category} />
              <Text style={styles.cardTitle}>{bulletin.title}</Text>
              <Text style={styles.cardSummary} numberOfLines={2}>{bulletin.summary}</Text>

              {/* Tags */}
              <View style={styles.tagRow}>
                {bulletin.tags.map((t) => (
                  <View key={t} style={styles.tag}>
                    <Text style={styles.tagText}>{t}</Text>
                  </View>
                ))}
              </View>

              {/* Read more */}
              <View style={styles.cardFooter}>
                <Text style={styles.readMore}>Read full bulletin</Text>
                <Ionicons name="chevron-forward" size={14} color="#3B5BDB" />
              </View>
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <Ionicons name="document-text-outline" size={40} color="#3C3C3E" />
            <Text style={{ color: "#FFF", marginTop: 12, fontSize: 16, fontWeight: "600" }}>No bulletins yet</Text>
            <Text style={{ color: "#636366", marginTop: 6, fontSize: 13, textAlign: "center", paddingHorizontal: 40 }}>Tap + to post the first church bulletin</Text>
          </View>
        }
      />

      {/* Detail View */}
      {selectedBulletin && (
        <View style={[StyleSheet.absoluteFill, styles.detailContainer]}>
          <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

          {/* Detail header */}
          <View style={[styles.detailHeader, { paddingTop: topPad }]}>
            <TouchableOpacity onPress={() => setSelectedBulletin(null)} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.detailHeaderTitle}>Bulletin</Text>
            <TouchableOpacity onPress={() => toggleSave(selectedBulletin.id)} style={styles.backBtn}>
              <Ionicons
                name={saved.has(selectedBulletin.id) ? "bookmark" : "bookmark-outline"}
                size={20}
                color={saved.has(selectedBulletin.id) ? "#3B5BDB" : "#8E8E93"}
              />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={[styles.detailScroll, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
            {/* Category + date */}
            <View style={styles.detailMeta}>
              <CategoryPill category={selectedBulletin.category} />
              <Text style={styles.detailDate}>{selectedBulletin.dateLabel}</Text>
            </View>

            <Text style={styles.detailTitle}>{selectedBulletin.title}</Text>
            <Text style={styles.detailSummary}>{selectedBulletin.summary}</Text>

            {/* Author */}
            <View style={styles.detailAuthorRow}>
              <AvatarCircle initials={selectedBulletin.authorInitials} color={selectedBulletin.authorColor} size={36} />
              <View>
                <Text style={styles.detailAuthorName}>{selectedBulletin.author}</Text>
                <Text style={styles.detailAuthorRole}>Posted {selectedBulletin.dateLabel}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Sections */}
            {selectedBulletin.sections.map((section, si) => (
              <View key={si} style={styles.detailSection}>
                <View style={styles.sectionHeadingRow}>
                  <View style={[styles.sectionAccent, { backgroundColor: CATEGORY_COLORS[selectedBulletin.category] || "#3B5BDB" }]} />
                  <Text style={styles.sectionHeading}>{section.heading}</Text>
                </View>
                {section.items.map((item, ii) => (
                  <View key={ii} style={styles.bulletRow}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.bulletText}>{item}</Text>
                  </View>
                ))}
              </View>
            ))}

            {/* Tags */}
            <View style={styles.detailTagRow}>
              {selectedBulletin.tags.map((t) => (
                <View key={t} style={styles.tag}>
                  <Text style={styles.tagText}>{t}</Text>
                </View>
              ))}
            </View>

            {/* Share / Save actions */}
            <View style={styles.detailActions}>
              <TouchableOpacity
                style={[styles.detailActionBtn, saved.has(selectedBulletin.id) && styles.detailActionBtnSaved]}
                onPress={() => toggleSave(selectedBulletin.id)}
              >
                <Ionicons
                  name={saved.has(selectedBulletin.id) ? "bookmark" : "bookmark-outline"}
                  size={18}
                  color={saved.has(selectedBulletin.id) ? "#3B5BDB" : "#FFF"}
                />
                <Text style={[styles.detailActionBtnText, saved.has(selectedBulletin.id) && { color: "#3B5BDB" }]}>
                  {saved.has(selectedBulletin.id) ? "Saved" : "Save Bulletin"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.detailActionBtn, { backgroundColor: "#1C1C1E", flex: 0.6 }]} onPress={() => { if (selectedBulletin) Share.share({ message: `📋 ${selectedBulletin.title}\n\n${selectedBulletin.summary}\n\nFrom SDA Community Church Bulletin` }); }}>
                <Feather name="share-2" size={16} color="#8E8E93" />
                <Text style={[styles.detailActionBtnText, { color: "#8E8E93" }]}>Share</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Add Bulletin Modal */}
      <Modal visible={addModalVisible} transparent animationType="slide" onRequestClose={() => setAddModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.addModalCard}>
            <Text style={styles.addTitle}>New Bulletin</Text>

            <TextInput
              style={styles.addInput}
              placeholder="Title"
              placeholderTextColor="#636366"
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <TextInput
              style={styles.addInput}
              placeholder="Your name (author)"
              placeholderTextColor="#636366"
              value={newAuthor}
              onChangeText={setNewAuthor}
            />
            <TextInput
              style={[styles.addInput, styles.addTextArea]}
              placeholder="Summary"
              placeholderTextColor="#636366"
              value={newSummary}
              onChangeText={setNewSummary}
              multiline
              numberOfLines={3}
            />

            {/* Category selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catChipsRow}>
              {(["announcement", "order-of-service", "notice", "event"] as const).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catChip, newCategory === cat && { backgroundColor: (CATEGORY_COLORS[cat] || "#3B5BDB") + "33", borderColor: CATEGORY_COLORS[cat] || "#3B5BDB" }]}
                  onPress={() => setNewCategory(cat)}
                >
                  <Text style={[styles.catChipText, newCategory === cat && { color: CATEGORY_COLORS[cat] || "#3B5BDB" }]}>
                    {CATEGORY_LABELS[cat]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.addBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBulletinBtn, !newTitle.trim() && styles.saveBtnDisabled]}
                disabled={!newTitle.trim()}
                onPress={handleCreateBulletin}
              >
                <Text style={styles.saveText}>Post Bulletin</Text>
              </TouchableOpacity>
            </View>
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
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  newBadge: { backgroundColor: "#3B5BDB", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  newBadgeText: { color: "#FFF", fontSize: 10, fontWeight: "700" },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  savedToggle: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 18, backgroundColor: "#1C1C1E" },
  savedToggleActive: { backgroundColor: "#3B5BDB22" },
  searchWrap: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#1C1C1E",
    borderRadius: 12, marginHorizontal: 16, marginBottom: 10, paddingHorizontal: 12, gap: 8,
  },
  searchInput: { flex: 1, color: "#FFF", fontSize: 15, paddingVertical: 10 },
  catRow: { marginBottom: 12, minHeight: 44 },
  catContent: { paddingHorizontal: 16, gap: 8, alignItems: "center" },
  catTab: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20,
    backgroundColor: "#1C1C1E", borderWidth: StyleSheet.hairlineWidth, borderColor: "#2C2C2E",
  },
  catTabActive: { backgroundColor: "#3B5BDB", borderColor: "#3B5BDB" },
  catTabText: { color: "#8E8E93", fontSize: 12, fontWeight: "500" },
  catTabTextActive: { color: "#FFF" },
  sectionHeader: {
    flexDirection: "row", alignItems: "center", gap: 6,
    marginTop: 6, marginBottom: 10,
  },
  sectionHeaderText: { color: "#3B5BDB", fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  card: {
    backgroundColor: "#111", borderRadius: 16, padding: 16,
    borderWidth: StyleSheet.hairlineWidth, borderColor: "#1C1C1E",
  },
  cardPinned: { borderColor: "#3B5BDB44" },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  cardAuthor: { color: "#FFF", fontSize: 13, fontWeight: "600" },
  cardDate: { color: "#636366", fontSize: 11, marginTop: 1 },
  cardActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  newDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#3B5BDB" },
  saveBtn: { padding: 4 },
  catPill: { alignSelf: "flex-start", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8 },
  catPillText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  cardTitle: { color: "#FFF", fontSize: 15, fontWeight: "700", lineHeight: 22, marginBottom: 6 },
  cardSummary: { color: "#8E8E93", fontSize: 13, lineHeight: 19, marginBottom: 10 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  tag: { backgroundColor: "#1C1C1E", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { color: "#636366", fontSize: 10, fontWeight: "500" },
  cardFooter: { flexDirection: "row", alignItems: "center", gap: 4 },
  readMore: { color: "#3B5BDB", fontSize: 12, fontWeight: "600" },
  // Detail view
  detailContainer: { flex: 1, backgroundColor: "#0A0A0A" },
  detailHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#1C1C1E",
  },
  detailHeaderTitle: { color: "#FFF", fontSize: 17, fontWeight: "600" },
  detailScroll: { paddingHorizontal: 20, paddingTop: 20 },
  detailMeta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  detailDate: { color: "#636366", fontSize: 12 },
  detailTitle: { color: "#FFF", fontSize: 20, fontWeight: "700", lineHeight: 28, marginBottom: 10 },
  detailSummary: { color: "#8E8E93", fontSize: 14, lineHeight: 22, marginBottom: 16 },
  detailAuthorRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  detailAuthorName: { color: "#FFF", fontSize: 14, fontWeight: "600" },
  detailAuthorRole: { color: "#636366", fontSize: 11, marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#2C2C2E", marginBottom: 20 },
  detailSection: { marginBottom: 24 },
  sectionHeadingRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  sectionAccent: { width: 3, height: 16, borderRadius: 2 },
  sectionHeading: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
  bulletDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: "#3C3C3E", marginTop: 8, flexShrink: 0 },
  bulletText: { color: "#DADADB", fontSize: 14, lineHeight: 22, flex: 1 },
  detailTagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 24 },
  detailActions: { flexDirection: "row", gap: 10 },
  detailActionBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: "#3B5BDB", borderRadius: 14, paddingVertical: 14,
  },
  detailActionBtnSaved: { backgroundColor: "#3B5BDB22" },
  detailActionBtnText: { color: "#FFF", fontSize: 14, fontWeight: "600" },
  addBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#3B5BDB",
    alignItems: "center", justifyContent: "center",
  },
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  addModalCard: {
    backgroundColor: "#1C1C1E", borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, gap: 12,
  },
  addTitle: { color: "#FFF", fontSize: 18, fontWeight: "700", marginBottom: 4 },
  addInput: {
    backgroundColor: "#2C2C2E", color: "#FFF", borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14,
  },
  addTextArea: { minHeight: 80, textAlignVertical: "top" },
  catChipsRow: { gap: 8, paddingVertical: 4 },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: "#2C2C2E", borderWidth: 1, borderColor: "#3C3C3E",
  },
  catChipText: { color: "#8E8E93", fontSize: 13, fontWeight: "500" },
  addBtnRow: { flexDirection: "row", gap: 12, marginTop: 4 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    backgroundColor: "#2C2C2E", alignItems: "center",
  },
  cancelText: { color: "#8E8E93", fontSize: 15, fontWeight: "600" },
  saveBulletinBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    backgroundColor: "#3B5BDB", alignItems: "center",
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
});
