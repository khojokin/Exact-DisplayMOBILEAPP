import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
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
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SW, height: SH } = Dimensions.get("window");

type HostKey = "pj" | "ga";

const HOSTS: Record<HostKey, { name: string; role: string; title: string; color: string; initials: string }> = {
  pj: {
    name: "Pastor James Osei",
    role: "Pastor",
    title: "Evening Devotional Live",
    color: "#3B5BDB",
    initials: "PJ",
  },
  ga: {
    name: "Grace Adetokunbo",
    role: "Worship Leader",
    title: "Worship & Prayer Session",
    color: "#0E7B5B",
    initials: "GA",
  },
};

const MOCK_VIEWERS = [
  "Elder Ruth", "David Mensah", "Abigail", "Samuel", "Naomi", "Joseph", "Mary", "Philip",
];

const MOCK_LINES = [
  "Amen 🙏",
  "Praise God!",
  "This is powerful",
  "Thank you for this word",
  "Watching from Accra",
  "Blessings family",
  "Hallelujah",
];

interface LiveComment {
  id: string;
  user: string;
  text: string;
}

interface FloatingHeart {
  id: string;
  left: number;
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
}

export default function LiveScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const hostId = (Array.isArray(params.id) ? params.id[0] : params.id) === "ga" ? "ga" : "pj";
  const host = HOSTS[hostId as HostKey];

  const [viewerCount, setViewerCount] = useState(132);
  const [comments, setComments] = useState<LiveComment[]>([
    { id: "1", user: "Elder Ruth", text: "Blessings everyone!" },
    { id: "2", user: "David Mensah", text: "Ready for tonight 🙌" },
  ]);
  const [input, setInput] = useState("");
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);

  const pulse = useRef(new Animated.Value(0)).current;
  const commentsRef = useRef<ScrollView>(null);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);

  useEffect(() => {
    const t = setInterval(() => {
      setViewerCount((v) => v + Math.floor(Math.random() * 3));
      setComments((prev) => [
        ...prev,
        {
          id: `${Date.now()}`,
          user: MOCK_VIEWERS[Math.floor(Math.random() * MOCK_VIEWERS.length)],
          text: MOCK_LINES[Math.floor(Math.random() * MOCK_LINES.length)],
        },
      ].slice(-24));
    }, 2600);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => commentsRef.current?.scrollToEnd({ animated: true }), 40);
    return () => clearTimeout(t);
  }, [comments]);

  const outerScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.16] });
  const innerScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });

  const gradientColors = useMemo(
    () => ["#0A0A0A", `${host.color}66`, "#0A0A0A"] as const,
    [host.color]
  );

  function sendComment() {
    const text = input.trim();
    if (!text) return;
    setComments((prev) => [...prev, { id: `${Date.now()}-me`, user: "You", text }]);
    setInput("");
  }

  function sendHeart() {
    const id = `${Date.now()}-${Math.random()}`;
    const heart: FloatingHeart = {
      id,
      left: SW - 72,
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(1),
    };
    setHearts((prev) => [...prev, heart]);

    Animated.parallel([
      Animated.timing(heart.y, { toValue: -240, duration: 2200, useNativeDriver: true }),
      Animated.timing(heart.x, { toValue: (Math.random() - 0.5) * 90, duration: 2200, useNativeDriver: true }),
      Animated.timing(heart.opacity, { toValue: 0, duration: 2200, useNativeDriver: true }),
    ]).start(() => {
      setHearts((prev) => prev.filter((h) => h.id !== id));
    });
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <LinearGradient colors={gradientColors} style={StyleSheet.absoluteFill} />

      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 20 : insets.top + 8 }]}> 
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.hostName}>{host.name}</Text>
          <View style={styles.roleRow}>
            <Text style={styles.rolePill}>{host.role}</Text>
            <Text style={styles.streamTitle}>{host.title}</Text>
          </View>
        </View>
      </View>

      <View style={styles.liveRow}>
        <View style={styles.livePill}><Text style={styles.livePillText}>LIVE</Text></View>
        <Text style={styles.viewerCount}>{viewerCount} watching</Text>
      </View>

      <View style={styles.centerWrap}>
        <Animated.View style={[styles.pulseOuter, { borderColor: `${host.color}88`, transform: [{ scale: outerScale }] }]} />
        <Animated.View style={[styles.pulseInner, { borderColor: `${host.color}CC`, transform: [{ scale: innerScale }] }]} />
        <View style={[styles.avatar, { backgroundColor: host.color }]}>
          <Text style={styles.avatarText}>{host.initials}</Text>
        </View>
      </View>

      <View style={styles.commentsPanel}>
        <ScrollView ref={commentsRef} style={{ maxHeight: 180 }} contentContainerStyle={{ gap: 6 }}>
          {comments.map((c) => (
            <Text key={c.id} style={styles.commentLine}><Text style={styles.commentUser}>{c.user}: </Text>{c.text}</Text>
          ))}
        </ScrollView>
      </View>

      {hearts.map((h) => (
        <Animated.View
          key={h.id}
          style={{
            position: "absolute",
            bottom: 90,
            left: h.left,
            opacity: h.opacity,
            transform: [{ translateY: h.y }, { translateX: h.x }],
          }}
        >
          <Ionicons name="heart" size={22} color="#FF4D6D" />
        </Animated.View>
      ))}

      <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 10) }]}> 
        <TouchableOpacity style={styles.heartBtn} onPress={sendHeart}>
          <Ionicons name="heart-outline" size={22} color="#FF4D6D" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Add a comment..."
          placeholderTextColor="#7A7A80"
        />
        <TouchableOpacity onPress={sendComment}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  header: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14 },
  iconBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  hostName: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  roleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 3 },
  rolePill: { color: "#DDE8FF", fontSize: 11, fontWeight: "700", backgroundColor: "#1E2B47", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  streamTitle: { color: "#D4D4D8", fontSize: 12 },

  liveRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, marginTop: 10 },
  livePill: { backgroundColor: "#FF3B30", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  livePillText: { color: "#FFF", fontSize: 11, fontWeight: "800" },
  viewerCount: { color: "#FFF", fontSize: 12, fontWeight: "600" },

  centerWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  pulseOuter: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 2,
  },
  pulseInner: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 2,
  },
  avatar: { width: 126, height: 126, borderRadius: 63, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#FFF", fontSize: 42, fontWeight: "800" },

  commentsPanel: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 78,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 12,
    padding: 10,
  },
  commentLine: { color: "#E9E9ED", fontSize: 13, lineHeight: 18 },
  commentUser: { fontWeight: "700", color: "#FFF" },

  inputBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: "rgba(10,10,10,0.9)",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#2C2C2E",
  },
  heartBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "#1C1C1E" },
  input: {
    flex: 1,
    backgroundColor: "#1C1C1E",
    borderRadius: 18,
    color: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
  },
  sendText: { color: "#77A4FF", fontSize: 14, fontWeight: "700" },
});
