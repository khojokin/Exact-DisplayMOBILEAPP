import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Platform, StatusBar, Switch, Alert,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function PrivacySettingsScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const [privateAccount, setPrivateAccount] = useState(false);
  const [showActivity, setShowActivity] = useState(true);
  const [allowDMs, setAllowDMs] = useState(true);
  const [showOnline, setShowOnline] = useState(true);
  const [mentionsFrom, setMentionsFrom] = useState<"everyone"|"followers">("everyone");

  const Row = ({ label, sub, value, onToggle }: { label: string; sub?: string; value: boolean; onToggle: (v: boolean) => void }) => (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub && <Text style={styles.rowSub}>{sub}</Text>}
      </View>
      <Switch value={value} onValueChange={onToggle} trackColor={{ false: "#3C3C3E", true: "#6B7B5A" }} thumbColor="#FFF" />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>ACCOUNT PRIVACY</Text>
        <View style={styles.card}>
          <Row label="Private Account" sub="Only approved followers can see your posts" value={privateAccount} onToggle={setPrivateAccount} />
          <View style={styles.divider} />
          <Row label="Show Activity Status" sub="Let others see when you were last active" value={showActivity} onToggle={setShowActivity} />
          <View style={styles.divider} />
          <Row label="Show Online Status" sub="Appear online while using the app" value={showOnline} onToggle={setShowOnline} />
        </View>

        <Text style={styles.sectionLabel}>INTERACTIONS</Text>
        <View style={styles.card}>
          <Row label="Allow Direct Messages" sub="Let community members send you messages" value={allowDMs} onToggle={setAllowDMs} />
        </View>

        <Text style={styles.sectionLabel}>MENTIONS & TAGS</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.choiceRow} onPress={() => setMentionsFrom("everyone")}>
            <Text style={styles.choiceLabel}>Allow mentions from everyone</Text>
            {mentionsFrom === "everyone" && <Ionicons name="checkmark-circle" size={20} color="#6B7B5A" />}
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.choiceRow} onPress={() => setMentionsFrom("followers")}>
            <Text style={styles.choiceLabel}>Allow mentions from followers only</Text>
            {mentionsFrom === "followers" && <Ionicons name="checkmark-circle" size={20} color="#6B7B5A" />}
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>DATA & SAFETY</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.navRow} onPress={() => Alert.alert("Download Your Data", "A copy of your posts, messages, and activity will be prepared and sent to your registered email address within 48 hours.", [{ text: "Request Download" }, { text: "Cancel", style: "cancel" }])}>
            <Text style={styles.rowLabel}>Download Your Data</Text>
            <Feather name="chevron-right" size={18} color="#636366" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.navRow} onPress={() => Alert.alert("Delete Account", "This will permanently delete your account, posts, and all data. This action cannot be undone.", [{ text: "Delete Account", style: "destructive", onPress: () => router.replace("/signin") }, { text: "Cancel", style: "cancel" }])}>
            <Text style={[styles.rowLabel, { color: "#FF453A" }]}>Delete Account</Text>
            <Feather name="chevron-right" size={18} color="#636366" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  content: { paddingHorizontal: 16, paddingTop: 8 },
  sectionLabel: { color: "#636366", fontSize: 11, fontWeight: "600", letterSpacing: 0.5, marginTop: 20, marginBottom: 6, marginLeft: 4 },
  card: { backgroundColor: "#111", borderRadius: 14, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  rowText: { flex: 1 },
  rowLabel: { color: "#FFF", fontSize: 15 },
  rowSub: { color: "#8E8E93", fontSize: 12, marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#2C2C2E", marginLeft: 16 },
  choiceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
  choiceLabel: { color: "#FFF", fontSize: 15 },
  navRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
});
