import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Platform, StatusBar, TextInput, Modal, ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

const LESSONS = [
  {
    id: "ss1", quarter: "Q2 2026", week: "Week 7", title: "The Power of the Holy Spirit",
    date: "May 9–15",
    memory: "\"But you will receive power when the Holy Spirit comes on you; and you will be my witnesses in Jerusalem, and in all Judea and Samaria, and to the ends of the earth.\" — Acts 1:8",
    lesson: "This week's lesson explores how the Holy Spirit empowers believers for witness and ministry. We study the events of Pentecost and their significance for the church today.",
    days: [
      { day: "Sunday", title: "The Promise Given", content: "Jesus promised His disciples that the Father would send another Counselor — the Holy Spirit. This promise was not just for the first disciples but for all who believe. The Holy Spirit is God's presence dwelling within believers, guiding, comforting, and empowering them for kingdom work." },
      { day: "Monday", title: "Wind and Fire", content: "On the day of Pentecost, the Holy Spirit came with the sound of a rushing wind and tongues of fire. These dramatic symbols represented the power and purifying presence of God. The wind represents the invisible yet powerful movement of the Spirit, while fire symbolizes purification and divine presence." },
      { day: "Tuesday", title: "Peter's Sermon", content: "Peter, filled with the Holy Spirit, stood up and preached a bold sermon to the crowd. His message about Jesus — His life, death, resurrection, and exaltation — resulted in about three thousand people being baptized that day. This was the Spirit's power at work through an ordinary fisherman." },
      { day: "Wednesday", title: "The Community Formed", content: "The newly formed church devoted themselves to the apostles' teaching, fellowship, breaking of bread, and prayer. This early community shared everything in common, and the Lord added to their number daily. The Spirit created a new kind of community centered on Christ." },
      { day: "Thursday", title: "Continuing in the Spirit", content: "The work of the Spirit did not end at Pentecost. Throughout Acts, we see the Spirit continuing to guide, empower, and expand the church. Today, the same Spirit is available to every believer, equipping us for the mission God has given us." },
      { day: "Friday", title: "Further Study", content: "Read Ellen G. White, The Acts of the Apostles, chapters 1–5. Reflect on how the outpouring of the Spirit at Pentecost relates to the 'latter rain' that will precede Christ's second coming. How can we position ourselves to receive the fullness of the Spirit's power today?" },
    ],
  },
  {
    id: "ss2", quarter: "Q2 2026", week: "Week 8", title: "Living by Faith",
    date: "May 16–22",
    memory: "\"Now faith is confidence in what we hope for and assurance about what we do not see.\" — Hebrews 11:1",
    lesson: "Faith is not merely intellectual assent but a living, active trust in God's promises. This week we examine what it means to truly live by faith in our daily lives.",
    days: [
      { day: "Sunday", title: "The Nature of Faith", content: "Faith is not a feeling or mere optimism — it is a deep trust in God based on His revealed character and promises. Biblical faith involves both believing that God exists and trusting that He rewards those who earnestly seek Him (Hebrews 11:6)." },
      { day: "Monday", title: "Abraham's Example", content: "Abraham is called the father of the faithful because he trusted God even when it made no human sense. He left his homeland, waited years for a promised son, and was even willing to sacrifice that son. His faith was credited to him as righteousness." },
      { day: "Tuesday", title: "Faith in Action", content: "True faith always produces action. James reminds us that faith without works is dead. This does not mean we earn salvation through works, but that genuine faith naturally expresses itself in obedience, love, and service." },
      { day: "Wednesday", title: "Faith and Works", content: "The relationship between faith and works has been debated throughout church history. Paul emphasizes that we are saved by faith alone, while James emphasizes that saving faith always shows itself in action. Both perspectives are necessary for a complete picture." },
      { day: "Thursday", title: "Enduring Faith", content: "The heroes of Hebrews 11 did not always see the fulfillment of God's promises in their lifetimes. Yet they trusted God's word and died in faith. This enduring faith — persisting through trials, disappointments, and delays — is what God honors." },
      { day: "Friday", title: "Further Study", content: "Read Ellen G. White, Steps to Christ, chapters 11–12. Consider: What is one area of your life where God is calling you to greater trust? How can you exercise your faith muscle this week in practical ways?" },
    ],
  },
  {
    id: "ss3", quarter: "Q2 2026", week: "Week 9", title: "The Sabbath Rest",
    date: "May 23–29",
    memory: "\"Remember the Sabbath day by keeping it holy. Six days you shall labor and do all your work, but the seventh day is a sabbath to the Lord your God.\" — Exodus 20:8–10",
    lesson: "The Sabbath is God's gift to humanity — a day of rest, worship, and communion with our Creator. This lesson dives deep into the meaning and blessing of the Sabbath.",
    days: [
      { day: "Sunday", title: "Created for Rest", content: "From the very beginning, God built rest into the fabric of creation. After six days of creative work, God rested on the seventh day. This was not because God was tired, but to establish a rhythm of work and rest that would sustain human flourishing." },
      { day: "Monday", title: "The Sabbath in Eden", content: "The Sabbath was instituted before sin entered the world, making it a creation ordinance for all humanity, not just Israel. In Eden, Adam and Eve's first full day of existence was the Sabbath — a day to delight in God and His creation." },
      { day: "Tuesday", title: "The Fourth Commandment", content: "The Sabbath is the only commandment that begins with 'Remember' — perhaps because God knew we would forget. The commandment calls us to cease from labor, to hallow the day, and to allow our servants and animals to rest as well." },
      { day: "Wednesday", title: "Jesus and the Sabbath", content: "Jesus declared Himself Lord of the Sabbath and healed on the Sabbath, showing that acts of mercy and restoration are entirely in keeping with the day's spirit. He did not abolish the Sabbath but restored its true meaning as a day of life and joy." },
      { day: "Thursday", title: "Sabbath as Sign", content: "God designated the Sabbath as a sign between Himself and His people — a weekly declaration that He is our Creator and Sanctifier. Keeping the Sabbath is an act of faith and allegiance, a testimony that we belong to God." },
      { day: "Friday", title: "Further Study", content: "Read Ellen G. White, The Desire of Ages, chapter 29, 'At Bethesda'. Consider: How can you make your Sabbath observance more meaningful and joyful? What activities help you connect with God and His creation on the Sabbath?" },
    ],
  },
];

export default function SabbathSchoolScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const [search, setSearch] = useState("");
  const [selectedLesson, setSelectedLesson] = useState<typeof LESSONS[0] | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const filtered = LESSONS.filter((l) =>
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
        <View style={{ width: 36 }} />
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
              <Ionicons name="book-open-outline" size={14} color="#6B7B5A" />
              <Text style={styles.lessonFooterText}>{item.days.length} days</Text>
              <Ionicons name="chevron-forward" size={14} color="#636366" style={{ marginLeft: "auto" }} />
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
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
            <View style={styles.memoryCard}>
              <Text style={styles.memoryLabel}>MEMORY TEXT</Text>
              <Text style={styles.memoryText}>{selectedLesson?.memory}</Text>
            </View>
            <Text style={styles.overviewText}>{selectedLesson?.lesson}</Text>
            <Text style={styles.daysLabel}>DAILY STUDY</Text>
            {selectedLesson?.days.map((day, i) => (
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
          </ScrollView>
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
});
