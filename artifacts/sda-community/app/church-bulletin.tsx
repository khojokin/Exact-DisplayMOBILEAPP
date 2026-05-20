import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Platform, StatusBar, ScrollView, TextInput, Share,
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

const BULLETINS: Bulletin[] = [
  {
    id: "b1",
    title: "Sabbath Order of Service — May 17, 2026",
    category: "order-of-service",
    author: "Pastor James Osei",
    authorInitials: "PJ",
    authorColor: "#6B7B5A",
    date: "2026-05-17",
    dateLabel: "This Sabbath",
    isNew: true,
    isPinned: true,
    summary: "Order of service for our Sabbath morning worship. Theme: 'Walking in His Light.'",
    sections: [
      {
        heading: "Morning Worship — 9:30 AM",
        items: [
          "Prelude — Abigail Owusu (Organ)",
          "Processional Hymn — #229 'All Hail the Power of Jesus' Name'",
          "Welcome & Opening Prayer — Elder Ruth Nakamura",
          "Announcements",
          "Responsive Reading — Psalm 119:105–112",
          "Praise & Worship — SDA Praise Team",
          "Tithes & Offering — Deacon Samuel Boateng",
          "Children's Story — Sarah Owusu-Acheampong",
          "Prayer for the Sick & Shut-in",
          "Sermon: 'Walking in His Light' — Pastor James Osei",
          "Closing Hymn — #633 'When We All Get to Heaven'",
          "Benediction — Elder Philip Kojo",
        ],
      },
      {
        heading: "Afternoon Programme — 1:30 PM",
        items: [
          "Sabbath School Review — Elder Ruth Nakamura",
          "Youth Vespers — Daniel Amponsah",
          "Special Music — Abena Frempong",
          "Closing Prayer",
        ],
      },
    ],
    tags: ["Worship", "Order of Service", "Sabbath"],
    saved: false,
  },
  {
    id: "b2",
    title: "Church Anniversary Week — May 19–24, 2026",
    category: "announcement",
    author: "Pastor James Osei",
    authorInitials: "PJ",
    authorColor: "#6B7B5A",
    date: "2026-05-19",
    dateLabel: "Today",
    isNew: true,
    isPinned: true,
    summary: "Central SDA Church celebrates 25 years of faithful ministry this week. Join us for a week of special programmes, testimonies, and praise.",
    sections: [
      {
        heading: "Anniversary Schedule",
        items: [
          "Mon, May 19 — Anniversary Dinner & Testimonials, 6 PM (Fellowship Hall)",
          "Tue, May 20 — Special Evangelistic Meeting, 7 PM (Main Sanctuary)",
          "Wed, May 21 — Prayer & Fasting Day — Join via Zoom or in person",
          "Thu, May 22 — 'Then & Now' Photo Exhibition, 10 AM – 6 PM (Lobby)",
          "Fri, May 23 — Anniversary Vespers & Youth Concert, 6:30 PM",
          "Sat, May 24 — Grand Sabbath Anniversary Service, 9:30 AM",
        ],
      },
      {
        heading: "How to Participate",
        items: [
          "Sign up to share a testimony at the Anniversary Dinner",
          "Bring old church photos for the exhibition by Wednesday",
          "Volunteer to help with catering — contact Deaconess Grace",
          "Invite a friend or neighbour to any of the week's events",
        ],
      },
    ],
    tags: ["Anniversary", "Special Programme", "Community"],
    saved: true,
  },
  {
    id: "b3",
    title: "Pathfinder Induction Ceremony — June 7",
    category: "event",
    author: "Abena Frempong",
    authorInitials: "AF",
    authorColor: "#2A5A6A",
    date: "2026-05-18",
    dateLabel: "Yesterday",
    isNew: true,
    isPinned: false,
    summary: "Our Pathfinder Club welcomes 12 new members this year. All parents and church family are invited to the induction ceremony.",
    sections: [
      {
        heading: "Event Details",
        items: [
          "Date: Sabbath, June 7, 2026",
          "Time: 3:30 PM (after afternoon programme)",
          "Venue: Central SDA Church — Main Sanctuary",
          "Dress code: Pathfinder uniforms for club members; smart casual for guests",
        ],
      },
      {
        heading: "Programme",
        items: [
          "Opening March — Pathfinder Club",
          "Welcome & Introduction of New Members",
          "Pledge & Law Recitation",
          "Induction Ceremony",
          "Awards & Honour Badges Presentation",
          "Refreshments (Fellowship Hall)",
        ],
      },
      {
        heading: "RSVP & Contact",
        items: [
          "Please RSVP by June 1 to Abena Frempong",
          "New member parents: bring photo ID for registration",
          "Club meeting every Tuesday at 5 PM in the Youth Hall",
        ],
      },
    ],
    tags: ["Pathfinders", "Youth", "Event"],
    saved: false,
  },
  {
    id: "b4",
    title: "Health Ministry: FREE Wellness Screening",
    category: "notice",
    author: "Hannah Obeng",
    authorInitials: "HO",
    authorColor: "#6A3A2A",
    date: "2026-05-16",
    dateLabel: "May 16",
    isNew: false,
    isPinned: false,
    summary: "Free health screening and wellness consultations this Sabbath afternoon. Blood pressure, diabetes screening, BMI checks, and NEWSTART lifestyle advice available.",
    sections: [
      {
        heading: "Services Available",
        items: [
          "Blood pressure & pulse check",
          "Blood glucose (diabetes) screening",
          "BMI and body composition assessment",
          "Cholesterol awareness talk",
          "NEWSTART lifestyle counselling",
          "Plant-based nutrition Q&A with Dr. Emmanuel Dankwa",
        ],
      },
      {
        heading: "When & Where",
        items: [
          "Date: Sabbath, May 24 (Anniversary Sabbath)",
          "Time: 12:30 PM – 3:00 PM",
          "Location: Church Hall — Annex Room B",
          "No appointment needed — walk in",
          "All ages welcome including children",
        ],
      },
    ],
    tags: ["Health", "NEWSTART", "Free Event"],
    saved: false,
  },
  {
    id: "b5",
    title: "Sabbath School Q2 Lesson 8 — Summary & Notes",
    category: "announcement",
    author: "Elder Ruth Nakamura",
    authorInitials: "ER",
    authorColor: "#B8860B",
    date: "2026-05-15",
    dateLabel: "May 15",
    isNew: false,
    isPinned: false,
    summary: "Summary of this week's Sabbath School lesson on Sanctification and the Work of the Holy Spirit, with discussion questions for home study.",
    sections: [
      {
        heading: "Lesson Theme",
        items: [
          "Title: 'Sanctified by the Spirit'",
          "Memory Text: 1 Thessalonians 4:3 — 'For this is the will of God, your sanctification.'",
          "Key points: The Spirit's role in transformation, daily surrender, and the sanctified life",
        ],
      },
      {
        heading: "Discussion Questions",
        items: [
          "What is the difference between justification and sanctification?",
          "How does the Holy Spirit work in our daily choices and habits?",
          "Share a time you experienced the Spirit's transforming power in your life.",
          "How can we as a church better support each other's growth in holiness?",
        ],
      },
      {
        heading: "Study Resources",
        items: [
          "Adult Bible Study Guide — Q2 2026, Lesson 8",
          "Ellen G. White: 'Steps to Christ,' Chapter 10",
          "Hymn for the week: #313 'Just as I Am'",
        ],
      },
    ],
    tags: ["Sabbath School", "Bible Study", "Q2 2026"],
    saved: true,
  },
  {
    id: "b6",
    title: "Building Fund Update — May 2026",
    category: "notice",
    author: "Elder Philip Kojo",
    authorInitials: "PK",
    authorColor: "#2A6B4A",
    date: "2026-05-14",
    dateLabel: "May 14",
    isNew: false,
    isPinned: false,
    summary: "Praise the Lord — we have reached 68% of our building fund goal for the new fellowship hall extension. Thank you to all who have faithfully given.",
    sections: [
      {
        heading: "Fund Progress",
        items: [
          "Goal: GHC 450,000",
          "Raised to date: GHC 306,000 (68%)",
          "Remaining: GHC 144,000",
          "Next milestone target: GHC 360,000 by end of June",
        ],
      },
      {
        heading: "How to Give",
        items: [
          "Sunday offering — designated envelopes available at the welcome desk",
          "Bank transfer — details available from Elder Philip or the church office",
          "Online giving via the church website",
          "Pledges for specific items (chairs, AV equipment) — see the pledge board in the lobby",
        ],
      },
      {
        heading: "Construction Update",
        items: [
          "Foundation laid — June 2025",
          "Walls completed — November 2025",
          "Roofing expected — August 2026 (subject to funding)",
          "Interior fittings — to be announced",
        ],
      },
    ],
    tags: ["Building Fund", "Finance", "Notice"],
    saved: false,
  },
  {
    id: "b7",
    title: "Women's Ministry Retreat — June 14–16",
    category: "event",
    author: "Mary Adjei",
    authorInitials: "MA",
    authorColor: "#6B3A7A",
    date: "2026-05-12",
    dateLabel: "May 12",
    isNew: false,
    isPinned: false,
    summary: "Annual women's retreat at the Lakeside Conference Centre. Theme: 'Rooted in Grace.' Open to all women in the church aged 18 and above.",
    sections: [
      {
        heading: "Retreat Details",
        items: [
          "Dates: June 14 (Friday) to June 16 (Sunday), 2026",
          "Venue: Lakeside Adventist Conference Centre",
          "Theme: 'Rooted in Grace — Growing Deeper with God'",
          "Cost: GHC 380 per person (includes accommodation & meals)",
          "Bursary available for those in need — apply confidentially",
        ],
      },
      {
        heading: "Programme Highlights",
        items: [
          "Keynote speaker: Dr. Abena Yeboah — 'The Grace That Roots Us'",
          "Workshop: Spiritual Disciplines for the Busy Woman",
          "Worship & prayer evenings",
          "Nature walks and quiet reflection time",
          "Craft & fellowship activities",
          "Closing communion and recommitment service",
        ],
      },
      {
        heading: "Registration",
        items: [
          "Deadline: June 1, 2026",
          "Register with Mary Adjei or at the church office",
          "Deposit of GHC 100 to confirm your place",
          "Transport arranged from church — depart 2 PM on June 14",
        ],
      },
    ],
    tags: ["Women's Ministry", "Retreat", "Event"],
    saved: false,
  },
];

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

  const [activeCategory, setActiveCategory] = useState<BulletinCategory>("all");
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState<Set<string>>(
    new Set(BULLETINS.filter((b) => b.saved).map((b) => b.id))
  );
  const [selectedBulletin, setSelectedBulletin] = useState<Bulletin | null>(null);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const toggleSave = useCallback((id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const filtered = BULLETINS.filter((b) => {
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
  const newCount = BULLETINS.filter((b) => b.isNew).length;

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
            <Text style={{ color: "#636366", marginTop: 12, fontSize: 14 }}>No bulletins found</Text>
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
});
