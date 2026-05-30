import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { supabase } from "@/lib/supabase";

interface Member {
  id: string;
  name: string;
  initials: string;
  role?: string;
  roleCategory: "all" | "pastor" | "elder" | "deacon" | "member";
  description: string;
  color: string;
  isFollowing: boolean;
  streak?: number;
}

const SEED_MEMBERS: Member[] = [
  { id: "1",  name: "Pastor James Osei",       initials: "JO", role: "Pastor",       roleCategory: "pastor",  description: "Lead Pastor · Accra Central SDA",       color: "#3B5BDB", isFollowing: true,  streak: 45 },
  { id: "2",  name: "Pastor Ruth Nakamura",     initials: "RN", role: "Pastor",       roleCategory: "pastor",  description: "Youth & Young Adults Pastor",            color: "#6264A7", isFollowing: false, streak: 30 },
  { id: "3",  name: "Elder Benjamin Asare",     initials: "BA", role: "Elder",        roleCategory: "elder",   description: "Head Elder · Community Outreach",        color: "#B8860B", isFollowing: true,  streak: 22 },
  { id: "4",  name: "Elder Martha Mensah",      initials: "MM", role: "Elder",        roleCategory: "elder",   description: "Elder · Sabbath School Superintendent",  color: "#C85200", isFollowing: false, streak: 18 },
  { id: "5",  name: "Elder Paul Boateng",       initials: "PB", role: "Elder",        roleCategory: "elder",   description: "Elder · Pathfinders & Adventurers",     color: "#0E7B5B", isFollowing: false },
  { id: "6",  name: "Deacon Samuel Kwame",      initials: "SK", role: "Deacon",       roleCategory: "deacon",  description: "Head Deacon · Worship & Facilities",    color: "#4A6741", isFollowing: true  },
  { id: "7",  name: "Deaconess Grace Adetokunbo", initials: "GA", role: "Deacon",     roleCategory: "deacon",  description: "Deaconess · Health Ministry",            color: "#B33A3A", isFollowing: false },
  { id: "8",  name: "Deacon David Frimpong",    initials: "DF", role: "Deacon",       roleCategory: "deacon",  description: "Deacon · Media & Technology",            color: "#3B5BDB", isFollowing: false },
  { id: "9",  name: "Emmanuel Darko",           initials: "ED", roleCategory: "member", description: "Worship Team · Choir Director",             color: "#6264A7", isFollowing: true,  streak: 12 },
  { id: "10", name: "Abigail Owusu",            initials: "AO", roleCategory: "member", description: "Sabbath School Teacher · Children's Ministry", color: "#B8860B", isFollowing: false, streak: 8 },
  { id: "11", name: "Kweku Asiedu",             initials: "KA", roleCategory: "member", description: "Community Service Volunteer",                color: "#0E7B5B", isFollowing: false },
  { id: "12", name: "Priscilla Amankwah",       initials: "PA", roleCategory: "member", description: "Youth Leader · Small Groups Facilitator",    color: "#C85200", isFollowing: true },
  { id: "13", name: "Daniel Oppong",            initials: "DO", roleCategory: "member", description: "Music Ministry · Guitarist",                  color: "#4A6741", isFollowing: false, streak: 5 },
  { id: "14", name: "Nana Adjoa Asante",        initials: "NA", roleCategory: "member", description: "Prayer Warrior · Intercessory Team",          color: "#B33A3A", isFollowing: false, streak: 34 },
  { id: "15", name: "Kwabena Yeboah",           initials: "KY", roleCategory: "member", description: "SDA Student Union President",                 color: "#3B5BDB", isFollowing: true  },
  { id: "16", name: "Esther Boakye",            initials: "EB", roleCategory: "member", description: "Health & Temperance Committee Member",        color: "#6264A7", isFollowing: false },
  { id: "17", name: "Justice Amponsah",         initials: "JA", roleCategory: "member", description: "Pathfinders Club Director",                   color: "#B8860B", isFollowing: false },
  { id: "18", name: "Mavis Sarpong",            initials: "MS", roleCategory: "member", description: "Women's Ministry Coordinator",                color: "#0E7B5B", isFollowing: false, streak: 15 },
  { id: "19", name: "Kofi Brempong",            initials: "KB", roleCategory: "member", description: "AY Society Leader · Online Ministry",         color: "#C85200", isFollowing: false },
  { id: "20", name: "Akosua Frimpong",          initials: "AF", roleCategory: "member", description: "Choir Member · Worship Singer",               color: "#4A6741", isFollowing: true,  streak: 7 },
];

const FILTERS = [
  { id: "all",    label: "All"     },
  { id: "pastor", label: "Pastors" },
  { id: "elder",  label: "Elders"  },
  { id: "deacon", label: "Deacons" },
  { id: "member", label: "Members" },
];

const ROLE_COLORS: Record<string, string> = {
  Pastor:  "#6B7B5A",
  Elder:   "#B8860B",
  Deacon:  "#3B5BDB",
};

function AvatarCircle({ initials, color, size = 46 }: { initials: string; color: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#FFF", fontWeight: "700", fontSize: size * 0.36 }}>{initials}</Text>
    </View>
  );
}

