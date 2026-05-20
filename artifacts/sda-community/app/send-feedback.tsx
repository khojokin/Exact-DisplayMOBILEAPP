import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Platform, StatusBar, TextInput, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

const CATEGORIES = ["Bug Report", "Feature Request", "Content Issue", "Account Problem", "General Feedback"];

export default function SendFeedbackScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const [category, setCategory] = useState("General Feedback");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!message.trim()) {
      Alert.alert("Empty message", "Please write your feedback before submitting.");
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
        <View style={styles.successWrap}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark-circle" size={64} color="#6B7B5A" />
          </View>
          <Text style={styles.successTitle}>Thank You!</Text>
          <Text style={styles.successBody}>Your feedback has been received. We read every submission and use it to improve SDA Community for the whole family of believers.</Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
            <Text style={styles.doneBtnText}>Back to Settings</Text>
          </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Send Feedback</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>RATE YOUR EXPERIENCE</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Ionicons name={star <= rating ? "star" : "star-outline"} size={36} color={star <= rating ? "#F0A500" : "#3C3C3E"} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>FEEDBACK CATEGORY</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} contentContainerStyle={{ gap: 8, paddingHorizontal: 0 }}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, category === cat && styles.chipActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionLabel}>YOUR MESSAGE</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Tell us what you think, what's broken, or what you'd love to see..."
          placeholderTextColor="#636366"
          multiline
          numberOfLines={6}
          value={message}
          onChangeText={setMessage}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{message.length}/500</Text>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Ionicons name="paper-plane-outline" size={18} color="#FFF" />
          <Text style={styles.submitBtnText}>Submit Feedback</Text>
        </TouchableOpacity>
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
  sectionLabel: { color: "#636366", fontSize: 11, fontWeight: "600", letterSpacing: 0.5, marginTop: 20, marginBottom: 10, marginLeft: 4 },
  starsRow: { flexDirection: "row", justifyContent: "center", gap: 12, marginBottom: 8 },
  chipRow: { marginBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "#1C1C1E", borderWidth: StyleSheet.hairlineWidth, borderColor: "#2C2C2E" },
  chipActive: { backgroundColor: "#4A6741", borderColor: "#6B7B5A" },
  chipText: { color: "#8E8E93", fontSize: 13, fontWeight: "500" },
  chipTextActive: { color: "#FFF" },
  textArea: { backgroundColor: "#111", borderRadius: 14, padding: 14, color: "#FFF", fontSize: 14, lineHeight: 22, minHeight: 140, borderWidth: StyleSheet.hairlineWidth, borderColor: "#2C2C2E" },
  charCount: { color: "#636366", fontSize: 12, textAlign: "right", marginTop: 6 },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#4A6741", borderRadius: 14, height: 52, marginTop: 20 },
  submitBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  successWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 36 },
  successCircle: { width: 110, height: 110, borderRadius: 55, backgroundColor: "#4A674122", alignItems: "center", justifyContent: "center", marginBottom: 24, borderWidth: 2, borderColor: "#6B7B5A33" },
  successTitle: { color: "#FFF", fontSize: 26, fontWeight: "800", marginBottom: 12 },
  successBody: { color: "#8E8E93", fontSize: 14, textAlign: "center", lineHeight: 22, marginBottom: 32 },
  doneBtn: { backgroundColor: "#4A6741", borderRadius: 14, height: 52, paddingHorizontal: 32, alignItems: "center", justifyContent: "center" },
  doneBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
