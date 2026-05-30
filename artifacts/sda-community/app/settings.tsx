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
import { useAuth } from "@clerk/clerk-expo";
import { useAI } from "@/hooks/useAI";
import { useSubscription } from "@/hooks/useSubscription";
import { useTheme } from "@/hooks/useTheme";

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
  const { t } = useTheme();
  const { signOut } = useAuth();
  const { aiEnabled, setAiEnabled } = useAI();
  const { isPremium, privacyMode, readReceipts, setPrivacyMode, setReadReceipts } = useSubscription();

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
        { id: "ai", label: "AI Assistant", icon: "sparkles-outline", iconColor: "#6264A7", type: "toggle", defaultOn: aiEnabled },
        { id: "privacyMode", label: "Privacy Mode", icon: "shield-checkmark-outline", iconColor: "#3B5BDB", type: "toggle", defaultOn: privacyMode },
        { id: "readReceipts", label: "Read Receipts", icon: "mail-open-outline", iconColor: "#D4AF37", type: "toggle", defaultOn: readReceipts },
        { id: "accessibility", label: "Accessibility", icon: "eye-outline", iconColor: "#0E7B5B", type: "nav" },
        { id: "language", label: "Language & Region", icon: "globe-outline", iconColor: "#C85200", type: "nav" },
      ] as SettingItem[],
    },
    {
      title: "Subscriptions",
      data: [
        { id: "goPremium", label: "Subscription ($6.99/month)", icon: "flash-outline", iconColor: "#D4AF37", type: "nav" },
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
        { id: "resources", label: "Resources", icon: "library-outline", iconColor: "#0E7B5B", type: "nav" },
        { id: "help", label: "Help & Support", icon: "help-circle-outline", iconColor: "#6B7B5A", type: "nav" },
        { id: "feedback", label: "Send Feedback", icon: "chatbubble-outline", iconColor: "#3B5BDB", type: "nav" },
        { id: "about", label: "About SDA Community", icon: "information-circle-outline", iconColor: "#636366", type: "nav" },
      ] as SettingItem[],
    },
    {
      title: "Legal",
      data: [
        { id: "privacyPolicy", label: "Privacy Policy", icon: "document-text-outline", iconColor: "#8E8E93", type: "nav" },
        { id: "terms", label: "Terms of Service", icon: "reader-outline", iconColor: "#8E8E93", type: "nav" },
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
      case "goPremium":
        router.push("/subscription");
        break;
      case "blocked": router.push("/blocked-members"); break;
      case "muted": router.push("/muted-members"); break;
      case "reported": router.push("/reported-content"); break;
      case "help": router.push("/help-support"); break;
      case "resources": router.push("/resources"); break;
      case "feedback": router.push("/send-feedback"); break;
      case "about": router.push("/about-app"); break;
      case "privacyPolicy": router.push("/privacy-policy" as any); break;
      case "terms": router.push("/terms-of-service" as any); break;
      case "logout":
        Alert.alert("Log Out", "Are you sure you want to log out?", [
          {
            text: "Log Out",
            style: "destructive",
            onPress: async () => {
              try {
                await signOut();
              } catch (error) {
                if (__DEV__) console.warn("[signOut] failed", error);
              }
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

  function handlePremiumUpgradePrompt() {
    Alert.alert("Premium Feature", "Upgrade to PREMIUM to unlock this setting.", [
      { text: "Not now", style: "cancel" },
      { text: "Upgrade", onPress: () => router.push("/subscription") },
    ]);
  }

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <StatusBar barStyle={t.statusBar} backgroundColor={t.bg} />
      <View style={[styles.header, { paddingTop: topPad, borderBottomColor: t.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={t.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: t.text }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <SectionList
        sections={SETTINGS_SECTIONS}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <Text style={[styles.sectionHeader, { color: t.sectionHeader }]}>{section.title}</Text>
        )}
        renderItem={({ item, index, section }) => {
          const isFirst = index === 0;
          const isLast = index === section.data.length - 1;
          const isToggle = item.id === "notifications" || item.id === "ai" || item.id === "privacyMode" || item.id === "readReceipts";
          const isPremiumLocked = (item.id === "privacyMode" || item.id === "readReceipts") && !isPremium;
          const isDanger = item.type === "danger";

          return (
            <TouchableOpacity
              style={[
                styles.settingItem,
                { backgroundColor: t.bgSecondary, borderBottomColor: t.border },
                isFirst && styles.settingItemFirst,
                isLast && styles.settingItemLast,
                !isLast && styles.settingItemBorder,
              ]}
              activeOpacity={isToggle && !isPremiumLocked ? 1 : 0.7}
              onPress={isToggle ? (isPremiumLocked ? handlePremiumUpgradePrompt : undefined) : () => handlePress(item)}
            >
              <View style={[styles.iconWrap, { backgroundColor: item.iconColor + "22" }]}>
                <Ionicons name={item.icon as any} size={18} color={item.iconColor} />
              </View>
              <Text style={[styles.settingLabel, { color: isDanger ? t.danger : t.text }]}>{item.label}</Text>
              {isToggle ? (
                isPremiumLocked ? (
                  <View style={styles.lockWrap}>
                    <Ionicons name="lock-closed" size={14} color="#D4AF37" />
                    <Text style={styles.lockText}>Premium</Text>
                  </View>
                ) : (
                  <Switch
                    value={
                      item.id === "notifications" ? pushEnabled
                        : item.id === "ai" ? aiEnabled
                        : item.id === "privacyMode" ? privacyMode
                        : readReceipts
                    }
                    onValueChange={(v) => {
                      Haptics.selectionAsync();
                      if (item.id === "notifications") setPushEnabled(v);
                      else if (item.id === "ai") setAiEnabled(v);
                      else if (item.id === "privacyMode") setPrivacyMode(v);
                      else if (item.id === "readReceipts") setReadReceipts(v);
                    }}
                    trackColor={{ false: t.borderLight, true: t.accent }}
                    thumbColor="#FFFFFF"
                  />
                )
              ) : isDanger ? (
                <Ionicons name="log-out-outline" size={18} color={t.danger} />
              ) : (
                <Feather name="chevron-right" size={18} color={t.mutedText} />
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
  lockWrap: { flexDirection: "row", alignItems: "center", gap: 4 },
  lockText: { color: "#D4AF37", fontSize: 12, fontWeight: "700" },
});
