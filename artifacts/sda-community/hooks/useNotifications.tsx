import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { Animated, View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: "prayer" | "announcement" | "like" | "comment" | "follow" | "message" | "verse" | "general";
  read: boolean;
  timeAgo: string;
}

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  messageUnreadCount: number;
  communityUnreadCount: number;
  addNotification: (n: Omit<AppNotification, "id" | "read" | "timeAgo">) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  unreadCount: 0,
  messageUnreadCount: 0,
  communityUnreadCount: 0,
  addNotification: () => {},
  markAllRead: () => {},
  markRead: () => {},
});

const DEMO_NOTIFICATIONS: AppNotification[] = [
  { id: "1", title: "Pastor James Osei", body: "New announcement: Sabbath Service at 9:30 AM 🙏", type: "announcement", read: false, timeAgo: "5m ago" },
  { id: "2", title: "Elder Ruth Nakamura", body: "Prayer meeting this Wednesday at 7:00 PM", type: "prayer", read: false, timeAgo: "1h ago" },
  { id: "3", title: "David Mensah", body: "Liked your post about the anniversary service", type: "like", read: false, timeAgo: "2h ago" },
  { id: "4", title: "Grace Adetokunbo", body: "Commented: \"Amen! God is faithful 🙌\"", type: "comment", read: true, timeAgo: "4h ago" },
  { id: "5", title: "Samuel Boateng", body: "Started following you", type: "follow", read: true, timeAgo: "1d ago" },
  { id: "6", title: "Grace Adetokunbo", body: "Hey! Are you coming to the prayer meeting tonight?", type: "message", read: false, timeAgo: "8m ago" },
  { id: "7", title: "Pastor James Osei", body: "Please share this week's Sabbath School lesson 📖", type: "message", read: false, timeAgo: "30m ago" },
  { id: "8", title: "Youth Group Chat", body: "Samuel Boateng: Can everyone confirm attendance?", type: "message", read: false, timeAgo: "2h ago" },
];

function getTypeColor(type: AppNotification["type"]) {
  switch (type) {
    case "prayer": return "#8B3A8B";
    case "announcement": return "#3B5BDB";
    case "like": return "#FF3B5B";
    case "comment": return "#6B7B5A";
    case "follow": return "#0E7B5B";
    case "message": return "#C85200";
    case "verse": return "#B8860B";
    case "general": return "#4A6741";
  }
}

function getTypeIcon(type: AppNotification["type"]) {
  switch (type) {
    case "prayer": return "hand-right-outline";
    case "announcement": return "megaphone-outline";
    case "like": return "heart";
    case "comment": return "chatbubble-outline";
    case "follow": return "person-add-outline";
    case "message": return "chatbubbles-outline";
    case "verse": return "book-outline";
    case "general": return "star-outline";
  }
}

interface ToastItem {
  id: string;
  notification: AppNotification;
  anim: Animated.Value;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(DEMO_NOTIFICATIONS);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const unreadCount = notifications.filter((n) => !n.read).length;
  const messageUnreadCount = notifications.filter((n) => !n.read && n.type === "message").length;
  const communityUnreadCount = notifications.filter((n) => !n.read && n.type !== "message").length;

  const addNotification = useCallback((n: Omit<AppNotification, "id" | "read" | "timeAgo">) => {
    const id = Date.now().toString();
    const newNotif: AppNotification = { ...n, id, read: false, timeAgo: "now" };
    setNotifications((prev) => [newNotif, ...prev]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const anim = new Animated.Value(0);
    const toast: ToastItem = { id, notification: newNotif, anim };
    setToasts((prev) => [...prev, toast]);

    Animated.spring(anim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 10 }).start();

    toastTimers.current[id] = setTimeout(() => {
      dismissToast(id, anim);
    }, 4000);
  }, []);

  function dismissToast(id: string, anim: Animated.Value) {
    if (toastTimers.current[id]) {
      clearTimeout(toastTimers.current[id]);
      delete toastTimers.current[id];
    }
    Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    });
  }

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, messageUnreadCount, communityUnreadCount, addNotification, markAllRead, markRead }}>
      {children}
      <View style={styles.toastContainer} pointerEvents="box-none">
        {toasts.map((toast) => {
          const color = getTypeColor(toast.notification.type);
          const icon = getTypeIcon(toast.notification.type);
          return (
            <Animated.View
              key={toast.id}
              style={[
                styles.toast,
                {
                  opacity: toast.anim,
                  transform: [{ translateY: toast.anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
                },
              ]}
            >
              <View style={[styles.toastIconWrap, { backgroundColor: color + "22" }]}>
                <Ionicons name={icon as any} size={18} color={color} />
              </View>
              <View style={styles.toastText}>
                <Text style={styles.toastTitle} numberOfLines={1}>{toast.notification.title}</Text>
                <Text style={styles.toastBody} numberOfLines={2}>{toast.notification.body}</Text>
              </View>
              <TouchableOpacity onPress={() => dismissToast(toast.id, toast.anim)} style={styles.toastClose}>
                <Ionicons name="close" size={16} color="#636366" />
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    top: Platform.OS === "web" ? 80 : 60,
    left: 12,
    right: 12,
    zIndex: 9999,
    gap: 8,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  toastIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  toastText: { flex: 1 },
  toastTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "700", marginBottom: 2 },
  toastBody: { color: "#AEAEB2", fontSize: 12, lineHeight: 16 },
  toastClose: { padding: 4 },
});
