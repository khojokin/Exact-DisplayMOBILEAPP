import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Platform, StatusBar, Alert, Modal, TextInput, KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
  color: string;
  rsvp: boolean;
  desc: string;
}

const INITIAL_EVENTS: Event[] = [
  {
    id: "1", title: "Sabbath Morning Service", date: "Sat, May 17", time: "9:30 AM",
    location: "Main Sanctuary", category: "Worship", color: "#6B7B5A", rsvp: true,
    desc: "Join us for our 25th Anniversary Sabbath Service. Special programme, choir performance, and a message from Pastor James Osei.",
  },
  {
    id: "2", title: "Youth Prayer Meeting", date: "Wed, May 21", time: "7:00 PM",
    location: "Fellowship Hall", category: "Prayer", color: "#3B5BDB", rsvp: false,
    desc: "An open prayer meeting for all youth and young adults. Come with a prayer request or just come to pray.",
  },
  {
    id: "3", title: "Sabbath School Teachers Training", date: "Sun, May 18", time: "3:00 PM",
    location: "Education Block, Room 4", category: "Training", color: "#B8860B", rsvp: false,
    desc: "A training session for all Sabbath School teachers and those interested in joining the education ministry.",
  },
  {
    id: "4", title: "Community Outreach", date: "Sat, May 24", time: "2:00 PM",
    location: "Community Centre, Accra", category: "Outreach", color: "#0E7B5B", rsvp: false,
    desc: "We will be distributing food packages and sharing the gospel in the surrounding community. Volunteers welcome!",
  },
  {
    id: "5", title: "Choir Rehearsal", date: "Thu, May 22", time: "6:00 PM",
    location: "Music Room", category: "Music", color: "#8B3A8B", rsvp: true,
    desc: "Weekly choir rehearsal. All choir members are expected to attend. We will be preparing the anniversary special.",
  },
  {
    id: "6", title: "Church Board Meeting", date: "Sun, May 25", time: "10:00 AM",
    location: "Conference Room", category: "Administration", color: "#636366", rsvp: false,
    desc: "Monthly church board meeting. All board members and ministry leaders should attend.",
  },
  {
    id: "7", title: "Pathfinders Camp Meeting", date: "Fri–Sun, May 30–Jun 1", time: "All Day",
    location: "Camp Calvary", category: "Youth", color: "#C85200", rsvp: false,
    desc: "Annual Pathfinders camp meeting. Register your Pathfinders and Adventurers before May 25.",
  },
];

const CATEGORIES = ["All", "Worship", "Prayer", "Training", "Outreach", "Music", "Youth", "Administration"];

const CATEGORY_COLORS: Record<string, string> = {
  Worship: "#6B7B5A",
  Prayer: "#3B5BDB",
  Training: "#B8860B",
  Outreach: "#0E7B5B",
  Music: "#8B3A8B",
  Youth: "#C85200",
  Administration: "#636366",
};

