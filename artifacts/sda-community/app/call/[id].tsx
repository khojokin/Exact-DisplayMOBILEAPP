import React, { useEffect, useMemo, useState } from "react";
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

const CONTACTS: Record<string, { name: string; initials: string; color: string }> = {
  "1": { name: "Pastor James Osei", initials: "PJ", color: "#3B5BDB" },
  "2": { name: "Elder Ruth Nakamura", initials: "ER", color: "#B8860B" },
  "3": { name: "SDA Prayer Group", initials: "PG", color: "#4A6741" },
  "4": { name: "David Mensah", initials: "DM", color: "#4A5270" },
  "5": { name: "Grace Adetokunbo", initials: "GA", color: "#0E7B5B" },
  "erha-ai": { name: "Erha AI", initials: "AI", color: "#6B7B5A" },
};

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

export default function CallScreen() {
  const { id, type } = useLocalSearchParams<{ id: string; type?: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  const targetId = id ?? "4";
  const contact = CONTACTS[targetId] ?? CONTACTS["4"];
  const isVideoCall = type === "video";

  const [connecting, setConnecting] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(!isVideoCall);
  const [cameraOn, setCameraOn] = useState(isVideoCall);

  useEffect(() => {
    const connectTimer = setTimeout(() => setConnecting(false), 1300);
    return () => clearTimeout(connectTimer);
  }, []);

  useEffect(() => {
    if (connecting) return;
    const timer = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [connecting]);

  const subtitle = useMemo(() => {
    if (connecting) return "Connecting...";
    return isVideoCall ? `Video call live · ${formatDuration(elapsed)}` : `Voice call live · ${formatDuration(elapsed)}`;
  }, [connecting, isVideoCall, elapsed]);

  function toggleMic() {
    Haptics.selectionAsync();
    setMicOn((prev) => !prev);
  }

  function toggleSpeaker() {
    Haptics.selectionAsync();
    setSpeakerOn((prev) => !prev);
  }

  function toggleCamera() {
    Haptics.selectionAsync();
    setCameraOn((prev) => !prev);
  }

  function endCall() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />

      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isVideoCall ? "Video Call" : "Voice Call"}</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.centerWrap}>
        <View style={[styles.avatar, { backgroundColor: `${contact.color}88` }]}>
          <Text style={styles.initials}>{contact.initials}</Text>
        </View>
        <Text style={styles.name}>{contact.name}</Text>
        <Text style={styles.sub}>{subtitle}</Text>

        <View style={styles.controlsRow}>
          <TouchableOpacity style={[styles.controlBtn, !micOn && styles.controlBtnOff]} onPress={toggleMic}>
            <Ionicons name={micOn ? "mic" : "mic-off"} size={20} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.controlBtn, !speakerOn && styles.controlBtnOff]} onPress={toggleSpeaker}>
            <Ionicons name={speakerOn ? "volume-high" : "volume-mute"} size={20} color="#FFF" />
          </TouchableOpacity>

          {isVideoCall && (
            <TouchableOpacity style={[styles.controlBtn, !cameraOn && styles.controlBtnOff]} onPress={toggleCamera}>
              <Ionicons name={cameraOn ? "videocam" : "videocam-off"} size={20} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.endCallBtn} onPress={endCall}>
          <Ionicons name="call" size={20} color="#FFF" style={{ transform: [{ rotate: "135deg" }] }} />
          <Text style={styles.endCallText}>End Call</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111827" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  centerWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  avatar: { width: 108, height: 108, borderRadius: 54, alignItems: "center", justifyContent: "center" },
  initials: { color: "#FFF", fontSize: 36, fontWeight: "700" },
  name: { color: "#FFF", fontSize: 26, fontWeight: "700", marginTop: 14 },
  sub: { color: "#9CA3AF", fontSize: 13, textAlign: "center", lineHeight: 19, marginTop: 8 },
  controlsRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 34,
    marginBottom: 22,
  },
  controlBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1F2937",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#374151",
  },
  controlBtnOff: {
    backgroundColor: "#3F1D1D",
    borderColor: "#7F1D1D",
  },
  endCallBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#C62828",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  endCallText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
});
