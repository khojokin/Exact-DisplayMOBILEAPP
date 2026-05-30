import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Platform, StatusBar, TextInput, Modal, ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

interface LessonDay {
  day: string;
  title: string;
  content: string;
}

interface Lesson {
  id: string;
  quarter: string;
  week: string;
  title: string;
  date: string;
  memory: string;
  lesson: string;
  days: LessonDay[];
}

export default function SabbathSchoolScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [search, setSearch] = useState("");
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Add lesson modal state
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newWeek, setNewWeek] = useState("");
  const [newQuarter, setNewQuarter] = useState("Q2 2026");
  const [newDate, setNewDate] = useState("");
  const [newMemory, setNewMemory] = useState("");
  const [newOverview, setNewOverview] = useState("");

  function handleCreateLesson() {
    const title = newTitle.trim();
    const week = newWeek.trim();
    if (!title || !week) return;
    const created: Lesson = {
      id: `ss${Date.now()}`,
      quarter: newQuarter.trim() || "Q2 2026",
      week,
      title,
      date: newDate.trim(),
      memory: newMemory.trim(),
      lesson: newOverview.trim(),
      days: [],
    };
    setLessons((prev) => [created, ...prev]);
    setAddModalVisible(false);
    setNewTitle("");
    setNewWeek("");
    setNewQuarter("Q2 2026");
    setNewDate("");
    setNewMemory("");
    setNewOverview("");
  }

  const filtered = lessons.filter((l) =>
    search === "" || l.title.toLowerCase().includes(search.toLowerCase()) || l.week.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sabbath School</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setAddModalVisible(true)}>
          <Ionicons name="add" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color="#636366" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search lessons..."
          placeholderTextColor="#636366"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={16} color="#636366" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.quarterBadge}>
        <Ionicons name="calendar-outline" size={14} color="#6B7B5A" />
        <Text style={styles.quarterText}>Q2 2026 Adult Bible Study Guide</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(l) => l.id}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 80 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.lessonCard} onPress={() => setSelectedLesson(item)} activeOpacity={0.8}>
            <View style={styles.lessonTop}>
              <View style={styles.weekBadge}><Text style={styles.weekText}>{item.week}</Text></View>
              <Text style={styles.dateText}>{item.date}</Text>
            </View>
            <Text style={styles.lessonTitle}>{item.title}</Text>
            <Text style={styles.lessonPreview} numberOfLines={2}>{item.lesson}</Text>
            <View style={styles.lessonFooter}>
              <Ionicons name="book-outline" size={14} color="#6B7B5A" />
              <Text style={styles.lessonFooterText}>{item.days.length} days</Text>
              <Ionicons name="chevron-forward" size={14} color="#636366" style={{ marginLeft: "auto" }} />
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <Ionicons name="book-outline" size={44} color="#3C3C3E" />
            <Text style={{ color: "#636366", marginTop: 12, fontSize: 15, fontWeight: "600" }}>No lessons yet</Text>
            <Text style={{ color: "#48484A", marginTop: 6, fontSize: 13, textAlign: "center" }}>
              Tap + to add the first Sabbath School lesson
            </Text>
          </View>
        }
      />

      {/* Full Lesson Modal */}
      <Modal visible={!!selectedLesson} animationType="slide" onRequestClose={() => { setSelectedLesson(null); setSelectedDay(null); }}>
        <View style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
          <View style={[styles.header, { paddingTop: topPad }]}>
            <TouchableOpacity onPress={() => { setSelectedLesson(null); setSelectedDay(null); }} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle} numberOfLines={1}>{selectedLesson?.title}</Text>
              <Text style={{ color: "#8E8E93", fontSize: 12 }}>{selectedLesson?.week} · {selectedLesson?.date}</Text>
            </View>
            <View style={{ width: 36 }} />
          </View>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false}>
            {selectedLesson?.memory ? (
              <View style={styles.memoryCard}>
                <Text style={styles.memoryLabel}>MEMORY TEXT</Text>
                <Text style={styles.memoryText}>{selectedLesson.memory}</Text>
              </View>
            ) : null}
            {selectedLesson?.lesson ? (
              <Text style={styles.overviewText}>{selectedLesson.lesson}</Text>
            ) : null}
            {selectedLesson?.days && selectedLesson.days.length > 0 ? (
              <>
                <Text style={styles.daysLabel}>DAILY STUDY</Text>
                {selectedLesson.days.map((day, i) => (
                  <TouchableOpacity key={i} style={styles.dayCard} onPress={() => setSelectedDay(selectedDay === i ? null : i)} activeOpacity={0.8}>
                    <View style={styles.dayHeader}>
                      <View style={styles.dayDot} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.dayDay}>{day.day}</Text>
                        <Text style={styles.dayTitle}>{day.title}</Text>
                      </View>
                      <Ionicons name={selectedDay === i ? "chevron-up" : "chevron-down"} size={16} color="#636366" />
                    </View>
                    {selectedDay === i && (
                      <Text style={styles.dayContent}>{day.content}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              <View style={{ alignItems: "center", paddingTop: 20 }}>
                <Text style={{ color: "#48484A", fontSize: 13 }}>No daily study entries added yet.</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Add Lesson Modal */}
      <Modal visible={addModalVisible} transparent animationType="slide" onRequestClose={() => setAddModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.addModalCard}>
            <Text style={styles.addTitle}>Add Sabbath School Lesson</Text>

            <TextInput
              style={styles.addInput}
              placeholder="Lesson title"
              placeholderTextColor="#636366"
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <View style={styles.addRow}>
              <TextInput
                style={[styles.addInput, { flex: 1 }]}
                placeholder="Week (e.g. Week 10)"
                placeholderTextColor="#636366"
                value={newWeek}
                onChangeText={setNewWeek}
              />
              <View style={{ width: 8 }} />
              <TextInput
                style={[styles.addInput, { flex: 1 }]}
                placeholder="Quarter (e.g. Q2 2026)"
                placeholderTextColor="#636366"
                value={newQuarter}
                onChangeText={setNewQuarter}
              />
            </View>
            <TextInput
              style={styles.addInput}
              placeholder="Date range (e.g. Jun 6–12)"
              placeholderTextColor="#636366"
              value={newDate}
              onChangeText={setNewDate}
            />
            <TextInput
              style={[styles.addInput, styles.addTextArea]}
              placeholder="Memory text"
              placeholderTextColor="#636366"
              value={newMemory}
              onChangeText={setNewMemory}
              multiline
              numberOfLines={3}
            />
            <TextInput
              style={[styles.addInput, styles.addTextArea]}
              placeholder="Lesson overview"
              placeholderTextColor="#636366"
              value={newOverview}
              onChangeText={setNewOverview}
              multiline
              numberOfLines={3}
            />

            <View style={styles.addBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, (!newTitle.trim() || !newWeek.trim()) && styles.saveBtnDisabled]}
                disabled={!newTitle.trim() || !newWeek.trim()}
                onPress={handleCreateLesson}
              >
                <Text style={styles.saveText}>Add Lesson</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12, gap: 8,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  addBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 18, backgroundColor: "#6B7B5A" },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  searchWrap: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#1C1C1E",
    borderRadius: 12, marginHorizontal: 16, marginBottom: 10, paddingHorizontal: 12, gap: 8,
  },
  searchInput: { flex: 1, color: "#FFF", fontSize: 15, paddingVertical: 10 },
  quarterBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    marginHorizontal: 16, marginBottom: 12,
  },
  quarterText: { color: "#8E8E93", fontSize: 12 },
  lessonCard: { backgroundColor: "#111", borderRadius: 14, padding: 16 },
  lessonTop: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  weekBadge: { backgroundColor: "#4A674133", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  weekText: { color: "#6B7B5A", fontSize: 11, fontWeight: "700" },
  dateText: { color: "#8E8E93", fontSize: 12 },
  lessonTitle: { color: "#FFF", fontSize: 16, fontWeight: "700", marginBottom: 8 },
  lessonPreview: { color: "#8E8E93", fontSize: 13, lineHeight: 20, marginBottom: 12 },
  lessonFooter: { flexDirection: "row", alignItems: "center", gap: 6 },
  lessonFooterText: { color: "#6B7B5A", fontSize: 12 },
  memoryCard: {
    backgroundColor: "#4A674115", borderRadius: 12, padding: 14,
    borderLeftWidth: 3, borderLeftColor: "#6B7B5A", marginBottom: 16,
  },
  memoryLabel: { color: "#6B7B5A", fontSize: 10, fontWeight: "700", letterSpacing: 0.5, marginBottom: 6 },
  memoryText: { color: "#AEAEB2", fontSize: 14, fontStyle: "italic", lineHeight: 22 },
  overviewText: { color: "#8E8E93", fontSize: 14, lineHeight: 22, marginBottom: 20 },
  daysLabel: { color: "#636366", fontSize: 11, fontWeight: "600", letterSpacing: 0.5, marginBottom: 10 },
  dayCard: { backgroundColor: "#1C1C1E", borderRadius: 12, padding: 14, marginBottom: 8 },
  dayHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  dayDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#6B7B5A" },
  dayDay: { color: "#6B7B5A", fontSize: 11, fontWeight: "600" },
  dayTitle: { color: "#FFF", fontSize: 14, fontWeight: "600" },
  dayContent: { color: "#AEAEB2", fontSize: 14, lineHeight: 22, marginTop: 12 },
  // Add modal
  overlay: { flex: 1, backgroundColor: "#000000AA", justifyContent: "flex-end" },
  addModalCard: {
    backgroundColor: "#1C1C1E", borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, paddingBottom: 40,
  },
  addTitle: { color: "#FFF", fontSize: 17, fontWeight: "700", marginBottom: 16 },
  addInput: {
    backgroundColor: "#2C2C2E", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    color: "#FFF", fontSize: 15, marginBottom: 10,
  },
  addTextArea: { minHeight: 72, textAlignVertical: "top" },
  addRow: { flexDirection: "row", marginBottom: 0 },
  addBtnRow: { flexDirection: "row", gap: 10, marginTop: 6 },
  cancelBtn: {
    flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: "center",
    backgroundColor: "#2C2C2E",
  },
  cancelText: { color: "#8E8E93", fontSize: 15, fontWeight: "600" },
  saveBtn: {
    flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: "center",
    backgroundColor: "#6B7B5A",
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
});