export default function ChurchEventsScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const [activeCategory, setActiveCategory] = useState("All");
  const [rsvpd, setRsvpd] = useState<Set<string>>(new Set(["1"]));
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);

  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newCategory, setNewCategory] = useState("Worship");
  const [newDesc, setNewDesc] = useState("");

  const filtered = activeCategory === "All" ? events : events.filter((e) => e.category === activeCategory);

  function toggleRsvp(id: string) {
    setRsvpd((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        Alert.alert("RSVP Cancelled", "You have removed your RSVP for this event.");
      } else {
        next.add(id);
        Alert.alert("RSVP Confirmed! 🙏", "You're on the list! See you there.");
      }
      return next;
    });
  }

  function resetForm() {
    setNewTitle(""); setNewDate(""); setNewTime("");
    setNewLocation(""); setNewCategory("Worship"); setNewDesc("");
  }

  function handleAddEvent() {
    if (!newTitle.trim()) { Alert.alert("Missing Title", "Please enter an event title."); return; }
    if (!newDate.trim()) { Alert.alert("Missing Date", "Please enter an event date."); return; }
    if (!newTime.trim()) { Alert.alert("Missing Time", "Please enter an event time."); return; }
    if (!newLocation.trim()) { Alert.alert("Missing Location", "Please enter a location."); return; }

    const newEvent: Event = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      date: newDate.trim(),
      time: newTime.trim(),
      location: newLocation.trim(),
      category: newCategory,
      color: CATEGORY_COLORS[newCategory] ?? "#6B7B5A",
      rsvp: false,
      desc: newDesc.trim() || "No description provided.",
    };

    setEvents((prev) => [newEvent, ...prev]);
    setModalVisible(false);
    resetForm();
    Alert.alert("Event Added!", `"${newEvent.title}" has been added to the events list.`);
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Church Events</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addBtn}>
          <Ionicons name="add-circle-outline" size={26} color="#6B7B5A" />
        </TouchableOpacity>
      </View>

      {/* Category filters */}
      <View style={styles.catWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catContent}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catPill, activeCategory === cat && styles.catPillActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={44} color="#3C3C3E" />
            <Text style={styles.emptyText}>No events in this category</Text>
          </View>
        ) : (
          filtered.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <View style={[styles.colorBar, { backgroundColor: event.color }]} />
              <View style={styles.eventBody}>
                <View style={styles.eventTop}>
                  <View style={[styles.categoryBadge, { backgroundColor: event.color + "22" }]}>
                    <Text style={[styles.categoryText, { color: event.color }]}>{event.category}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.rsvpBtn, rsvpd.has(event.id) && styles.rsvpBtnActive]}
                    onPress={() => toggleRsvp(event.id)}
                  >
                    <Ionicons
                      name={rsvpd.has(event.id) ? "checkmark-circle" : "calendar-outline"}
                      size={14}
                      color={rsvpd.has(event.id) ? "#FFF" : "#6B7B5A"}
                    />
                    <Text style={[styles.rsvpText, rsvpd.has(event.id) && { color: "#FFF" }]}>
                      {rsvpd.has(event.id) ? "Going" : "RSVP"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventDesc}>{event.desc}</Text>

                <View style={styles.eventMeta}>
                  <View style={styles.metaRow}>
                    <Ionicons name="calendar-outline" size={13} color="#8E8E93" />
                    <Text style={styles.metaText}>{event.date} · {event.time}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Ionicons name="location-outline" size={13} color="#8E8E93" />
                    <Text style={styles.metaText}>{event.location}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Event Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => { setModalVisible(false); resetForm(); }}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalKAV}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Event</Text>
                <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); }}>
                  <Ionicons name="close" size={22} color="#8E8E93" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalForm}>
                <Text style={styles.fieldLabel}>Event Title *</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="e.g. Sabbath Morning Service"
                  placeholderTextColor="#636366"
                  value={newTitle}
                  onChangeText={setNewTitle}
                />

                <Text style={styles.fieldLabel}>Date *</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="e.g. Sat, Jun 7"
                  placeholderTextColor="#636366"
                  value={newDate}
                  onChangeText={setNewDate}
                />

                <Text style={styles.fieldLabel}>Time *</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="e.g. 9:30 AM"
                  placeholderTextColor="#636366"
                  value={newTime}
                  onChangeText={setNewTime}
                />

                <Text style={styles.fieldLabel}>Location *</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="e.g. Main Sanctuary"
                  placeholderTextColor="#636366"
                  value={newLocation}
                  onChangeText={setNewLocation}
                />

                <Text style={styles.fieldLabel}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catPickerRow}>
                  {Object.keys(CATEGORY_COLORS).map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.catPickerPill,
                        newCategory === cat && { backgroundColor: CATEGORY_COLORS[cat], borderColor: CATEGORY_COLORS[cat] },
                      ]}
                      onPress={() => setNewCategory(cat)}
                    >
                      <Text style={[styles.catPickerText, newCategory === cat && { color: "#FFF" }]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.fieldLabel}>Description</Text>
                <TextInput
                  style={[styles.fieldInput, styles.fieldInputMultiline]}
                  placeholder="Describe the event..."
                  placeholderTextColor="#636366"
                  value={newDesc}
                  onChangeText={setNewDesc}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />

                <TouchableOpacity style={styles.submitBtn} onPress={handleAddEvent}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
                  <Text style={styles.submitBtnText}>Add Event</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
  addBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  catWrapper: {
    flexShrink: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2C2C2E",
    marginBottom: 4,
  },
  catContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8, flexDirection: "row" },
  catPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: "#1C1C1E" },
  catPillActive: { backgroundColor: "#6B7B5A" },
  catText: { color: "#8E8E93", fontSize: 13, fontWeight: "500" },
  catTextActive: { color: "#FFF", fontWeight: "600" },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { color: "#636366", fontSize: 15 },
  eventCard: {
    flexDirection: "row", backgroundColor: "#111", borderRadius: 14,
    overflow: "hidden", marginBottom: 12,
  },
  colorBar: { width: 4 },
  eventBody: { flex: 1, padding: 14 },
  eventTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  categoryText: { fontSize: 11, fontWeight: "700" },
  rsvpBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
    borderWidth: 1, borderColor: "#6B7B5A",
  },
  rsvpBtnActive: { backgroundColor: "#6B7B5A", borderColor: "#6B7B5A" },
  rsvpText: { color: "#6B7B5A", fontSize: 12, fontWeight: "600" },
  eventTitle: { color: "#FFF", fontSize: 15, fontWeight: "700", marginBottom: 6 },
  eventDesc: { color: "#8E8E93", fontSize: 13, lineHeight: 20, marginBottom: 10 },
  eventMeta: { gap: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { color: "#636366", fontSize: 12 },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalKAV: { justifyContent: "flex-end" },
  modalContainer: {
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  modalHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: "#3C3C3E",
    alignSelf: "center",
    marginTop: 10, marginBottom: 6,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2C2C2E",
  },
  modalTitle: { color: "#FFF", fontSize: 17, fontWeight: "700" },
  modalForm: { padding: 20, paddingBottom: 50 },
  fieldLabel: { color: "#AEAEB2", fontSize: 12, fontWeight: "600", marginBottom: 6, marginTop: 14 },
  fieldInput: {
    backgroundColor: "#111",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2C2C2E",
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#FFF",
    fontSize: 14,
  },
  fieldInputMultiline: { minHeight: 80, paddingTop: 12 },
  catPickerRow: { gap: 8, paddingVertical: 4 },
  catPickerPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#111",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2C2C2E",
  },
  catPickerText: { color: "#8E8E93", fontSize: 12, fontWeight: "600" },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#4A6741",
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 24,
  },
  submitBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
});