export default function MembersScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [members, setMembers] = useState<Member[]>(SEED_MEMBERS);
  const [loading, setLoading] = useState(false);

  const loadFromSupabase = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, username, bio, role, is_following")
        .order("created_at", { ascending: false })
        .limit(200);

      if (data && data.length > 0) {
        const roleMap: Record<string, Member["roleCategory"]> = {
          pastor: "pastor", elder: "elder", deacon: "deacon",
        };
        const colors = ["#3B5BDB", "#6264A7", "#B8860B", "#0E7B5B", "#4A6741", "#C85200", "#B33A3A"];
        setMembers(
          data.map((p: any, i: number) => {
            const name: string = p.full_name ?? p.username ?? "Member";
            const inits = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
            const role = p.role as string | undefined;
            return {
              id: String(p.id),
              name,
              initials: inits,
              role: role ? role.charAt(0).toUpperCase() + role.slice(1) : undefined,
              roleCategory: roleMap[role ?? ""] ?? "member",
              description: p.bio ?? "SDA Community Member",
              color: colors[i % colors.length],
              isFollowing: p.is_following ?? false,
            };
          })
        );
      }
    } catch {
      // keep seed list
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadFromSupabase(); }, [loadFromSupabase]);

  function toggleFollow(id: string) {
    Haptics.selectionAsync();
    setMembers((prev) => prev.map((m) => m.id === id ? { ...m, isFollowing: !m.isFollowing } : m));
  }

  const filtered = members.filter((m) => {
    const matchFilter = activeFilter === "all" || m.roleCategory === activeFilter;
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.description.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Members</Text>
        <Text style={styles.memberCount}>{filtered.length}</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={16} color="#636366" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search members..."
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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContent}
        style={styles.filtersRow}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[styles.filterPill, activeFilter === f.id && styles.filterPillActive]}
            onPress={() => { Haptics.selectionAsync(); setActiveFilter(f.id); }}
          >
            <Text style={[styles.filterText, activeFilter === f.id && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#4B7BEC" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.memberItem}
              activeOpacity={0.8}
              onPress={() => router.push({ pathname: "/user-profile", params: { name: item.name } })}
            >
              <AvatarCircle initials={item.initials} color={item.color} />
              <View style={styles.memberInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.memberName}>{item.name}</Text>
                  {item.role && (
                    <View style={[styles.roleBadge, { backgroundColor: (ROLE_COLORS[item.role] ?? "#636366") + "22" }]}>
                      <Text style={[styles.roleText, { color: ROLE_COLORS[item.role] ?? "#636366" }]}>{item.role}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.memberDesc} numberOfLines={1}>{item.description}</Text>
                {item.streak && item.streak > 7 && (
                  <View style={styles.streakRow}>
                    <Ionicons name="flame-outline" size={11} color="#FF9F0A" />
                    <Text style={styles.streakText}>{item.streak}-day streak</Text>
                  </View>
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
          ItemSeparatorComponent={() => (
            <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: "#1C1C1E", marginLeft: 74 }} />
          )}
          contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 120 : insets.bottom + 80 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#3C3C3E" />
              <Text style={styles.emptyText}>No members found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 12, paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#2C2C2E",
  },
  backBtn: { padding: 4, width: 40 },
  headerTitle: { flex: 1, textAlign: "center", color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
  memberCount: { width: 40, textAlign: "right", color: "#636366", fontSize: 14 },
  searchContainer: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#1C1C1E",
    borderRadius: 12, marginHorizontal: 16, marginTop: 12,
    paddingHorizontal: 12, gap: 8,
  },
  searchInput: { flex: 1, color: "#FFFFFF", fontSize: 15, paddingVertical: 10 },
  filtersRow: { marginTop: 10 },
  filtersContent: { paddingLeft: 14, paddingRight: 22, gap: 8, paddingBottom: 10, alignItems: "center" },
  filterPill: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    backgroundColor: "#1C1C1E", borderWidth: StyleSheet.hairlineWidth, borderColor: "#2C2C2E",
  },
  filterPillActive: { backgroundColor: "#4A6741", borderColor: "#6B7B5A" },
  filterText: { color: "#8E8E93", fontSize: 13, fontWeight: "500" },
  filterTextActive: { color: "#FFFFFF", fontWeight: "600" },
  memberItem: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12, gap: 12,
  },
  memberInfo: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2, flexWrap: "wrap" },
  memberName: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
  roleBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  roleText: { fontSize: 10, fontWeight: "600" },
  memberDesc: { color: "#636366", fontSize: 12, marginBottom: 2 },
  streakRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  streakText: { color: "#FF9F0A", fontSize: 11 },
  followBtn: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: "#1C1C1E", borderWidth: StyleSheet.hairlineWidth, borderColor: "#3C3C3E",
    minWidth: 82, alignItems: "center",
  },
  followingBtn: { backgroundColor: "#4A6741", borderColor: "#4A6741" },
  followBtnText: { color: "#AEAEB2", fontSize: 13, fontWeight: "600" },
  followingBtnText: { color: "#FFFFFF" },
  emptyState: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { color: "#636366", fontSize: 16 },
});
