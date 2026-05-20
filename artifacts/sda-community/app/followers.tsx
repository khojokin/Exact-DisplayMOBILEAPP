import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  StatusBar,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

interface Member {
  id: string;
  name: string;
  role?: string;
  roleCategory: "all" | "pastor" | "elder" | "deacon" | "member";
  description: string;
  color: string;
  isFollowing: boolean;
  streak?: number;
}

const ALL_MEMBERS: Member[] = [
  { id: "1", name: "Pastor James Osei",      role: "Pastor",  roleCategory: "pastor",  description: "Senior Pastor · SDA Church · Daily devotionals",          color: "#3B5BDB", isFollowing: true,  streak: 45 },
  { id: "2", name: "Elder Ruth Nakamura",    role: "Elder",   roleCategory: "elder",   description: "Elder · Sabbath School Director · Bible teacher",          color: "#B8860B", isFollowing: true,  streak: 30 },
  { id: "3", name: "David Mensah",                            roleCategory: "member",  description: "Pathfinder Leader · Youth Ministry · Adventurer",          color: "#C85200", isFollowing: false, streak: 7 },
  { id: "4", name: "Grace Adetokunbo",                        roleCategory: "member",  description: "Worship team · Photography · Hospitality",                 color: "#0E7B5B", isFollowing: true,  streak: 12 },
  { id: "5", name: "Samuel Boateng",         role: "Deacon",  roleCategory: "deacon",  description: "Deacon · Pathfinders · Bible study facilitator",           color: "#8B5E00", isFollowing: false, streak: 3 },
  { id: "6", name: "Abigail Owusu",                           roleCategory: "member",  description: "Choir director · Music ministry · Worship",                color: "#8B3A8B", isFollowing: true,  streak: 20 },
  { id: "7", name: "Joseph Asante",                           roleCategory: "member",  description: "Deacon · Bible student · Youth Adventurer",                color: "#4A5A7A", isFollowing: false },
  { id: "8", name: "Mary Adjei",                              roleCategory: "member",  description: "Women's Ministry · Prayer warrior · Teacher",              color: "#6B3A7A", isFollowing: true,  streak: 18 },
  { id: "9", name: "Elder Philip Kojo",      role: "Elder",   roleCategory: "elder",   description: "Elder · Finance Committee · Mentor",                       color: "#2A6B4A", isFollowing: false },
  { id: "10", name: "Sarah Owusu-Acheampong",                 roleCategory: "member",  description: "Children's Ministry · Sabbath School teacher",             color: "#7A3A3A", isFollowing: true },
];

const ROLE_COLOR: Record<string, string> = {
  Pastor: "#6B7B5A",
  Elder: "#B8860B",
  Deacon: "#3B5BDB",
};

const FILTERS = [
  { id: "all",    label: "All" },
  { id: "pastor", label: "Pastors" },
  { id: "elder",  label: "Elders" },
  { id: "deacon", label: "Deacons" },
  { id: "member", label: "Members" },
];

function AvatarCircle({ name, color, size = 46 }: { name: string; color: string; size?: number }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#FFF", fontWeight: "700", fontSize: size * 0.36 }}>{initials}</Text>
    </View>
  );
}

export default function FollowersScreen() {
  const insets = useSafeAreaInsets();
  const { type, username } = useLocalSearchParams<{ type?: string; username?: string }>();
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  const title = type === "following" ? "Following" : "Followers";
  const subtitle = username ? `${username}'s ${title.toLowerCase()}` : undefined;

  const [members, setMembers] = useState<Member[]>(ALL_MEMBERS);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  function toggleFollow(id: string) {
    Haptics.selectionAsync();
    setMembers((prev) => prev.map((m) => m.id === id ? { ...m, isFollowing: !m.isFollowing } : m));
  }

  const filtered = members.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === "all" || m.roleCategory === activeFilter;
    return matchSearch && matchFilter;
  });

  const followingCount = members.filter((m) => m.isFollowing).length;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle && <Text style={styles.headerSub}>{subtitle}</Text>}
        </View>
        <Text style={styles.memberCount}>{filtered.length}</Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={16} color="#636366" />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${title.toLowerCase()}...`}
          placeholderTextColor="#636366"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color="#636366" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersRow}
        contentContainerStyle={styles.filtersContent}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[styles.filterPill, activeFilter === f.id && styles.filterPillActive]}
            onPress={() => { Haptics.selectionAsync(); setActiveFilter(f.id); }}
          >
            <Text style={[styles.filterText, activeFilter === f.id && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}
        ItemSeparatorComponent={() => (
          <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: "#1C1C1E", marginLeft: 74 }} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color="#3C3C3E" />
            <Text style={styles.emptyText}>No {title.toLowerCase()} found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.8}
            onPress={() => router.push({ pathname: "/user-profile", params: { name: item.name } })}
          >
            <AvatarCircle name={item.name} color={item.color} />
            <View style={styles.info}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{item.name}</Text>
                {item.role && (
                  <View style={[styles.roleBadge, { backgroundColor: (ROLE_COLOR[item.role] ?? "#636366") + "33" }]}>
                    <Text style={[styles.roleText, { color: ROLE_COLOR[item.role] ?? "#636366" }]}>{item.role}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.desc} numberOfLines={1}>{item.description}</Text>
              {item.streak && (
                <Text style={styles.streak}>🔥 {item.streak} day streak</Text>
              )}
            </View>
            <TouchableOpacity
              style={[styles.followBtn, item.isFollowing && styles.followingBtn]}
              onPress={() => toggleFollow(item.id)}
              activeOpacity={0.75}
            >
              <Text style={[styles.followBtnText, item.isFollowing && styles.followingBtnText]}>
                {item.isFollowing ? "Following" : "Follow"}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
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
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
  headerSub: { color: "#8E8E93", fontSize: 12, marginTop: 1 },
  memberCount: { color: "#636366", fontSize: 14, width: 32, textAlign: "right" },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: { flex: 1, color: "#FFFFFF", fontSize: 15, paddingVertical: 10 },

  filtersRow: { marginTop: 10 },
  filtersContent: { paddingHorizontal: 14, gap: 8, paddingBottom: 10 },
  filterPill: {
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20,
    backgroundColor: "#1C1C1E", borderWidth: StyleSheet.hairlineWidth, borderColor: "#2C2C2E",
  },
  filterPillActive: { backgroundColor: "#4A6741", borderColor: "#6B7B5A" },
  filterText: { color: "#8E8E93", fontSize: 13, fontWeight: "500" },
  filterTextActive: { color: "#FFFFFF", fontWeight: "600" },

  row: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12, gap: 12,
  },
  info: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  name: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
  roleBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  roleText: { fontSize: 10, fontWeight: "600" },
  desc: { color: "#636366", fontSize: 12, marginBottom: 2 },
  streak: { color: "#8E8E93", fontSize: 11 },

  followBtn: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: "#1C1C1E", borderWidth: StyleSheet.hairlineWidth, borderColor: "#3C3C3E",
    minWidth: 82, alignItems: "center",
  },
  followingBtn: { backgroundColor: "#4A6741", borderColor: "#4A6741" },
  followBtnText: { color: "#AEAEB2", fontSize: 13, fontWeight: "600" },
  followingBtnText: { color: "#FFFFFF" },

  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { color: "#636366", fontSize: 16 },
});
