import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  StatusBar,
  Animated,
  LayoutAnimation,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useNotifications, type AppNotification } from "@/hooks/useNotifications";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TYPE_META: Record<string, { icon: string; color: string }> = {
  like:         { icon: "heart",          color: "#FF3B5B" },
  comment:      { icon: "chatbubble",     color: "#3B5BDB" },
  follow:       { icon: "person-add",     color: "#0E7B5B" },
  mention:      { icon: "at",             color: "#3B5BDB" },
  message:      { icon: "chatbubbles",    color: "#C85200" },
  prayer:       { icon: "hand-right",     color: "#8B3A8B" },
  announcement: { icon: "megaphone",      color: "#6B7B5A" },
  verse:        { icon: "book",           color: "#B8860B" },
  general:      { icon: "star",           color: "#4A6741" },
};

type Section =
  | { type: "section-header"; label: string; key: string }
  | { type: "item"; data: AppNotification; key: string }
  | { type: "empty"; key: string };

function NotifRow({
  item,
  onPress,
  onDismiss,
}: {
  item: AppNotification;
  onPress: (n: AppNotification) => void;
  onDismiss: (id: string) => void;
}) {
  const meta = TYPE_META[item.type] ?? TYPE_META.general;
  const opacity = useRef(new Animated.Value(1)).current;

  function dismiss() {
    Haptics.selectionAsync();
    Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      onDismiss(item.id);
    });
  }

  return (
    <Animated.View style={{ opacity }}>
      <TouchableOpacity
        style={[styles.row, !item.read && styles.rowUnread]}
        onPress={() => onPress(item)}
        activeOpacity={0.75}
      >
        {/* Unread pulse dot */}
        <View style={styles.dotCol}>
          {!item.read && <View style={styles.unreadDot} />}
        </View>

        {/* Type icon circle */}
        <View style={[styles.iconCircle, { backgroundColor: meta.color + "22" }]}>
          <Ionicons name={meta.icon as any} size={19} color={meta.color} />
        </View>

        {/* Content */}
        <View style={styles.textCol}>
          <Text style={[styles.rowTitle, item.read && styles.rowTitleRead]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.rowBody} numberOfLines={2}>{item.body}</Text>
          <Text style={styles.rowTime}>{item.timeAgo}</Text>
        </View>

        {/* Dismiss × */}
        <TouchableOpacity
          style={styles.dismissBtn}
          onPress={dismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={15} color="#48484A" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [confirmClear, setConfirmClear] = useState(false);

  const visible = notifications.filter((n) => !dismissed.has(n.id));
  const unread = visible.filter((n) => !n.read);
  const earlier = visible.filter((n) => n.read);
  const isEmpty = visible.length === 0;

  const handlePress = useCallback((n: AppNotification) => {
    Haptics.selectionAsync();
    markRead(n.id);
    if (n.type === "message") router.push("/messages");
    else router.back();
  }, [markRead]);

  const handleDismiss = useCallback((id: string) => {
    setDismissed((prev) => new Set([...prev, id]));
    markRead(id);
  }, [markRead]);

  function handleMarkAll() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    markAllRead();
  }

  function handleClearAll() {
    setConfirmClear(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setDismissed(new Set(notifications.map((n) => n.id)));
    markAllRead();
  }

  // Build flat section list
  const sections: Section[] = [];
  if (unread.length > 0) {
    sections.push({ type: "section-header", label: `New  ·  ${unread.length}`, key: "hdr-new" });
    unread.forEach((n) => sections.push({ type: "item", data: n, key: n.id }));
  }
  if (earlier.length > 0) {
    sections.push({ type: "section-header", label: "Earlier", key: "hdr-earlier" });
    earlier.forEach((n) => sections.push({ type: "item", data: n, key: n.id }));
  }
  if (isEmpty) {
    sections.push({ type: "empty", key: "empty" });
  }

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.titleRow}>
          <Text style={styles.title}>Activity</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        <View style={styles.headerRight}>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAll} style={styles.hdrBtn} accessibilityLabel="Mark all read">
              <Ionicons name="checkmark-done-outline" size={22} color="#6B7B5A" />
            </TouchableOpacity>
          )}
          {visible.length > 0 && (
            <TouchableOpacity
              onPress={() => setConfirmClear(true)}
              style={styles.hdrBtn}
              accessibilityLabel="Clear all"
            >
              <Ionicons name="trash-outline" size={20} color="#48484A" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Clear-all confirmation bar ── */}
      {confirmClear && (
        <View style={styles.confirmBar}>
          <Text style={styles.confirmMsg}>Clear all notifications?</Text>
          <TouchableOpacity style={styles.confirmYesBtn} onPress={handleClearAll}>
            <Text style={styles.confirmYesTxt}>Clear all</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmNoBtn} onPress={() => setConfirmClear(false)}>
            <Text style={styles.confirmNoTxt}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Mark-all shortcut strip ── */}
      {unreadCount > 0 && !confirmClear && (
        <TouchableOpacity style={styles.markAllStrip} onPress={handleMarkAll}>
          <Ionicons name="checkmark-done" size={15} color="#6B7B5A" />
          <Text style={styles.markAllTxt}>Mark all as read</Text>
        </TouchableOpacity>
      )}

      {/* ── Notification list ── */}
      <FlatList
        data={sections}
        keyExtractor={(s) => s.key}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 48 }}
        renderItem={({ item: s }) => {
          if (s.type === "section-header") {
            return <Text style={styles.sectionHdr}>{s.label}</Text>;
          }
          if (s.type === "empty") {
            return (
              <View style={styles.empty}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="notifications-off-outline" size={40} color="#3C3C3E" />
                </View>
                <Text style={styles.emptyTitle}>All caught up</Text>
                <Text style={styles.emptySub}>No notifications right now. Check back later.</Text>
              </View>
            );
          }
          return (
            <NotifRow
              item={s.data!}
              onPress={handlePress}
              onDismiss={handleDismiss}
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },

  /* header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2C2C2E",
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  titleRow: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  title: { color: "#FFFFFF", fontSize: 20, fontWeight: "700" },
  badge: {
    backgroundColor: "#FF3B5B",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  badgeText: { color: "#FFF", fontSize: 11, fontWeight: "800" },
  headerRight: { flexDirection: "row", gap: 2 },
  hdrBtn: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },

  /* confirm bar */
  confirmBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2C2C2E",
    gap: 8,
  },
  confirmMsg: { flex: 1, color: "#AEAEB2", fontSize: 13 },
  confirmYesBtn: { backgroundColor: "#FF3B30", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  confirmYesTxt: { color: "#FFF", fontSize: 13, fontWeight: "700" },
  confirmNoBtn: { backgroundColor: "#2C2C2E", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  confirmNoTxt: { color: "#FFF", fontSize: 13, fontWeight: "600" },

  /* mark-all strip */
  markAllStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#1C1C1E",
  },
  markAllTxt: { color: "#6B7B5A", fontSize: 13, fontWeight: "600" },

  /* section header */
  sectionHdr: {
    color: "#8E8E93",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 5,
  },

  /* notification row */
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#1C1C1E",
  },
  rowUnread: { backgroundColor: "#0F1116" },

  dotCol: { width: 10, paddingTop: 12, alignItems: "center", flexShrink: 0 },
  unreadDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#6B7B5A" },

  iconCircle: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0, marginRight: 10,
  },

  textCol: { flex: 1 },
  rowTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "600", marginBottom: 2 },
  rowTitleRead: { color: "#AEAEB2", fontWeight: "500" },
  rowBody: { color: "#8E8E93", fontSize: 13, lineHeight: 18, marginBottom: 3 },
  rowTime: { color: "#636366", fontSize: 11 },

  dismissBtn: { width: 30, height: 30, alignItems: "center", justifyContent: "center", marginTop: 4 },

  /* empty state */
  empty: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIcon: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: "#1C1C1E",
    alignItems: "center", justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
  emptySub: { color: "#8E8E93", fontSize: 14, textAlign: "center", lineHeight: 20 },
});
