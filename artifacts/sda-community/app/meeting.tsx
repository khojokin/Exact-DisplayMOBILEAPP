import React, { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Share,
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
import * as WebBrowser from "expo-web-browser";
import * as Haptics from "expo-haptics";
import { useAdmin } from "@/hooks/useAdmin";
import { buildConferenceUrl, isLiveKitConfigured } from "@/lib/livekit";

function normalizeRoomCode(value: string) {
  return value.trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "");
}

export default function MeetingScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const { isAdmin } = useAdmin();

  const [roomInput, setRoomInput] = useState("");
  const [generatedRoom, setGeneratedRoom] = useState("");

  const roomCode = useMemo(() => normalizeRoomCode(roomInput || generatedRoom), [roomInput, generatedRoom]);
  const usingLiveKit = isLiveKitConfigured();

  async function openMeeting(audioOnly: boolean) {
    if (!roomCode) {
      Alert.alert("Missing meeting code", "Enter or generate a meeting code first.");
      return;
    }
    const url = buildConferenceUrl(roomCode, audioOnly);
    await Haptics.selectionAsync();
    await WebBrowser.openBrowserAsync(url);
  }

  async function shareMeeting() {
    if (!roomCode) {
      Alert.alert("Missing meeting code", "Enter or generate a meeting code first.");
      return;
    }
    const url = buildConferenceUrl(roomCode, false);
    await Share.share({ message: `Join SDA Community meeting: ${url}` });
  }

  function generateRoom() {
    const stamp = Date.now().toString().slice(-6);
    setGeneratedRoom(`SDA-${stamp}`);
    setRoomInput("");
  }

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
        <View style={[styles.header, { paddingTop: topPad }]}> 
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meetings</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.deniedWrap}>
          <Ionicons name="lock-closed-outline" size={42} color="#636366" />
          <Text style={styles.deniedTitle}>Admin Access Required</Text>
          <Text style={styles.deniedText}>Only admins can create or join live meetings from this section.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <View style={[styles.header, { paddingTop: topPad }]}> 
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Meetings</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.body}>
        <Text style={styles.label}>Meeting code</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. SDA-Sabbath-Study"
          placeholderTextColor="#636366"
          value={roomInput || generatedRoom}
          onChangeText={(v) => {
            setGeneratedRoom("");
            setRoomInput(v);
          }}
          autoCapitalize="none"
        />

        <TouchableOpacity style={styles.secondaryBtn} onPress={generateRoom}>
          <Ionicons name="sparkles-outline" size={18} color="#6B7B5A" />
          <Text style={styles.secondaryBtnText}>Generate Meeting Code</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryBtn} onPress={() => openMeeting(false)}>
          <Ionicons name="videocam" size={18} color="#FFF" />
          <Text style={styles.primaryBtnText}>Start Video Meeting</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryBtn} onPress={() => openMeeting(true)}>
          <Ionicons name="call" size={18} color="#FFF" />
          <Text style={styles.primaryBtnText}>Start Audio Meeting</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={shareMeeting}>
          <Ionicons name="share-social-outline" size={18} color="#6B7B5A" />
          <Text style={styles.secondaryBtnText}>Share Meeting Link</Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          {usingLiveKit
            ? "Meetings are running on LiveKit and open with real-time audio/video."
            : "Meetings currently use Jitsi. Configure LiveKit env vars to switch to your LiveKit rooms."}
        </Text>
      </View>
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
  body: { paddingHorizontal: 16, paddingTop: 12, gap: 12 },
  label: { color: "#8E8E93", fontSize: 13, fontWeight: "600" },
  input: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#FFF",
    fontSize: 15,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#6B7B5A",
    borderRadius: 12,
    paddingVertical: 13,
  },
  primaryBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2C2C2E",
  },
  secondaryBtnText: { color: "#6B7B5A", fontSize: 14, fontWeight: "600" },
  note: { color: "#636366", fontSize: 12, lineHeight: 18, marginTop: 4 },
  deniedWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28, gap: 10 },
  deniedTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  deniedText: { color: "#8E8E93", fontSize: 14, textAlign: "center", lineHeight: 20 },
});
