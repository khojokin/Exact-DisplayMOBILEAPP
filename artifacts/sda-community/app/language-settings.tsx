import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Platform, StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

const LANGUAGES = [
  { code: "en", name: "English", native: "English" },
  { code: "fr", name: "French", native: "Français" },
  { code: "es", name: "Spanish", native: "Español" },
  { code: "pt", name: "Portuguese", native: "Português" },
];

const REGIONS = [
  "West Africa", "East Africa", "Southern Africa", "North America",
  "Europe", "Caribbean", "South America", "Asia Pacific",
];

export default function LanguageSettingsScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const [selectedLang, setSelectedLang] = useState("en");
  const [selectedRegion, setSelectedRegion] = useState("West Africa");

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Language & Region</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>APP LANGUAGE</Text>
        <View style={styles.card}>
          {LANGUAGES.map((lang, i) => (
            <View key={lang.code}>
              <TouchableOpacity style={styles.row} onPress={() => setSelectedLang(lang.code)}>
                <View style={styles.langInfo}>
                  <Text style={styles.langName}>{lang.name}</Text>
                  <Text style={styles.langNative}>{lang.native}</Text>
                </View>
                {selectedLang === lang.code && (
                  <Ionicons name="checkmark-circle" size={22} color="#6B7B5A" />
                )}
              </TouchableOpacity>
              {i < LANGUAGES.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>REGION</Text>
        <View style={styles.card}>
          {REGIONS.map((region, i) => (
            <View key={region}>
              <TouchableOpacity style={styles.row} onPress={() => setSelectedRegion(region)}>
                <Text style={styles.langName}>{region}</Text>
                {selectedRegion === region && (
                  <Ionicons name="checkmark-circle" size={22} color="#6B7B5A" />
                )}
              </TouchableOpacity>
              {i < REGIONS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
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
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
  langInfo: { flex: 1 },
  langName: { color: "#FFF", fontSize: 15 },
  langNative: { color: "#8E8E93", fontSize: 12, marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#2C2C2E", marginLeft: 16 },
});
