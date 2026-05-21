import React from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Platform, StatusBar,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAdmin } from "@/hooks/useAdmin";

const FAITH_ITEMS = [
  { id: "hymns", title: "SDA Hymnal", sub: "60+ hymns · Favorites · Hymn of the Day", icon: "musical-notes-outline", color: "#3B5BDB", route: "/hymns" },
  { id: "devotional", title: "Daily Devotional", sub: "Morning readings & reflections", icon: "sunny-outline", color: "#B8860B", route: "/devotional" },
  { id: "directory", title: "Church Directory", sub: "20 members · 9 ministries · 2 branches", icon: "people-outline", color: "#8B3A8B", route: "/church-directory" },
  { id: "bulletin", title: "Church Bulletin", sub: "Announcements, notices & order of service", icon: "newspaper-outline", color: "#C85200", route: "/church-bulletin" },
  { id: "sabbath", title: "Sabbath School", sub: "Q2 2026 Adult Study Guide", icon: "book-outline", color: "#0E7B5B", route: "/sabbath-school" },
  { id: "bible", title: "Bible", sub: "Read & search scripture", icon: "library-outline", color: "#B8860B", route: "/bible" },
  { id: "calendar", title: "Church Events", sub: "Upcoming services & programmes", icon: "calendar-outline", color: "#4A6741", route: "/church-events" },
];

const MEDIA_ITEMS = [
  { id: "podcast", title: "Podcasts", sub: "Sermons, devotionals & more", icon: "headset-outline", color: "#8B3A8B", route: "/podcast" },
  { id: "shorts", title: "Shorts", sub: "Quick faith clips to inspire", icon: "play-circle-outline", color: "#C85200", route: "/shorts" },
];

export default function ResourcesScreen() {
  const insets = useSafeAreaInsets();
  const { isAdmin } = useAdmin();
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  const mediaItems = isAdmin
    ? [
        ...MEDIA_ITEMS,
        {
          id: "meeting",
          title: "Meetings",
          sub: "Admin only · Create or join live meetings",
          icon: "videocam-outline",
          color: "#4A6741",
          route: "/meeting",
        },
      ]
    : MEDIA_ITEMS;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Resources</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Featured quick-access row */}
        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.quickCard} onPress={() => router.push("/hymns" as any)} activeOpacity={0.85}>
            <View style={[styles.quickIcon, { backgroundColor: "#3B5BDB22" }]}>
              <Ionicons name="musical-notes" size={22} color="#3B5BDB" />
            </View>
            <Text style={styles.quickLabel}>Hymns</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickCard} onPress={() => router.push("/devotional" as any)} activeOpacity={0.85}>
            <View style={[styles.quickIcon, { backgroundColor: "#B8860B22" }]}>
              <Ionicons name="sunny" size={22} color="#B8860B" />
            </View>
            <Text style={styles.quickLabel}>Devotional</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickCard} onPress={() => router.push("/church-directory" as any)} activeOpacity={0.85}>
            <View style={[styles.quickIcon, { backgroundColor: "#8B3A8B22" }]}>
              <Ionicons name="people" size={22} color="#8B3A8B" />
            </View>
            <Text style={styles.quickLabel}>Directory</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickCard} onPress={() => router.push("/bible" as any)} activeOpacity={0.85}>
            <View style={[styles.quickIcon, { backgroundColor: "#B8860B22" }]}>
              <Ionicons name="book" size={22} color="#B8860B" />
            </View>
            <Text style={styles.quickLabel}>Bible</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>FAITH RESOURCES</Text>
        <View style={styles.card}>
          {FAITH_ITEMS.map((item, i) => (
            <View key={item.id}>
              <TouchableOpacity style={styles.row} onPress={() => router.push(item.route as any)}>
                <View style={[styles.iconWrap, { backgroundColor: item.color + "22" }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowLabel}>{item.title}</Text>
                  <Text style={styles.rowSub}>{item.sub}</Text>
                </View>
                <Feather name="chevron-right" size={18} color="#636366" />
              </TouchableOpacity>
              {i < FAITH_ITEMS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>MEDIA & MEETINGS</Text>
        <View style={styles.mediaGrid}>
          {mediaItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.mediaCard}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.mediaIcon, { backgroundColor: item.color + "22" }]}>
                <Ionicons name={item.icon as any} size={28} color={item.color} />
              </View>
              <Text style={styles.mediaLabel}>{item.title}</Text>
              <Text style={styles.mediaSub}>{item.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>QUICK VERSE</Text>
        <View style={styles.verseCard}>
          <Ionicons name="text-outline" size={16} color="#6B7B5A" style={{ marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.verseText}>
              "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future."
            </Text>
            <Text style={styles.verseRef}>— Jeremiah 29:11</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  content: { paddingHorizontal: 16, paddingTop: 8 },
  quickRow: { flexDirection: "row", gap: 10, marginBottom: 4, marginTop: 8 },
  quickCard: {
    flex: 1, backgroundColor: "#111", borderRadius: 14, padding: 12,
    alignItems: "center", gap: 8,
  },
  quickIcon: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  quickLabel: { color: "#FFF", fontSize: 11, fontWeight: "600", textAlign: "center" },
  sectionLabel: {
    color: "#636366", fontSize: 11, fontWeight: "600", letterSpacing: 0.5,
    marginTop: 20, marginBottom: 6, marginLeft: 4,
  },
  card: { backgroundColor: "#111", borderRadius: 14, overflow: "hidden" },
  row: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16,
    paddingVertical: 14, gap: 12,
  },
  iconWrap: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rowText: { flex: 1 },
  rowLabel: { color: "#FFF", fontSize: 15, fontWeight: "600" },
  rowSub: { color: "#8E8E93", fontSize: 12, marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#2C2C2E", marginLeft: 66 },
  mediaGrid: { flexDirection: "row", gap: 10 },
  mediaCard: {
    flex: 1, backgroundColor: "#111", borderRadius: 14, padding: 14,
    alignItems: "flex-start", gap: 6,
  },
  mediaIcon: { width: 50, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  mediaLabel: { color: "#FFF", fontSize: 13, fontWeight: "700" },
  mediaSub: { color: "#8E8E93", fontSize: 10, lineHeight: 14 },
  verseCard: {
    flexDirection: "row", gap: 10, backgroundColor: "#4A674115", borderRadius: 14,
    padding: 16, borderLeftWidth: 3, borderLeftColor: "#6B7B5A",
  },
  verseText: { color: "#AEAEB2", fontSize: 14, fontStyle: "italic", lineHeight: 22 },
  verseRef: { color: "#6B7B5A", fontSize: 12, fontWeight: "600", marginTop: 6 },
});
