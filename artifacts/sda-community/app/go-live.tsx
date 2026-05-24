import React, { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Audience = "everyone" | "followers" | "community";

const VIEWER_COMMENTS = [
  "Joined from Accra",
  "Audio is clear 🙌",
  "Blessings host",
  "We can hear you",
  "Praying with you",
  "Amen family",
];

export default function GoLiveScreen() {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState("Evening prayer and testimony");
  const [audience, setAudience] = useState<Audience>("everyone");
  const [hosting, setHosting] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [incoming, setIncoming] = useState<string[]>([]);

  useEffect(() => {
    if (!hosting) return;
    const t = setInterval(() => {
      setViewers((v) => v + Math.floor(Math.random() * 4 + 1));
      setIncoming((prev) => [
        ...prev,
        VIEWER_COMMENTS[Math.floor(Math.random() * VIEWER_COMMENTS.length)],
      ].slice(-12));
    }, 1800);
    return () => clearInterval(t);
  }, [hosting]);

  function startLive() {
    setHosting(true);
    setViewers(12);
    setIncoming(["You are live now", "First viewers joined"]);
  }

  function endLive() {
    setHosting(false);
    setViewers(0);
    setIncoming([]);
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 20 : insets.top + 8 }]}> 
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{hosting ? "Hosting Live" : "Go Live"}</Text>
        <View style={{ width: 36 }} />
      </View>

      {!hosting ? (
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 30 }]}> 
          <View style={styles.cameraPreview}>
            <Ionicons name="videocam-outline" size={44} color="#5B5B61" />
            <Text style={styles.previewTitle}>Camera Preview</Text>
            <Text style={styles.previewSub}>
              {Platform.OS === "web"
                ? "Preview placeholder on web"
                : "This area would show device camera preview"}
            </Text>
          </View>

          <Text style={styles.fieldLabel}>Stream Title</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={(v) => setTitle(v.slice(0, 80))}
              placeholder="What are you streaming today?"
              placeholderTextColor="#666"
            />
            <Text style={styles.counter}>{title.length}/80</Text>
          </View>

          <Text style={styles.fieldLabel}>Audience</Text>
          <View style={styles.audienceRow}>
            {([
              { id: "everyone", label: "Everyone" },
              { id: "followers", label: "Followers only" },
              { id: "community", label: "My Community" },
            ] as const).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.audiencePill, audience === item.id && styles.audiencePillActive]}
                onPress={() => setAudience(item.id)}
              >
                <Text style={[styles.audienceText, audience === item.id && styles.audienceTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>Live Tips</Text>
            <Text style={styles.tipLine}>1. Start with a clear greeting and short opening prayer.</Text>
            <Text style={styles.tipLine}>2. Keep your stream title specific so members know what to expect.</Text>
            <Text style={styles.tipLine}>3. Invite comments and engagement every 2-3 minutes.</Text>
          </View>

          <TouchableOpacity style={styles.goLiveBtn} onPress={startLive}>
            <Ionicons name="radio" size={18} color="#FFF" />
            <Text style={styles.goLiveText}>Go Live</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View style={[styles.hostingWrap, { paddingBottom: insets.bottom + 20 }]}> 
          <View style={styles.liveHeaderRow}>
            <View style={styles.liveBadge}><Text style={styles.liveBadgeText}>LIVE</Text></View>
            <Text style={styles.hostingTitle}>{title || "Live stream"}</Text>
          </View>
          <Text style={styles.viewerText}>{viewers} viewers</Text>

          <View style={styles.hostingPreview}>
            <Ionicons name="videocam" size={40} color="#FF7C74" />
            <Text style={styles.previewTitle}>You are live</Text>
            <Text style={styles.previewSub}>Audience: {audience === "everyone" ? "Everyone" : audience === "followers" ? "Followers only" : "My Community"}</Text>
          </View>

          <View style={styles.commentBox}>
            <Text style={styles.tipsTitle}>Incoming comments</Text>
            <ScrollView contentContainerStyle={{ gap: 7 }}>
              {incoming.map((line, idx) => (
                <Text key={`${line}-${idx}`} style={styles.tipLine}>• {line}</Text>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity style={styles.endBtn} onPress={endLive}>
            <Text style={styles.endBtnText}>End Live</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" },

  content: { paddingHorizontal: 16, gap: 10 },
  cameraPreview: {
    marginTop: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2C2C2E",
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#121214",
    gap: 8,
  },
  previewTitle: { color: "#EFEFF4", fontSize: 16, fontWeight: "700" },
  previewSub: { color: "#8E8E93", fontSize: 12, textAlign: "center" },

  fieldLabel: { color: "#8E8E93", fontSize: 12, fontWeight: "700", marginTop: 4 },
  inputWrap: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2C2C2E",
    backgroundColor: "#111113",
    padding: 10,
  },
  input: { color: "#FFF", fontSize: 15, paddingVertical: 2 },
  counter: { color: "#636366", fontSize: 11, textAlign: "right", marginTop: 4 },

  audienceRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  audiencePill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#2C2C2E",
    backgroundColor: "#1A1A1D",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  audiencePillActive: { backgroundColor: "#3F1A1A", borderColor: "#A43D3D" },
  audienceText: { color: "#8E8E93", fontSize: 12, fontWeight: "600" },
  audienceTextActive: { color: "#F6B8B8" },

  tipsCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2C2C2E",
    backgroundColor: "#111113",
    padding: 12,
    gap: 6,
    marginTop: 4,
  },
  tipsTitle: { color: "#FFF", fontSize: 14, fontWeight: "700" },
  tipLine: { color: "#B9B9BF", fontSize: 13, lineHeight: 18 },

  goLiveBtn: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: "#D93636",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingVertical: 14,
  },
  goLiveText: { color: "#FFF", fontSize: 15, fontWeight: "800" },

  hostingWrap: { flex: 1, paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  liveHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  liveBadge: { backgroundColor: "#FF3B30", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  liveBadgeText: { color: "#FFF", fontSize: 11, fontWeight: "800" },
  hostingTitle: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  viewerText: { color: "#F4B3AE", fontSize: 13, fontWeight: "600" },

  hostingPreview: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#632E2E",
    backgroundColor: "#251212",
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  commentBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2C2C2E",
    backgroundColor: "#101012",
    padding: 12,
  },
  endBtn: {
    borderRadius: 12,
    backgroundColor: "#2B2B2E",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
  },
  endBtnText: { color: "#FF8F89", fontSize: 15, fontWeight: "700" },
});
