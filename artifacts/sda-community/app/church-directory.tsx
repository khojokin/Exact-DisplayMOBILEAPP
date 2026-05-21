import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Platform, StatusBar, TextInput, ScrollView, Modal,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

interface ChurchMember {
  id: string;
  name: string;
  initials: string;
  color: string;
  role: string;
  department: string;
  church: string;
  joinedYear: number;
  bio: string;
  phone?: string;
  email?: string;
  isFollowing: boolean;
  streak?: number;
  badges: string[];
}

const MEMBERS: ChurchMember[] = [
  {
    id: "m1", name: "Pastor James Osei", initials: "PJ", color: "#6B7B5A",
    role: "Senior Pastor", department: "Leadership",
    church: "Central SDA Church", joinedYear: 2008,
    bio: "Senior Pastor with over 18 years in ministry. Passionate about evangelism, discipleship, and growing families in Christ.",
    phone: "+1 (555) 001-0001", email: "pastor.james@centralsdachurch.org",
    isFollowing: true, streak: 45,
    badges: ["Pastor", "Evangelist", "Preacher"],
  },
  {
    id: "m2", name: "Elder Ruth Nakamura", initials: "ER", color: "#B8860B",
    role: "Church Elder", department: "Leadership",
    church: "Central SDA Church", joinedYear: 2011,
    bio: "Church Elder and Sabbath School Director. Committed to biblical teaching and nurturing new believers through the word.",
    email: "elder.ruth@centralsdachurch.org",
    isFollowing: true, streak: 30,
    badges: ["Elder", "Sabbath School"],
  },
  {
    id: "m3", name: "Elder Philip Kojo", initials: "PK", color: "#2A6B4A",
    role: "Church Elder", department: "Leadership",
    church: "Central SDA Church", joinedYear: 2009,
    bio: "Elder and Finance Committee chair. Believes strongly in stewardship and transparent church governance.",
    email: "elder.philip@centralsdachurch.org",
    isFollowing: false, streak: 22,
    badges: ["Elder", "Finance"],
  },
  {
    id: "m4", name: "Deacon David Mensah", initials: "DM", color: "#C85200",
    role: "Deacon", department: "Deacons",
    church: "Central SDA Church", joinedYear: 2015,
    bio: "Deacon and Pathfinder Club leader. Passionate about young people and outdoor ministry.",
    phone: "+1 (555) 004-0004",
    isFollowing: false, streak: 7,
    badges: ["Deacon", "Pathfinders", "Youth"],
  },
  {
    id: "m5", name: "Deacon Samuel Boateng", initials: "SB", color: "#8B5E00",
    role: "Deacon", department: "Deacons",
    church: "Central SDA Church", joinedYear: 2017,
    bio: "Deacon serving in hospitality and outreach. Loves connecting people to the church family.",
    isFollowing: false, streak: 3,
    badges: ["Deacon", "Outreach"],
  },
  {
    id: "m6", name: "Deaconess Grace Adetokunbo", initials: "GA", color: "#0E7B5B",
    role: "Deaconess", department: "Deacons",
    church: "Central SDA Church", joinedYear: 2013,
    bio: "Deaconess serving in worship and hospitality. Photography enthusiast and advocate for the health message.",
    isFollowing: true, streak: 12,
    badges: ["Deaconess", "Worship", "Health"],
  },
  {
    id: "m7", name: "Abigail Owusu", initials: "AO", color: "#8B3A8B",
    role: "Music Director", department: "Music Ministry",
    church: "Central SDA Church", joinedYear: 2014,
    bio: "Choir director and worship leader. Trained in classical music and gospel. Believes music is a powerful evangelistic tool.",
    email: "abigail.owusu@centralsdachurch.org",
    isFollowing: true, streak: 20,
    badges: ["Music", "Choir", "Worship Leader"],
  },
  {
    id: "m8", name: "Isaac Darko", initials: "ID", color: "#3B5BDB",
    role: "Praise Team Leader", department: "Music Ministry",
    church: "Central SDA Church", joinedYear: 2019,
    bio: "Praise team lead, guitarist, and songwriter. Loves blending contemporary and traditional SDA worship.",
    isFollowing: false, streak: 15,
    badges: ["Music", "Guitar", "Praise Team"],
  },
  {
    id: "m9", name: "Mary Adjei", initials: "MA", color: "#6B3A7A",
    role: "Women's Ministry Leader", department: "Women's Ministry",
    church: "Central SDA Church", joinedYear: 2012,
    bio: "Women's Ministry coordinator and prayer warrior. Runs weekly Bible study for women and mentors young mothers.",
    email: "mary.adjei@centralsdachurch.org",
    isFollowing: true, streak: 18,
    badges: ["Women's Ministry", "Prayer", "Mentor"],
  },
  {
    id: "m10", name: "Grace Mensah-Agyare", initials: "GM", color: "#4A3A6A",
    role: "Member", department: "Women's Ministry",
    church: "Central SDA Church", joinedYear: 2018,
    bio: "Active in Women's Ministry and community outreach. Social worker by profession, servant of God by calling.",
    isFollowing: false,
    badges: ["Women's Ministry", "Outreach"],
  },
  {
    id: "m11", name: "Joseph Asante", initials: "JA", color: "#4A5A7A",
    role: "Men's Ministry Leader", department: "Men's Ministry",
    church: "Central SDA Church", joinedYear: 2016,
    bio: "Men's Ministry chair and accountability group facilitator. Champions authentic brotherhood and fatherhood.",
    isFollowing: false, streak: 9,
    badges: ["Men's Ministry", "Leadership"],
  },
  {
    id: "m12", name: "Benjamin Ofori", initials: "BO", color: "#5A3A2A",
    role: "Member", department: "Men's Ministry",
    church: "Central SDA Church", joinedYear: 2020,
    bio: "New believer committed to growth. Part of the Men's Bible study group and serves in parking ministry.",
    isFollowing: false,
    badges: ["Men's Ministry"],
  },
  {
    id: "m13", name: "Sarah Owusu-Acheampong", initials: "SO", color: "#7A3A3A",
    role: "Children's Ministry Director", department: "Children's Ministry",
    church: "Central SDA Church", joinedYear: 2010,
    bio: "Children's Ministry director and Sabbath School teacher. 14 years investing in the faith of the next generation.",
    email: "sarah.oa@centralsdachurch.org",
    isFollowing: true, streak: 35,
    badges: ["Children's Ministry", "Sabbath School", "Teacher"],
  },
  {
    id: "m14", name: "Esther Amoah", initials: "EA", color: "#3A5A3A",
    role: "Children's Teacher", department: "Children's Ministry",
    church: "Central SDA Church", joinedYear: 2021,
    bio: "Trained primary school teacher who brings her expertise into Sabbath School. Loves crafts, stories, and making Jesus real for kids.",
    isFollowing: false,
    badges: ["Children's Ministry", "Teacher"],
  },
  {
    id: "m15", name: "Daniel Amponsah", initials: "DA", color: "#5A2A6A",
    role: "Youth Leader", department: "Youth Ministry",
    church: "Central SDA Church", joinedYear: 2016,
    bio: "Youth Ministry coordinator running weekly youth vespers and mentorship programs for teens and young adults.",
    email: "daniel.a@centralsdachurch.org",
    isFollowing: false, streak: 11,
    badges: ["Youth", "Mentor", "Leader"],
  },
  {
    id: "m16", name: "Abena Frempong", initials: "AF", color: "#2A5A6A",
    role: "Pathfinder Director", department: "Youth Ministry",
    church: "Central SDA Church", joinedYear: 2018,
    bio: "Pathfinder Club director with a passion for outdoor education, mission projects, and developing servant hearts in youth.",
    isFollowing: true, streak: 8,
    badges: ["Youth", "Pathfinders", "Director"],
  },
  {
    id: "m17", name: "Pastor Kwame Asare-Boateng", initials: "KA", color: "#3A2A7A",
    role: "Associate Pastor", department: "Leadership",
    church: "Northside SDA Church", joinedYear: 2020,
    bio: "Associate Pastor overseeing small groups and discipleship. Passionate about house churches and intimate fellowship.",
    email: "pastor.kwame@northsidesdachurch.org",
    isFollowing: false, streak: 19,
    badges: ["Pastor", "Small Groups", "Discipleship"],
  },
  {
    id: "m18", name: "Hannah Obeng", initials: "HO", color: "#6A3A2A",
    role: "Health Ministry Lead", department: "Health Ministry",
    church: "Central SDA Church", joinedYear: 2013,
    bio: "Registered nurse and Health Ministry coordinator. Champions the SDA health message through cooking classes and wellness seminars.",
    email: "hannah.obeng@centralsdachurch.org",
    isFollowing: true, streak: 24,
    badges: ["Health Ministry", "Nurse", "NEWSTART"],
  },
  {
    id: "m19", name: "Dr. Emmanuel Dankwa", initials: "ED", color: "#2A6A3A",
    role: "Community Health Advisor", department: "Health Ministry",
    church: "Central SDA Church", joinedYear: 2015,
    bio: "Medical doctor serving as health advisor for the church. Runs free health screening events and advocates for plant-based living.",
    isFollowing: false, streak: 6,
    badges: ["Health Ministry", "Doctor", "CHIP"],
  },
  {
    id: "m20", name: "Lydia Asare", initials: "LA", color: "#6A2A3A",
    role: "Communication Director", department: "Administration",
    church: "Central SDA Church", joinedYear: 2019,
    bio: "Church Communication director managing social media, bulletin, and website. Graphic designer and storyteller for the kingdom.",
    email: "comms@centralsdachurch.org",
    isFollowing: false, streak: 13,
    badges: ["Communication", "Media", "Design"],
  },
];

