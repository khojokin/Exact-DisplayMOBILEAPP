import { Tabs } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FloatingAI from "@/components/FloatingAI";
import { useNotifications } from "@/hooks/useNotifications";
import { useAI } from "@/hooks/useAI";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { messageUnreadCount, communityUnreadCount } = useNotifications();
  const { aiEnabled } = useAI();
  const TAB_BAR_HEIGHT = 50;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#FFFFFF",
          tabBarInactiveTintColor: "#636366",
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "#111111",
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: "#2C2C2E",
            height: TAB_BAR_HEIGHT + bottomPad,
            paddingBottom: bottomPad,
            paddingTop: 4,
            elevation: 0,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ color }) => <Feather name="home" size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="community"
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="people-outline" size={24} color={color} />
            ),
            tabBarBadge: communityUnreadCount > 0 ? communityUnreadCount : undefined,
            tabBarBadgeStyle: {
              backgroundColor: "#FF3B5B",
              color: "#FFFFFF",
              fontSize: 10,
              fontWeight: "700",
              minWidth: 16,
              height: 16,
              lineHeight: 16,
              borderRadius: 8,
            },
          }}
        />
        <Tabs.Screen
          name="new-post"
          options={{
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  backgroundColor: "#6B7B5A",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: Platform.OS === "web" ? 0 : 4,
                }}
              >
                <Feather name="plus" size={22} color="#FFFFFF" />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{
            tabBarIcon: ({ color }) => <Feather name="send" size={22} color={color} />,
            tabBarBadge: messageUnreadCount > 0 ? messageUnreadCount : undefined,
            tabBarBadgeStyle: {
              backgroundColor: "#FF3B5B",
              color: "#FFFFFF",
              fontSize: 10,
              fontWeight: "700",
              minWidth: 16,
              height: 16,
              lineHeight: 16,
              borderRadius: 8,
            },
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="person-circle-outline" size={26} color={color} />
            ),
          }}
        />
      </Tabs>

      {/* Floating AI — sits above tab bar across all screens */}
      {aiEnabled && <FloatingAI />}
    </View>
  );
}
