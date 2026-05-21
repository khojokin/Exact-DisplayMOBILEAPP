import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
  Switch,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useAI } from "@/hooks/useAI";

interface SettingItem {
  id: string;
  label: string;
  icon: string;
  iconColor: string;
  type?: "toggle" | "nav" | "danger";
  defaultOn?: boolean;
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 120 : insets.bottom + 80;
  const [pushEnabled, setPushEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const { aiEnabled, setAiEnabled } = useAI();

  const SETTINGS_SECTIONS = [
    {
      title: "Your Account",
      data: [
        { id: "account", label: "Account", icon: "person-circle-outline", iconColor: "#6B7B5A", type: "nav" },
        { id: "notifications", label: "Notifications", icon: "notifications-outline", iconColor: "#3B5BDB", type: "toggle", defaultOn: pushEnabled },
        { id: "privacy", label: "Privacy", icon: "lock-closed-outline", iconColor: "#B8860B", type: "nav" },
      ] as SettingItem[],
    },
    {
      title: "Preferences",
      data: [
        { id: "appearance", label: "Dark Mode", icon: "color-palette-outline", iconColor: "#8B3A8B", type: "toggle", defaultOn: darkMode },
        { id: "ai", label: "erha AI Assistant", icon: "sparkles-outline", iconColor: "#6264A7", type: "toggle", defaultOn: aiEnabled },
        { id: "accessibility", label: "Accessibility", icon: "eye-outline", iconColor: "#0E7B5B", type: "nav" },
        { id: "language", label: "Language & Region", icon: "globe-outline", iconColor: "#C85200", type: "nav" },
      ] as SettingItem[],
    },
    {
      title: "Subscriptions",
      data: [
        { id: "subscriptions", label: "Submit Verification", icon: "ribbon-outline", iconColor: "#3B5BDB", type: "nav" },
      ] as SettingItem[],
    },
    {
      title: "Community",
      data: [
        { id: "blocked", label: "Blocked Members", icon: "ban-outline", iconColor: "#FF453A", type: "nav" },
        { id: "muted", label: "Muted Members", icon: "volume-mute-outline", iconColor: "#8E8E93", type: "nav" },
        { id: "reported", label: "Reported Content", icon: "flag-outline", iconColor: "#FF9F0A", type: "nav" },
      ] as SettingItem[],
    },
    {
      title: "Support",
      data: [
        { id: "help", label: "Help & Support", icon: "help-circle-outline", iconColor: "#6B7B5A", type: "nav" },
        { id: "feedback", label: "Send Feedback", icon: "chatbubble-outline", iconColor: "#3B5BDB", type: "nav" },
        { id: "about", label: "About SDA Community", icon: "information-circle-outline", iconColor: "#636366", type: "nav" },
      ] as SettingItem[],
    },
    {
      title: "Account Actions",
      data: [
        { id: "logout", label: "Log Out", icon: "log-out-outline", iconColor: "#FF453A", type: "danger" },
      ] as SettingItem[],
    },
  ];

  function handlePress(item: SettingItem) {
    Haptics.selectionAsync();
    switch (item.id) {
      case "account":
        router.push("/edit-profile");
        break;
      case "privacy": router.push("/privacy-settings"); break;
      case "accessibility":
        Alert.alert("Accessibility", "Font size and display options will be available in a future update.");
        break;
      case "language": router.push("/language-settings"); break;
      case "subscriptions":
        Alert.alert(
          "Submit Verification",
          "Verification submission will be available here in the next update."
        );
        break;
      case "blocked": router.push("/blocked-members"); break;
      case "muted": router.push("/muted-members"); break;
      case "reported": router.push("/reported-content"); break;
      case "help": router.push("/help-support"); break;
      case "feedback": router.push("/send-feedback"); break;
      case "about": router.push("/about-app"); break;
      case "logout":
        Alert.alert("Log Out", "Are you sure you want to log out?", [
          {
            text: "Log Out",
            style: "destructive",
            onPress: () => {
              // Dismiss the settings modal first, then replace the root
              router.dismissAll();
              router.replace("/signin");
            },
          },
          { text: "Cancel", style: "cancel" },
        ]);
        break;
      default:
        break;
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <SectionList
        sections={SETTINGS_SECTIONS}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        renderItem={({ item, index, section }) => {
          const isFirst = index === 0;
          const isLast = index === section.data.length - 1;
          const isToggle = item.id === "notifications" || item.id === "appearance" || item.id === "ai";
          const isDanger = item.type === "danger";

          return (
            <TouchableOpacity
              style={[
                styles.settingItem,
                isFirst && styles.settingItemFirst,
                isLast && styles.settingItemLast,
                !isLast && styles.settingItemBorder,
              ]}
              activeOpacity={isToggle ? 1 : 0.7}
              onPress={isToggle ? undefined : () => handlePress(item)}
            >
              <View style={[styles.iconWrap, { backgroundColor: item.iconColor + "22" }]}>
                <Ionicons name={item.icon as any} size={18} color={item.iconColor} />
              </View>
              <Text style={[styles.settingLabel, isDanger && { color: "#FF453A" }]}>{item.label}</Text>
              {isToggle ? (
                <Switch
                  value={item.id === "notifications" ? pushEnabled : item.id === "ai" ? aiEnabled : darkMode}
                  onValueChange={(v) => {
                    Haptics.selectionAsync();
                    if (item.id === "notifications") setPushEnabled(v);
                    else if (item.id === "ai") setAiEnabled(v);
                    else setDarkMode(v);
                  }}
                  trackColor={{ false: "#3C3C3E", true: "#6B7B5A" }}
                  thumbColor="#FFFFFF"
                />
              ) : isDanger ? (
                <Ionicons name="log-out-outline" size={18} color="#FF453A" />
              ) : (
                <Feather name="chevron-right" size={18} color="#636366" />
              )}
            </TouchableOpacity>
          );
        }}
        SectionSeparatorComponent={() => <View style={{ height: 8 }} />}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: bottomPad,
          paddingTop: 8,
        }}
        showsVerticalScrollIndicator={false}
      />
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2C2C2E",
    marginBottom: 8,
  },
  headerTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "700" },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: {
    color: "#8E8E93",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 6,
    marginLeft: 2,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111111",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  settingItemFirst: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  settingItemLast: {
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  settingItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2C2C2E",
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: { flex: 1, color: "#FFFFFF", fontSize: 15 },
});