const DEPARTMENTS = [
  "All", "Leadership", "Deacons", "Music Ministry", "Women's Ministry",
  "Men's Ministry", "Children's Ministry", "Youth Ministry", "Health Ministry", "Administration",
];

const DEPT_COLORS: Record<string, string> = {
  Leadership: "#6B7B5A",
  Deacons: "#3B5BDB",
  "Music Ministry": "#8B3A8B",
  "Women's Ministry": "#C85200",
  "Men's Ministry": "#4A5A7A",
  "Children's Ministry": "#B8860B",
  "Youth Ministry": "#0E7B5B",
  "Health Ministry": "#FF6B35",
  Administration: "#636366",
};

const CHURCHES = ["All Churches", "Central SDA Church", "Northside SDA Church"];

const QUICK_ADD_DEPARTMENTS = DEPARTMENTS.filter((d) => d !== "All");

function AvatarCircle({ initials, color, size = 48 }: { initials: string; color: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#FFF", fontWeight: "700", fontSize: size * 0.33 }}>{initials}</Text>
    </View>
  );
}

function normalizeName(name: string) {
  return name.replace(/^(Pastor|Elder|Deaconess|Deacon|Dr\.)\s+/i, "").trim();
}

export default function ChurchDirectoryScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  const [members, setMembers] = useState<ChurchMember[]>(MEMBERS);
  const [search, setSearch] = useState("");
  const [activeDept, setActiveDept] = useState("All");
  const [activeChurch, setActiveChurch] = useState("All Churches");
  const [selectedMember, setSelectedMember] = useState<ChurchMember | null>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newDepartment, setNewDepartment] = useState("Leadership");
  const [newChurch, setNewChurch] = useState("Central SDA Church");
  const [following, setFollowing] = useState<Set<string>>(
    new Set(MEMBERS.filter((m) => m.isFollowing).map((m) => m.id))
  );

  const buildInitials = useCallback((name: string) => {
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "NA";
    return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join("");
  }, []);

  function handleCreateMember() {
    const name = newName.trim();
    const role = newRole.trim();
    if (!name || !role) return;

    const id = `m${Date.now()}`;
    const created: ChurchMember = {
      id,
      name,
      initials: buildInitials(name),
      color: DEPT_COLORS[newDepartment] || "#636366",
      role,
      department: newDepartment,
      church: newChurch,
      joinedYear: new Date().getFullYear(),
      bio: `${name} was added by the community directory editor.`,
      isFollowing: false,
      badges: [newDepartment],
    };

    setMembers((prev) => [created, ...prev]);
    setAddModalVisible(false);
    setNewName("");
    setNewRole("");
    setNewDepartment("Leadership");
    setNewChurch("Central SDA Church");
  }

  const toggleFollow = useCallback((id: string) => {
    setFollowing((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const filtered = members.filter((m) => {
    const matchSearch = search === "" ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase()) ||
      m.department.toLowerCase().includes(search.toLowerCase());
    const matchDept = activeDept === "All" || m.department === activeDept;
    const matchChurch = activeChurch === "All Churches" || m.church === activeChurch;
    return matchSearch && matchDept && matchChurch;
  });

  const leaderCount = members.filter((m) => ["Leadership", "Deacons"].includes(m.department)).length;
  const deptCount = new Set(members.map((m) => m.department)).size;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Church Directory</Text>
          <Text style={styles.headerSub}>{members.length} members · {deptCount} ministries</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setAddModalVisible(true)}>
          <Ionicons name="add" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Stats banner */}
      <View style={styles.statsBanner}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{members.length}</Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{leaderCount}</Text>
          <Text style={styles.statLabel}>Leaders</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{deptCount}</Text>
          <Text style={styles.statLabel}>Ministries</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>2</Text>
          <Text style={styles.statLabel}>Branches</Text>
        </View>
      </View>

      {/* Church filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.churchRow} contentContainerStyle={styles.chipContent}>
        {CHURCHES.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.chip, activeChurch === c && styles.chipActive]}
            onPress={() => setActiveChurch(c)}
          >
            {activeChurch === c && <Ionicons name="business-outline" size={12} color="#FFF" />}
            <Text style={[styles.chipText, activeChurch === c && styles.chipTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color="#636366" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, role, or ministry..."
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

      {/* Department filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.deptRow} contentContainerStyle={styles.chipContent}>
        {DEPARTMENTS.map((dept) => (
          <TouchableOpacity
            key={dept}
            style={[
              styles.deptChip,
              activeDept === dept && { backgroundColor: DEPT_COLORS[dept] || "#3B5BDB", borderColor: DEPT_COLORS[dept] || "#3B5BDB" },
            ]}
            onPress={() => setActiveDept(dept)}
          >
            {dept !== "All" && activeDept !== dept && (
              <View style={[styles.deptDot, { backgroundColor: DEPT_COLORS[dept] || "#636366" }]} />
            )}
            <Text style={[styles.deptChipText, activeDept === dept && { color: "#FFF" }]}>{dept}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results count */}
      <Text style={styles.resultCount}>
        {filtered.length} {filtered.length === 1 ? "member" : "members"}{activeDept !== "All" ? ` in ${activeDept}` : ""}
      </Text>

      <FlatList
        data={filtered}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 80 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.memberCard} onPress={() => setSelectedMember(item)} activeOpacity={0.85}>
            <AvatarCircle initials={item.initials} color={item.color} size={52} />
            <View style={styles.memberInfo}>
              <View style={styles.memberNameRow}>
                <Text style={styles.memberName}>{normalizeName(item.name)}</Text>
              </View>
              <View style={styles.memberBottom}>
                <Text style={styles.memberChurch}>{item.church.replace(" SDA Church", "")}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.followBtn, following.has(item.id) && styles.followBtnActive]}
              onPress={() => toggleFollow(item.id)}
            >
              <Text style={[styles.followBtnText, following.has(item.id) && styles.followBtnTextActive]}>
                {following.has(item.id) ? "Following" : "Follow"}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <Ionicons name="people-outline" size={40} color="#3C3C3E" />
            <Text style={{ color: "#636366", marginTop: 12, fontSize: 14 }}>No members found</Text>
          </View>
        }
      />

      {/* Member Profile Modal */}
      {selectedMember && (
        <View style={[StyleSheet.absoluteFill, styles.modalContainer]}>
          <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

          <View style={[styles.modalHeader, { paddingTop: topPad }]}>
            <TouchableOpacity onPress={() => setSelectedMember(null)} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Profile</Text>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.push({ pathname: "/user-profile", params: { name: normalizeName(selectedMember.name) } })}
            >
              <Feather name="external-link" size={18} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false}>
            {/* Profile top */}
            <View style={styles.profileTop}>
              <AvatarCircle initials={selectedMember.initials} color={selectedMember.color} size={80} />
              <Text style={styles.profileName}>{normalizeName(selectedMember.name)}</Text>
              <View style={styles.profileChurchRow}>
                <Ionicons name="business-outline" size={12} color="#636366" />
                <Text style={styles.profileChurch}>{selectedMember.church}</Text>
                <Text style={styles.profileDot}>·</Text>
                <Text style={styles.profileJoined}>Since {selectedMember.joinedYear}</Text>
              </View>

              {/* Follow button */}
              <TouchableOpacity
                style={[styles.profileFollowBtn, following.has(selectedMember.id) && styles.profileFollowBtnActive]}
                onPress={() => toggleFollow(selectedMember.id)}
              >
                <Ionicons
                  name={following.has(selectedMember.id) ? "checkmark" : "person-add-outline"}
                  size={16}
                  color={following.has(selectedMember.id) ? "#6B7B5A" : "#FFF"}
                />
                <Text style={[styles.profileFollowText, following.has(selectedMember.id) && { color: "#6B7B5A" }]}>
                  {following.has(selectedMember.id) ? "Following" : "Follow"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* About */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>ABOUT</Text>
              <Text style={styles.bioText}>{selectedMember.bio}</Text>
            </View>

            {/* Ministry */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>MINISTRY</Text>
              <View style={styles.infoRow}>
                <View style={[styles.infoIcon, { backgroundColor: (DEPT_COLORS[selectedMember.department] || "#636366") + "22" }]}>
                  <Ionicons name="people-outline" size={16} color={DEPT_COLORS[selectedMember.department] || "#636366"} />
                </View>
                <View>
                  <Text style={styles.infoLabel}>{selectedMember.department}</Text>
                  <Text style={styles.infoSub}>{selectedMember.church}</Text>
                </View>
              </View>
            </View>

            {/* Contact */}
            {(selectedMember.phone || selectedMember.email) && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>CONTACT</Text>
                {selectedMember.phone && (
                  <View style={styles.infoRow}>
                    <View style={[styles.infoIcon, { backgroundColor: "#6B7B5A22" }]}>
                      <Ionicons name="call-outline" size={16} color="#6B7B5A" />
                    </View>
                    <View>
                      <Text style={styles.infoLabel}>{selectedMember.phone}</Text>
                      <Text style={styles.infoSub}>Phone</Text>
                    </View>
                  </View>
                )}
                {selectedMember.email && (
                  <View style={styles.infoRow}>
                    <View style={[styles.infoIcon, { backgroundColor: "#3B5BDB22" }]}>
                      <Ionicons name="mail-outline" size={16} color="#3B5BDB" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.infoLabel} numberOfLines={1}>{selectedMember.email}</Text>
                      <Text style={styles.infoSub}>Email</Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Actions */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => { setSelectedMember(null); router.push({ pathname: "/dm/[id]", params: { id: selectedMember.id } }); }}
              >
                <Ionicons name="chatbubble-outline" size={18} color="#FFF" />
                <Text style={styles.actionBtnText}>Message</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}

      <Modal visible={addModalVisible} transparent animationType="slide" onRequestClose={() => setAddModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.addModalCard}>
            <Text style={styles.addTitle}>Add Directory Member</Text>

            <TextInput
              style={styles.addInput}
              placeholder="Full name"
              placeholderTextColor="#636366"
              value={newName}
              onChangeText={setNewName}
            />
            <TextInput
              style={styles.addInput}
              placeholder="Role (e.g. Youth Leader)"
              placeholderTextColor="#636366"
              value={newRole}
              onChangeText={setNewRole}
            />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.inlineChips}>
              {QUICK_ADD_DEPARTMENTS.map((dept) => (
                <TouchableOpacity
                  key={dept}
                  style={[styles.inlineChip, newDepartment === dept && styles.inlineChipActive]}
                  onPress={() => setNewDepartment(dept)}
                >
                  <Text style={[styles.inlineChipText, newDepartment === dept && styles.inlineChipTextActive]}>{dept}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.inlineChips}>
              {CHURCHES.filter((c) => c !== "All Churches").map((church) => (
                <TouchableOpacity
                  key={church}
                  style={[styles.inlineChip, newChurch === church && styles.inlineChipActive]}
                  onPress={() => setNewChurch(church)}
                >
                  <Text style={[styles.inlineChipText, newChurch === church && styles.inlineChipTextActive]}>{church}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.addRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, (!newName.trim() || !newRole.trim()) && styles.saveBtnDisabled]}
                disabled={!newName.trim() || !newRole.trim()}
                onPress={handleCreateMember}
              >
                <Text style={styles.saveText}>Add Member</Text>
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
  headerCenter: { alignItems: "center" },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  headerSub: { color: "#636366", fontSize: 11, marginTop: 1 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1C1C1E",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2C2C2E",
  },
  statsBanner: {
    flexDirection: "row", marginHorizontal: 16, marginBottom: 12,
    backgroundColor: "#111", borderRadius: 14, padding: 14,
  },
  statItem: { flex: 1, alignItems: "center" },
  statNum: { color: "#FFF", fontSize: 20, fontWeight: "700" },
  statLabel: { color: "#636366", fontSize: 10, marginTop: 2 },
  statDivider: { width: StyleSheet.hairlineWidth, backgroundColor: "#2C2C2E" },
  churchRow: { marginBottom: 6, minHeight: 40 },
  chipContent: { paddingHorizontal: 16, paddingVertical: 4, gap: 8, alignItems: "center" },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18,
    backgroundColor: "#1C1C1E", borderWidth: StyleSheet.hairlineWidth, borderColor: "#2C2C2E",
  },
  chipActive: { backgroundColor: "#6B7B5A", borderColor: "#6B7B5A" },
  chipText: { color: "#8E8E93", fontSize: 13, fontWeight: "500" },
  chipTextActive: { color: "#FFF" },
  searchWrap: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#1C1C1E",
    borderRadius: 12, marginHorizontal: 16, marginBottom: 10, paddingHorizontal: 12, gap: 8,
  },
  searchInput: { flex: 1, color: "#FFF", fontSize: 15, paddingVertical: 10 },
  deptRow: { marginBottom: 8, minHeight: 44 },
  deptChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: "#1C1C1E", borderWidth: StyleSheet.hairlineWidth, borderColor: "#2C2C2E",
  },
  deptDot: { width: 6, height: 6, borderRadius: 3 },
  deptChipText: { color: "#8E8E93", fontSize: 12, fontWeight: "500" },
  resultCount: { color: "#636366", fontSize: 12, marginHorizontal: 16, marginBottom: 10 },
  memberCard: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#111",
    borderRadius: 14, padding: 14, gap: 12,
  },
  memberInfo: { flex: 1 },
  memberNameRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  memberName: { color: "#FFF", fontSize: 14, fontWeight: "600", flex: 1 },
  memberBottom: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  memberChurch: { color: "#636366", fontSize: 10 },
  followBtn: {
    borderWidth: 1, borderColor: "#2C2C2E", borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7, backgroundColor: "#1C1C1E",
  },
  followBtnActive: { backgroundColor: "#6B7B5A22", borderColor: "#6B7B5A55" },
  followBtnText: { color: "#FFF", fontSize: 12, fontWeight: "600" },
  followBtnTextActive: { color: "#6B7B5A" },
  // Modal
  modalContainer: { flex: 1, backgroundColor: "#0A0A0A" },
  modalHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#1C1C1E",
  },
  modalHeaderTitle: { color: "#FFF", fontSize: 17, fontWeight: "600" },
  profileTop: { alignItems: "center", padding: 24, paddingBottom: 16 },
  profileName: { color: "#FFF", fontSize: 22, fontWeight: "700", marginTop: 14, marginBottom: 8 },
  profileChurchRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16 },
  profileChurch: { color: "#636366", fontSize: 12 },
  profileDot: { color: "#636366", fontSize: 12 },
  profileJoined: { color: "#636366", fontSize: 12 },
  profileFollowBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#3B5BDB", borderRadius: 22,
    paddingHorizontal: 24, paddingVertical: 10,
  },
  profileFollowBtnActive: { backgroundColor: "#1C1C1E" },
  profileFollowText: { color: "#FFF", fontSize: 14, fontWeight: "600" },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionLabel: {
    color: "#636366", fontSize: 11, fontWeight: "600", letterSpacing: 0.5,
    marginBottom: 12, textTransform: "uppercase",
  },
  bioText: { color: "#DADADB", fontSize: 14, lineHeight: 22 },
  infoRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    marginBottom: 12,
  },
  infoIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  infoLabel: { color: "#FFF", fontSize: 14, fontWeight: "500" },
  infoSub: { color: "#636366", fontSize: 11, marginTop: 1 },
  actionRow: { flexDirection: "row", gap: 10, paddingHorizontal: 20, marginTop: 4 },
  actionBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: "#3B5BDB", borderRadius: 14, paddingVertical: 14,
  },
  actionBtnText: { color: "#FFF", fontSize: 14, fontWeight: "600" },
  overlay: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "flex-end",
  },
  addModalCard: {
    backgroundColor: "#111",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
    gap: 10,
  },
  addTitle: { color: "#FFF", fontSize: 18, fontWeight: "700", marginBottom: 4 },
  addInput: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#FFF",
    fontSize: 14,
  },
  inlineChips: { gap: 8, paddingVertical: 4 },
  inlineChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#1C1C1E",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2C2C2E",
  },
  inlineChipActive: {
    backgroundColor: "#3B5BDB",
    borderColor: "#3B5BDB",
  },
  inlineChipText: { color: "#8E8E93", fontSize: 12, fontWeight: "600" },
  inlineChipTextActive: { color: "#FFF" },
  addRow: { flexDirection: "row", gap: 10, marginTop: 6 },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelText: { color: "#8E8E93", fontWeight: "600" },
  saveBtn: {
    flex: 1,
    backgroundColor: "#3B5BDB",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveBtnDisabled: { backgroundColor: "#2C2C2E" },
  saveText: { color: "#FFF", fontWeight: "700" },
});
