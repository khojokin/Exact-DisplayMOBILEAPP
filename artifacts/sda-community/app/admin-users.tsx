import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAdmin } from "@/hooks/useAdmin";
import { fetchAdminUsers, updateUserRole, type AdminUser } from "@/lib/admin-api";

const ROLES = ["member", "deacon", "elder", "pastor", "youth_leader", "admin"] as const;
type Role = (typeof ROLES)[number];

const ROLE_COLORS: Record<string, string> = {
  admin:       "#FF453A",
  pastor:      "#6B7B5A",
  elder:       "#B8860B",
  deacon:      "#3B5BDB",
  youth_leader:"#C85200",
  member:      "#636366",
};

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function AdminUsersScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const { isAdmin, loading: adminLoading } = useAdmin();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(false);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      Alert.alert("Access Denied", "Admins only.");
      router.back();
    }
  }, [isAdmin, adminLoading]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchAdminUsers({ limit: 100 });
      setUsers(result.users);
      setTotal(result.total);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!adminLoading && isAdmin) load();
  }, [isAdmin, adminLoading, load]);

  const filtered = users.filter((u) =>
    !search ||
    u.displayName.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  async function handleRoleChange(user: AdminUser, newRole: Role) {
    try {
      setUpdatingRole(true);
      await updateUserRole(user.id, newRole);
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, role: newRole } : u));
      setRoleModalVisible(false);
      setSelectedUser(null);
      Alert.alert("Updated", `${user.displayName} is now a ${newRole.replace("_", " ")}.`);
    } catch (err: any) {
      Alert.alert("Failed", err?.message ?? "Could not update role.");
    } finally {
      setUpdatingRole(false);
    }
  }

  if (adminLoading || loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#4B7BEC" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Management</Text>
        <TouchableOpacity onPress={load} style={styles.iconBtn}>
          <Ionicons name="refresh-outline" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statPill}>
          <Text style={styles.statValue}>{total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statPill}>
          <Text style={[styles.statValue, { color: "#6B7B5A" }]}>
            {users.filter((u) => u.role === "pastor" || u.role === "elder").length}
          </Text>
          <Text style={styles.statLabel}>Leadership</Text>
        </View>
        <View style={styles.statPill}>
          <Text style={[styles.statValue, { color: "#FF453A" }]}>
            {users.filter((u) => u.role === "admin").length}
          </Text>
          <Text style={styles.statLabel}>Admins</Text>
        </View>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={16} color="#636366" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, username or email…"
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

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: insets.bottom + 40, gap: 8 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#3C3C3E" />
            <Text style={styles.emptyText}>
              {search ? "No users match your search." : "No users found in the database."}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.userCard}
            onPress={() => { setSelectedUser(item); setRoleModalVisible(true); }}
          >
            <View style={[styles.avatar, { backgroundColor: ROLE_COLORS[item.role] + "33" }]}>
              <Text style={[styles.avatarText, { color: ROLE_COLORS[item.role] }]}>{initials(item.displayName)}</Text>
            </View>
            <View style={styles.userInfo}>
              <View style={styles.userNameRow}>
                <Text style={styles.userName}>{item.displayName}</Text>
                {item.isVerified && <Ionicons name="checkmark-circle" size={14} color="#4B7BEC" />}
              </View>
              <Text style={styles.userHandle}>@{item.username}</Text>
              <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>
            </View>
            <View style={styles.userRight}>
              <View style={[styles.roleBadge, { backgroundColor: ROLE_COLORS[item.role] + "22" }]}>
                <Text style={[styles.roleText, { color: ROLE_COLORS[item.role] }]}>
                  {item.role.replace("_", " ")}
                </Text>
              </View>
              <Text style={styles.joinDate}>{formatDate(item.createdAt)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal
        visible={roleModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => !updatingRole && setRoleModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => !updatingRole && setRoleModalVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.sheet}>
            <View style={styles.sheetHandle} />
            {selectedUser && (
              <>
                <View style={styles.sheetUserRow}>
                  <View style={[styles.avatar, { backgroundColor: ROLE_COLORS[selectedUser.role] + "33" }]}>
                    <Text style={[styles.avatarText, { color: ROLE_COLORS[selectedUser.role] }]}>
                      {initials(selectedUser.displayName)}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.sheetUserName}>{selectedUser.displayName}</Text>
                    <Text style={styles.sheetUserEmail}>{selectedUser.email}</Text>
                  </View>
                </View>
                <Text style={styles.sheetSectionLabel}>CHANGE ROLE</Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {ROLES.map((role) => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.roleOption,
                        selectedUser.role === role && styles.roleOptionActive,
                      ]}
                      onPress={() => handleRoleChange(selectedUser, role)}
                      disabled={updatingRole || selectedUser.role === role}
                    >
                      <View style={[styles.roleOptionDot, { backgroundColor: ROLE_COLORS[role] }]} />
                      <Text style={[styles.roleOptionText, selectedUser.role === role && { color: ROLE_COLORS[role] }]}>
                        {role.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </Text>
                      {selectedUser.role === role && (
                        <Ionicons name="checkmark-circle" size={18} color={ROLE_COLORS[role]} />
                      )}
                      {updatingRole && selectedUser.role !== role && (
                        <ActivityIndicator size="small" color="#636366" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setRoleModalVisible(false)}
                  disabled={updatingRole}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
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
  iconBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginBottom: 12 },
  statPill: { flex: 1, backgroundColor: "#111", borderRadius: 12, padding: 12, alignItems: "center", gap: 2 },
  statValue: { color: "#FFF", fontSize: 20, fontWeight: "800" },
  statLabel: { color: "#8E8E93", fontSize: 11, fontWeight: "600" },
  searchBox: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#1C1C1E",
    borderRadius: 12, marginHorizontal: 16, marginBottom: 8,
    paddingHorizontal: 12, gap: 8,
  },
  searchInput: { flex: 1, color: "#FFF", fontSize: 15, paddingVertical: 10 },
  emptyState: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { color: "#636366", fontSize: 15, textAlign: "center" },
  userCard: {
    backgroundColor: "#111", borderRadius: 14, padding: 14,
    flexDirection: "row", alignItems: "center", gap: 12,
    borderWidth: StyleSheet.hairlineWidth, borderColor: "#2C2C2E",
  },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarText: { fontWeight: "700", fontSize: 16 },
  userInfo: { flex: 1, gap: 2 },
  userNameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  userName: { color: "#FFF", fontSize: 15, fontWeight: "600" },
  userHandle: { color: "#636366", fontSize: 12 },
  userEmail: { color: "#8E8E93", fontSize: 11 },
  userRight: { alignItems: "flex-end", gap: 4 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  roleText: { fontSize: 11, fontWeight: "600" },
  joinDate: { color: "#636366", fontSize: 10 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#1C1C1E", borderTopLeftRadius: 22, borderTopRightRadius: 22,
    paddingHorizontal: 20, paddingBottom: Platform.OS === "ios" ? 36 : 24, paddingTop: 8,
    maxHeight: "70%",
  },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: "#3C3C3E", alignSelf: "center", marginBottom: 20 },
  sheetUserRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  sheetUserName: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  sheetUserEmail: { color: "#8E8E93", fontSize: 12 },
  sheetSectionLabel: { color: "#636366", fontSize: 11, fontWeight: "600", letterSpacing: 0.5, marginBottom: 10 },
  roleOption: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#2C2C2E",
  },
  roleOptionActive: { backgroundColor: "#1C1C1E", marginHorizontal: -20, paddingHorizontal: 20, borderRadius: 10 },
  roleOptionDot: { width: 10, height: 10, borderRadius: 5 },
  roleOptionText: { flex: 1, color: "#FFF", fontSize: 15, fontWeight: "500" },
  cancelBtn: { backgroundColor: "#2C2C2E", borderRadius: 14, height: 52, alignItems: "center", justifyContent: "center", marginTop: 16 },
  cancelBtnText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
});
