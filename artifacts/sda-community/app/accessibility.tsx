import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Platform,
  StatusBar,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";

const FONT_SIZES = [
  { id: "small",   label: "Small",   scale: 0.9 },
  { id: "medium",  label: "Medium",  scale: 1.0 },
  { id: "large",   label: "Large",   scale: 1.15 },
  { id: "xlarge",  label: "X-Large", scale: 1.3 },
];

export default function AccessibilityScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  const [fontSize, setFontSize] = useState("medium");
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [boldText, setBoldText] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [haptics, setHaptics] = useState(true);

  const TOGGLES = [
    { id: "highContrast", label: "High Contrast", sub: "Increase colour contrast for easier reading", icon: "contrast-outline", color: "#4B7BEC", value: highContrast, onChange: setHighContrast },
    { id: "reduceMotion", label: "Reduce Motion", sub: "Minimise animations and transitions", icon: "speedometer-outline", color: "#6264A7", value: reduceMotion, onChange: setReduceMotion },
    { id: "boldText",     label: "Bold Text",     sub: "Make all text thicker and easier to read", icon: "text-outline", color: "#B8860B", value: boldText, onChange: setBoldText },
    { id: "autoPlay",     label: "Auto-play Videos", sub: "Videos start playing when scrolled into view", icon: "play-circle-outline", color: "#0E7B5B", value: autoPlay, onChange: setAutoPlay },
    { id: "haptics",      label: "Haptic Feedback", sub: "Vibration feedback for buttons and actions", icon: "phone-portrait-outline", color: "#C85200", value: haptics, onChange: setHaptics },
    { id: "screenReader", label: "Screen Reader Hints", sub: "Optimise content labels for screen readers", icon: "accessibility-outline", color: "#3B5BDB", value: screenReader, onChange: setScreenReader },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Accessibility</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>TEXT SIZE</Text>
        <View style={styles.fontSizeGrid}>
          {FONT_SIZES.map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[styles.fontSizeBtn, fontSize === f.id && styles.fontSizeBtnActive]}
              onPress={() => {
                Haptics.selectionAsync();
                setFontSize(f.id);
              }}
            >
              <Text
                style={[
                  styles.fontSizePreview,
                  { fontSize: 16 * f.scale },
                  fontSize === f.id && styles.fontSizeBtnTextActive,
                ]}
              >
                Aa
              </Text>
              <Text style={[styles.fontSizeLabel, fontSize === f.id && styles.fontSizeBtnTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>PREVIEW</Text>
          <Text
            style={[
              styles.previewText,
              {
                fontSize: 14 * (FONT_SIZES.find((f) => f.id === fontSize)?.scale ?? 1),
                fontWeight: boldText ? "700" : "400",
              },
            ]}
          >
            "Trust in the Lord with all your heart and lean not on your own understanding." — Proverbs 3:5
          </Text>
        </View>

        <Text style={styles.sectionLabel}>DISPLAY</Text>
        <View style={styles.card}>
          {TOGGLES.map((toggle, i) => (
            <View key={toggle.id}>
              <View style={styles.toggleRow}>
                <View style={[styles.iconWrap, { backgroundColor: toggle.color + "22" }]}>
                  <Ionicons name={toggle.icon as any} size={20} color={toggle.color} />
                </View>
                <View style={styles.toggleText}>
                  <Text style={styles.toggleLabel}>{toggle.label}</Text>
                  <Text style={styles.toggleSub}>{toggle.sub}</Text>
                </View>
                <Switch
                  value={toggle.value}
                  onValueChange={(v) => { Haptics.selectionAsync(); toggle.onChange(v); }}
                  trackColor={{ false: "#3C3C3E", true: toggle.color }}
                  thumbColor="#FFF"
                />
              </View>
              {i < TOGGLES.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <View style={styles.noteCard}>
          <Ionicons name="information-circle-outline" size={16} color="#4B7BEC" />
          <Text style={styles.noteText}>
            Some accessibility features may require restarting the app to take full effect.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  content: { paddingHorizontal: 16, paddingTop: 8 },
  sectionLabel: {
    color: "#636366", fontSize: 11, fontWeight: "600", letterSpacing: 0.5,
    marginTop: 20, marginBottom: 8, marginLeft: 4,
  },
  fontSizeGrid: { flexDirection: "row", gap: 8 },
  fontSizeBtn: {
    flex: 1, backgroundColor: "#111", borderRadius: 14, padding: 14, alignItems: "center", gap: 4,
    borderWidth: 1, borderColor: "#2C2C2E",
  },
  fontSizeBtnActive: { borderColor: "#4B7BEC", backgroundColor: "#4B7BEC22" },
  fontSizePreview: { color: "#8E8E93", fontWeight: "700" },
  fontSizeLabel: { color: "#8E8E93", fontSize: 11, fontWeight: "600" },
  fontSizeBtnTextActive: { color: "#4B7BEC" },
  previewCard: {
    backgroundColor: "#111", borderRadius: 14, padding: 16,
    borderWidth: StyleSheet.hairlineWidth, borderColor: "#2C2C2E", marginTop: 12,
    borderLeftWidth: 3, borderLeftColor: "#B8860B",
  },
  previewLabel: { color: "#636366", fontSize: 10, fontWeight: "600", letterSpacing: 0.5, marginBottom: 8 },
  previewText: { color: "#D0D0D4", lineHeight: 22, fontStyle: "italic" },
  card: { backgroundColor: "#111", borderRadius: 14, overflow: "hidden" },
  toggleRow: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16,
    paddingVertical: 14, gap: 12,
  },
  iconWrap: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  toggleText: { flex: 1 },
  toggleLabel: { color: "#FFF", fontSize: 15, fontWeight: "600" },
  toggleSub: { color: "#8E8E93", fontSize: 12, marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#2C2C2E", marginLeft: 66 },
  noteCard: {
    flexDirection: "row", gap: 10, backgroundColor: "#0E1A2E",
    borderColor: "#4B7BEC44", borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12, padding: 12, marginTop: 20,
  },
  noteText: { flex: 1, color: "#8E8E93", fontSize: 12, lineHeight: 18 },
});
