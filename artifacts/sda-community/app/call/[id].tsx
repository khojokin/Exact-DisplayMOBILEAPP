import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Animated,
  Alert,
} from "react-native";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

const CONTACTS: Record<string, { name: string; initials: string; color: string }> = {
  "1": { name: "Pastor James Osei", initials: "PJ", color: "#3B5BDB" },
  "2": { name: "Elder Ruth Nakamura", initials: "ER", color: "#B8860B" },
  "3": { name: "SDA Prayer Group", initials: "PG", color: "#4A6741" },
  "4": { name: "David Mensah", initials: "DM", color: "#4A5270" },
  "5": { name: "Grace Adetokunbo", initials: "GA", color: "#0E7B5B" },
};

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${pad(m)}:${pad(s)}`;
}

export default function CallScreen() {
  const { id, type } = useLocalSearchParams<{ id: string; type?: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const contact = CONTACTS[id ?? "4"] ?? CONTACTS["4"];
  const isVideo = type === "video";

  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(false);
  const [cameraOn, setCameraOn] = useState(isVideo);
  const [flipped, setFlipped] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  function handleEnd() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    router.back();
  }

  function handleFlip() {
    Haptics.selectionAsync();
    setFlipped((v) => !v);
  }

  function handleMore() {
    Haptics.selectionAsync();
    Alert.alert("Call Options", undefined, [
      { text: "Add Participant", onPress: () => {} },
      { text: "Share Screen", onPress: () => {} },
      { text: "Record Call", onPress: () => {} },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  const ControlBtn = ({
    icon,
    label,
    active,
    onPress,
    isEnd,
    iconSet = "ionicons",
  }: {
    icon: string;
    label: string;
    active?: boolean;
    onPress: () => void;
    isEnd?: boolean;
    iconSet?: "ionicons" | "feather" | "material";
  }) => (
    <TouchableOpacity style={styles.controlItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.controlCircle, isEnd && styles.controlCircleEnd, active && styles.controlCircleActive]}>
        {iconSet === "feather" ? (
          <Feather name={icon as any} size={22} color={isEnd ? "#FFFFFF" : active ? "#FFFFFF" : "#CCCCCC"} />
        ) : iconSet === "material" ? (
          <MaterialIcons name={icon as any} size={24} color={isEnd ? "#FFFFFF" : active ? "#FFFFFF" : "#CCCCCC"} />
        ) : (
          <Ionicons name={icon as any} size={22} color={isEnd ? "#FFFFFF" : active ? "#FFFFFF" : "#CCCCCC"} />
        )}
      </View>
      <Text style={styles.controlLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />

      <View style={styles.callInfo}>
        <Animated.View style={[styles.avatarWrap, { transform: [{ scale: pulseAnim }] }]}>
          <View style={[styles.avatarPulseRing, { borderColor: contact.color + "33" }]} />
          <View style={[styles.avatarCircle, { backgroundColor: contact.color + "66" }]}>
            <Text style={styles.avatarInitials}>{contact.initials}</Text>
          </View>
        </Animated.View>

        <Text style={styles.contactName}>{contact.name}</Text>
        <Text style={styles.duration}>{formatDuration(duration)}</Text>
        <View style={styles.callTypeBadge}>
          <Text style={styles.callTypeText}>SDA {isVideo ? "Video" : "Voice"} Call</Text>
        </View>
      </View>

      {isVideo && cameraOn && (
        <View style={[styles.ownVideoPreview, flipped && { left: 20, right: undefined }]}>
          <View style={styles.ownVideoCircle}>
            <Text style={styles.ownVideoInitials}>MS</Text>
          </View>
          {flipped && <Text style={styles.flippedLabel}>Flipped</Text>}
        </View>
      )}

      <View style={[styles.controls, { paddingBottom: bottomPad + 16 }]}>
        {isVideo && (
          <View style={styles.controlRow}>
            <ControlBtn
              icon="camera-reverse-outline"
              label="Flip"
              active={flipped}
              onPress={handleFlip}
              iconSet="ionicons"
            />
            <ControlBtn
              icon={cameraOn ? "videocam-outline" : "videocam-off-outline"}
              label="Camera"
              active={!cameraOn}
              onPress={() => { Haptics.selectionAsync(); setCameraOn((v) => !v); }}
            />
            <ControlBtn
              icon={speakerOn ? "volume-high-outline" : "volume-medium-outline"}
              label="Speaker"
              active={speakerOn}
              onPress={() => { Haptics.selectionAsync(); setSpeakerOn((v) => !v); }}
            />
          </View>
        )}

        {!isVideo && (
          <View style={styles.controlRow}>
            <ControlBtn
              icon={speakerOn ? "volume-high-outline" : "volume-medium-outline"}
              label="Speaker"
              active={speakerOn}
              onPress={() => { Haptics.selectionAsync(); setSpeakerOn((v) => !v); }}
            />
          </View>
        )}

        <View style={styles.controlRow}>
          <ControlBtn
            icon={muted ? "mic-off-outline" : "mic-outline"}
            label="Mute"
            active={muted}
            onPress={() => { Haptics.selectionAsync(); setMuted((v) => !v); }}
          />
          <ControlBtn
            icon="call"
            label="End"
            isEnd
            onPress={handleEnd}
          />
          <ControlBtn
            icon="ellipsis-horizontal"
            label="More"
            onPress={handleMore}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
    alignItems: "center",
  },
  callInfo: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  avatarWrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  avatarPulseRing: {
    position: "absolute",
    width: 148,
    height: 148,
    borderRadius: 74,
    borderWidth: 2,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: { color: "#FFFFFF", fontSize: 44, fontWeight: "700" },
  contactName: { color: "#FFFFFF", fontSize: 28, fontWeight: "700", letterSpacing: -0.5 },
  duration: { color: "#9CA3AF", fontSize: 16 },
  callTypeBadge: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  callTypeText: { color: "#9CA3AF", fontSize: 13 },
  ownVideoPreview: {
    position: "absolute",
    bottom: 200,
    right: 20,
    width: 80,
    height: 100,
    borderRadius: 12,
    backgroundColor: "#1F2937",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#374151",
    overflow: "hidden",
  },
  ownVideoCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#6B7B8A",
    alignItems: "center",
    justifyContent: "center",
  },
  ownVideoInitials: { color: "#FFF", fontWeight: "700", fontSize: 16 },
  flippedLabel: { color: "#9CA3AF", fontSize: 9, marginTop: 4 },
  controls: {
    width: "100%",
    paddingHorizontal: 24,
    gap: 28,
    paddingTop: 16,
  },
  controlRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 36,
    alignItems: "center",
  },
  controlItem: { alignItems: "center", gap: 8 },
  controlCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  controlCircleEnd: {
    backgroundColor: "#EF4444",
    transform: [{ rotate: "135deg" }],
  },
  controlCircleActive: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  controlLabel: { color: "#9CA3AF", fontSize: 12 },
});
