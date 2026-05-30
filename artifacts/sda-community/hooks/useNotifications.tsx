import React, { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Animated, View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAuth } from "@clerk/clerk-expo";
import { supabase } from "@/lib/supabase";
import { fetchUnreadMessageCount } from "@/lib/chat";

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: "prayer" | "announcement" | "like" | "comment" | "follow" | "message" | "verse" | "general";
  read: boolean;
  timeAgo: string;
}

interface DbNotificationRow {
  id: string;
  type: string;
  is_read: boolean;
  created_at: string;
  actor_id?: string | null;
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

function relativeTime(input: string) {
  const ms = Date.now() - new Date(input).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function normalizeType(raw: string): AppNotification["type"] {
  switch (raw) {
    case "meeting_invite":
      return "announcement";
    case "prayer_request":
      return "prayer";
    case "mention":
      return "comment";
    case "message":
    case "announcement":
    case "prayer":
    case "like":
    case "comment":
    case "follow":
    case "verse":
    case "general":
      return raw;
    default:
      return "general";
  }
}

function defaultBody(type: AppNotification["type"]) {
  switch (type) {
    case "message":
      return "Sent you a new message.";
    case "like":
      return "Liked your post.";
    case "comment":
      return "Commented on your post.";
    case "follow":
      return "Started following you.";
    case "prayer":
      return "Shared a prayer update.";
    case "announcement":
      return "Posted a new announcement.";
    case "verse":
      return "Shared a Bible verse with you.";
    default:
      return "You have a new notification.";
  }
}

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
  const { userId } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [messageUnreadCount, setMessageUnreadCount] = useState(0);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);
  const communityUnreadCount = notifications.filter((n) => !n.read && n.type !== "message").length;

  const loadNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      return;
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("id, type, is_read, created_at, actor_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      setNotifications([]);
      return;
    }

    const rows = (data ?? []) as DbNotificationRow[];
    const actorIds = Array.from(new Set(rows.map((row) => row.actor_id).filter(Boolean) as string[]));
    let actorMap = new Map<string, string>();

    if (actorIds.length) {
      const { data: actors } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", actorIds);

      actorMap = new Map((actors ?? []).map((row: any) => [row.id, row.full_name ?? "Member"]));
    }

    setNotifications(
      rows.map((row) => {
        const type = normalizeType(row.type);
        const actor = row.actor_id ? actorMap.get(row.actor_id) : undefined;
        return {
          id: row.id,
          title: actor ?? "New activity",
          body: defaultBody(type),
          type,
          read: !!row.is_read,
          timeAgo: relativeTime(row.created_at),
        } as AppNotification;
      })
    );
  }, [userId]);

  const loadUnreadMessages = useCallback(async () => {
    if (!userId) {
      setMessageUnreadCount(0);
      return;
    }

    try {
      const count = await fetchUnreadMessageCount(userId);
      setMessageUnreadCount(count);
    } catch {
      setMessageUnreadCount(0);
    }
  }, [userId]);

  useEffect(() => {
    loadNotifications();
    loadUnreadMessages();

    if (!userId) return;

    const notifChannel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    const messageChannel = supabase
      .channel(`messages-unread-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          loadUnreadMessages();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversation_participants",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadUnreadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notifChannel);
      supabase.removeChannel(messageChannel);
    };
  }, [loadNotifications, loadUnreadMessages, userId]);

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
    if (userId) {
      supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false)
        .then(() => undefined, () => undefined);
    }
  }, [userId]);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    if (userId) {
      supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id)
        .eq("user_id", userId)
        .then(() => undefined, () => undefined);
    }
  }, [userId]);

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
