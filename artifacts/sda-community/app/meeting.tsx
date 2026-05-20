import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Platform,
  StatusBar, TextInput, FlatList, ScrollView, Modal,
  Alert, Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";

const { height: SH } = Dimensions.get("window");

// ── Teams purple palette ─────────────────────────────────────────────────────
const T = {
  purple:   "#6264A7",
  purpleDim:"#464775",
  bg:       "#141414",
  panel:    "#1e1e1e",
  card:     "#252525",
  border:   "#323232",
  text:     "#FFFFFF",
  sub:      "#9D9D9D",
  green:    "#92C353",
  red:      "#C4314B",
  yellow:   "#F8D22A",
};

type Screen = "calendar" | "new-meeting" | "join" | "in-meeting";

const TODAY_MEETINGS = [
  { id: "1", title: "Saturday Prayer Meeting",  start: "10:00", end: "11:00", organizer: "Pastor James Osei", members: 5,  color: "#6264A7", status: "upcoming" as const },
  { id: "2", title: "Sabbath School Review",    start: "11:30", end: "12:15", organizer: "Elder Ruth Nakamura", members: 9, color: "#92C353", status: "upcoming" as const },
  { id: "3", title: "Youth Fellowship",         start: "14:00", end: "15:30", organizer: "Grace Adetokunbo",  members: 12, color: "#F8D22A", status: "upcoming" as const },
];

const WEEK_MEETINGS = [
  { id: "4", day: "Mon", title: "Deacons' Board",       time: "5:30 PM", members: 6, color: T.purple },
  { id: "5", day: "Wed", title: "Wednesday Bible Study", time: "7:00 PM", members: 8, color: "#00BCF2" },
  { id: "6", day: "Thu", title: "Finance Committee",    time: "4:00 PM", members: 4, color: T.green },
  { id: "7", day: "Fri", title: "Youth Leaders' Call",  time: "6:00 PM", members: 7, color: T.yellow },
];

const PARTICIPANTS = [
  { id: "1", name: "Pastor James Osei",   initials: "PJ", color: T.purple, isMuted: false, hasVideo: true },
  { id: "2", name: "Elder Ruth Nakamura", initials: "ER", color: "#B8860B", isMuted: true,  hasVideo: true },
  { id: "3", name: "David Mensah",        initials: "DM", color: "#C85200", isMuted: false, hasVideo: false },
];

const INIT_CHAT = [
  { id: "1", sender: "Pastor James Osei",   text: "God be with everyone joining today!", time: "10:01 AM", color: T.purple },
  { id: "2", sender: "Elder Ruth Nakamura", text: "Blessed Sabbath to all 🙏",            time: "10:02 AM", color: "#B8860B" },
  { id: "3", sender: "David Mensah",        text: "Amen! Looking forward to this.",        time: "10:03 AM", color: "#C85200" },
];

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const TODAY_DAY = new Date().getDay();
const TODAY_DATE = new Date().getDate();

function fmt(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function Avatar({ name, color, size = 32 }: { name: string; color: string; size?: number }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#FFF", fontSize: size * 0.36, fontWeight: "700" }}>{initials}</Text>
    </View>
  );
}

// ── Calendar / Home screen ───────────────────────────────────────────────────
function CalendarScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  return (
    <View style={[s.container, { backgroundColor: T.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={T.bg} />

      {/* ── Top bar ── */}
      <View style={[s.topBar, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="chevron-back" size={22} color={T.text} />
        </TouchableOpacity>
        <Text style={s.topTitle}>Calendar</Text>
        <TouchableOpacity style={{ padding: 8 }} onPress={() => Alert.alert("Search Meetings", "Search functionality coming soon.")}>
          <Ionicons name="search-outline" size={22} color={T.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>

        {/* ── Week strip ── */}
        <View style={s.weekStrip}>
          {DAYS.map((d, i) => {
            const isToday = i === TODAY_DAY;
            const date = TODAY_DATE - TODAY_DAY + i;
            return (
              <TouchableOpacity key={i} style={s.dayCol}>
                <Text style={[s.dayLetter, isToday && { color: T.purple }]}>{d}</Text>
                <View style={[s.dateCircle, isToday && { backgroundColor: T.purple }]}>
                  <Text style={[s.dateNum, isToday && { color: "#FFF", fontWeight: "700" }]}>{date}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Action buttons ── */}
        <View style={s.actionRow}>
          <TouchableOpacity style={s.primaryActionBtn} onPress={() => onNavigate("new-meeting")}>
            <Ionicons name="videocam" size={16} color="#FFF" />
            <Text style={s.primaryActionText}>Meet now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.secondaryActionBtn} onPress={() => Alert.alert("New Meeting", "Meeting scheduling coming soon.")}>
            <Ionicons name="calendar-outline" size={16} color={T.purple} />
            <Text style={s.secondaryActionText}>New meeting</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.secondaryActionBtn} onPress={() => onNavigate("join")}>
            <Ionicons name="link-outline" size={16} color={T.purple} />
            <Text style={s.secondaryActionText}>Join with ID</Text>
          </TouchableOpacity>
        </View>

        {/* ── Today section ── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Today</Text>
          <Text style={s.sectionSub}>{TODAY_MEETINGS.length} meetings</Text>
        </View>

        {TODAY_MEETINGS.map((mtg) => (
          <View key={mtg.id} style={s.meetingCard}>
            <View style={[s.colorBar, { backgroundColor: mtg.color }]} />
            <View style={s.meetingCardBody}>
              <View style={s.meetingTimeRow}>
                <Ionicons name="time-outline" size={12} color={T.sub} />
                <Text style={s.meetingTime}>{mtg.start} – {mtg.end}</Text>
              </View>
              <Text style={s.meetingTitle}>{mtg.title}</Text>
              <View style={s.meetingMeta}>
                <Avatar name={mtg.organizer} color={mtg.color} size={20} />
                <Text style={s.meetingOrganizer}>{mtg.organizer}</Text>
                <Text style={s.dot}>·</Text>
                <Ionicons name="people-outline" size={12} color={T.sub} />
                <Text style={s.meetingCount}>{mtg.members}</Text>
              </View>
            </View>
            <TouchableOpacity style={s.joinBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onNavigate("in-meeting"); }}>
              <Text style={s.joinBtnText}>Join</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* ── This week ── */}
        <View style={[s.sectionHeader, { marginTop: 12 }]}>
          <Text style={s.sectionTitle}>This week</Text>
        </View>

        {WEEK_MEETINGS.map((mtg) => (
          <TouchableOpacity key={mtg.id} style={s.weekRow} onPress={() => onNavigate("in-meeting")}>
            <View style={[s.weekDayTag, { backgroundColor: mtg.color + "22" }]}>
              <Text style={[s.weekDayText, { color: mtg.color }]}>{mtg.day}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.weekTitle}>{mtg.title}</Text>
              <Text style={s.weekTime}>{mtg.time} · {mtg.members} participants</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={T.sub} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ── New Meeting screen ───────────────────────────────────────────────────────
function NewMeetingScreen({ onBack, onStart }: { onBack: () => void; onStart: () => void }) {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const [topic, setTopic] = useState("");
  const [videoOn, setVideoOn] = useState(true);

  return (
    <View style={[s.container, { backgroundColor: T.bg }]}>
      <View style={[s.topBar, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={onBack} style={{ padding: 8 }}>
          <Ionicons name="chevron-back" size={22} color={T.text} />
        </TouchableOpacity>
        <Text style={s.topTitle}>New meeting</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={s.formPad} keyboardShouldPersistTaps="handled">
        {/* Preview */}
        <View style={s.preview}>
          {videoOn ? (
            <Avatar name="Maria Santos" color={T.purple} size={72} />
          ) : (
            <View style={s.videoOffBox}>
              <Ionicons name="videocam-off-outline" size={32} color={T.sub} />
              <Text style={{ color: T.sub, marginTop: 6, fontSize: 12 }}>Camera is off</Text>
            </View>
          )}
          <View style={s.previewControls}>
            <TouchableOpacity style={[s.previewBtn, !videoOn && s.previewBtnOff]} onPress={() => setVideoOn((v) => !v)}>
              <Ionicons name={videoOn ? "videocam" : "videocam-off"} size={18} color={videoOn ? T.text : T.sub} />
            </TouchableOpacity>
            <TouchableOpacity style={s.previewBtn} onPress={() => Alert.alert("Microphone", "Microphone will be toggled when the meeting starts.")}>
              <Ionicons name="mic-outline" size={18} color={T.text} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={s.inputLabel}>Meeting title</Text>
        <TextInput
          style={s.inputField}
          placeholder="SDA Community Meeting"
          placeholderTextColor={T.sub}
          value={topic}
          onChangeText={setTopic}
        />

        <Text style={s.inputLabel}>Meeting ID</Text>
        <View style={[s.inputField, { justifyContent: "center" }]}>
          <Text style={{ color: T.sub, fontSize: 15 }}>Auto-generated</Text>
        </View>

        <TouchableOpacity style={s.startNowBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onStart(); }}>
          <Ionicons name="videocam" size={18} color="#FFF" />
          <Text style={s.startNowText}>Start meeting</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.scheduleLink} onPress={() => Alert.alert("Schedule", "Calendar scheduling coming soon.")}>
          <Ionicons name="calendar-outline" size={16} color={T.purple} />
          <Text style={s.scheduleLinkText}>Schedule for later</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ── Join screen ──────────────────────────────────────────────────────────────
function JoinScreen({ onBack, onJoin }: { onBack: () => void; onJoin: () => void }) {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const [meetingId, setMeetingId] = useState("");
  const [pass, setPass] = useState("");

  return (
    <View style={[s.container, { backgroundColor: T.bg }]}>
      <View style={[s.topBar, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={onBack} style={{ padding: 8 }}>
          <Ionicons name="chevron-back" size={22} color={T.text} />
        </TouchableOpacity>
        <Text style={s.topTitle}>Join a meeting</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={s.formPad} keyboardShouldPersistTaps="handled">
        <View style={s.joinIcon}>
          <Ionicons name="people-circle-outline" size={72} color={T.purple} />
        </View>
        <Text style={s.joinPrompt}>Enter a meeting ID to join</Text>

        <Text style={s.inputLabel}>Meeting ID or link</Text>
        <TextInput style={s.inputField} placeholder="e.g. 847-293-1056 or link" placeholderTextColor={T.sub} value={meetingId} onChangeText={setMeetingId} keyboardType="default" />

        <Text style={s.inputLabel}>Passcode (optional)</Text>
        <TextInput style={s.inputField} placeholder="Enter passcode" placeholderTextColor={T.sub} secureTextEntry value={pass} onChangeText={setPass} />

        <TouchableOpacity
          style={[s.startNowBtn, !meetingId.trim() && s.startNowBtnDisabled]}
          onPress={() => { if (meetingId.trim()) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onJoin(); } }}
          disabled={!meetingId.trim()}
        >
          <Ionicons name="people" size={18} color="#FFF" />
          <Text style={s.startNowText}>Join meeting</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ── In-meeting screen ────────────────────────────────────────────────────────
function InMeetingScreen({ onEnd }: { onEnd: () => void }) {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const [elapsed, setElapsed] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showPeople, setShowPeople] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const [messages, setMessages] = useState(INIT_CHAT);
  const [handRaised, setHandRaised] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const all = [...PARTICIPANTS, { id: "you", name: "You", initials: "MS", color: "#4A6741", isMuted, hasVideo: videoOn }];

  function sendChat() {
    if (!chatMsg.trim()) return;
    setMessages((prev) => [...prev, {
      id: String(Date.now()), sender: "You", text: chatMsg.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      color: "#4A6741",
    }]);
    setChatMsg("");
  }

  return (
    <View style={[s.container, { backgroundColor: "#0d0d0d" }]}>
      {/* Top bar */}
      <View style={[s.meetTopBar, { paddingTop: topPad }]}>
        <View style={s.meetTopLeft}>
          <View style={s.secureBadge}>
            <Ionicons name="lock-closed" size={11} color={T.green} />
            <Text style={s.secureText}>Encrypted</Text>
          </View>
        </View>
        <View style={s.meetTopCenter}>
          <Text style={s.meetTopTitle}>SDA Prayer Meeting</Text>
          <Text style={s.meetTimer}>{fmt(elapsed)}</Text>
        </View>
        <TouchableOpacity
          style={s.endCallBtn}
          onPress={() => Alert.alert("Leave meeting?", undefined, [
            { text: "Leave", style: "destructive", onPress: onEnd },
            { text: "Cancel", style: "cancel" },
          ])}
        >
          <Ionicons name="call" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Participant tiles */}
      <View style={s.tileGrid}>
        {all.map((p) => (
          <View key={p.id} style={[s.tile, p.id === "you" && s.tileSelf]}>
            <View style={[s.tileAvatar, { backgroundColor: p.color }]}>
              <Text style={s.tileInitials}>{p.initials}</Text>
            </View>
            {!p.hasVideo && (
              <View style={s.videoOffChip}>
                <Ionicons name="videocam-off" size={10} color={T.sub} />
              </View>
            )}
            <View style={s.tileFooter}>
              {p.isMuted && <Ionicons name="mic-off" size={10} color={T.red} style={{ marginRight: 2 }} />}
              <Text style={s.tileName}>{p.id === "you" ? "You" : p.name.split(" ")[0]}</Text>
              {p.id === "you" && handRaised && <Text style={{ marginLeft: 3, fontSize: 10 }}>✋</Text>}
            </View>
          </View>
        ))}
      </View>

      {/* Reactions */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.reactRow}>
        {["👍", "❤️", "🙏", "😂", "🎉", "✋"].map((e) => (
          <TouchableOpacity key={e} style={s.reactBtn} onPress={() => {
            Haptics.selectionAsync();
            if (e === "✋") setHandRaised((v) => !v);
          }}>
            <Text style={{ fontSize: 20 }}>{e}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bottom toolbar — Teams style */}
      <View style={[s.meetToolbar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity style={s.toolBtn} onPress={() => { Haptics.selectionAsync(); setIsMuted((m) => !m); }}>
          <View style={[s.toolCircle, isMuted && s.toolCircleDanger]}>
            <Ionicons name={isMuted ? "mic-off" : "mic-outline"} size={20} color={isMuted ? T.red : T.text} />
          </View>
          <Text style={[s.toolLabel, isMuted && { color: T.red }]}>{isMuted ? "Unmute" : "Mute"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.toolBtn} onPress={() => { Haptics.selectionAsync(); setVideoOn((v) => !v); }}>
          <View style={[s.toolCircle, !videoOn && s.toolCircleDanger]}>
            <Ionicons name={videoOn ? "videocam-outline" : "videocam-off-outline"} size={20} color={!videoOn ? T.red : T.text} />
          </View>
          <Text style={[s.toolLabel, !videoOn && { color: T.red }]}>{videoOn ? "Camera" : "Camera"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.toolBtn} onPress={() => setShowPeople(true)}>
          <View style={[s.toolCircle, showPeople && s.toolCircleActive]}>
            <Ionicons name="people-outline" size={20} color={T.text} />
            <View style={s.pBadge}><Text style={s.pBadgeText}>{all.length}</Text></View>
          </View>
          <Text style={s.toolLabel}>People</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.toolBtn} onPress={() => setShowChat(true)}>
          <View style={[s.toolCircle, showChat && s.toolCircleActive]}>
            <Ionicons name="chatbubble-outline" size={20} color={T.text} />
          </View>
          <Text style={s.toolLabel}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.toolBtn} onPress={() => Alert.alert("More options", undefined, [
          { text: "Share Screen", onPress: () => Alert.alert("Share Screen", "Screen sharing available on desktop.") },
          { text: "Record Meeting", onPress: () => Alert.alert("Recording", "Meeting recording started.") },
          { text: "Meeting Info", onPress: () => Alert.alert("Meeting ID", "847-293-1056") },
          { text: "Cancel", style: "cancel" },
        ])}>
          <View style={s.toolCircle}>
            <Ionicons name="ellipsis-horizontal" size={20} color={T.text} />
          </View>
          <Text style={s.toolLabel}>More</Text>
        </TouchableOpacity>
      </View>

      {/* Chat panel */}
      <Modal visible={showChat} animationType="slide" transparent onRequestClose={() => setShowChat(false)}>
        <View style={ms.overlay}>
          <View style={[ms.panel, { height: SH * 0.72 }]}>
            <View style={ms.panelHandle} />
            <View style={ms.panelHeader}>
              <Text style={ms.panelTitle}>Meeting chat</Text>
              <TouchableOpacity onPress={() => setShowChat(false)}><Ionicons name="close" size={22} color={T.sub} /></TouchableOpacity>
            </View>
            <View style={ms.divider} />
            <FlatList
              data={messages}
              keyExtractor={(m) => m.id}
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 14, gap: 12 }}
              renderItem={({ item }) => (
                <View style={ms.chatRow}>
                  <Avatar name={item.sender} color={item.color} size={30} />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", gap: 6, alignItems: "baseline" }}>
                      <Text style={ms.chatSender}>{item.sender}</Text>
                      <Text style={ms.chatTime}>{item.time}</Text>
                    </View>
                    <Text style={ms.chatText}>{item.text}</Text>
                  </View>
                </View>
              )}
            />
            <View style={[ms.chatInputRow, { paddingBottom: Math.max(16, 16) }]}>
              <TextInput
                style={ms.chatInput}
                placeholder="Type a message"
                placeholderTextColor={T.sub}
                value={chatMsg}
                onChangeText={setChatMsg}
                onSubmitEditing={sendChat}
                returnKeyType="send"
              />
              <TouchableOpacity style={ms.sendBtn} onPress={sendChat}>
                <Ionicons name="send" size={18} color={chatMsg.trim() ? T.purple : T.sub} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Participants panel */}
      <Modal visible={showPeople} animationType="slide" transparent onRequestClose={() => setShowPeople(false)}>
        <View style={ms.overlay}>
          <View style={ms.panel}>
            <View style={ms.panelHandle} />
            <Text style={ms.panelTitle}>Participants ({all.length})</Text>
            <View style={ms.divider} />
            {all.map((p) => (
              <View key={p.id} style={ms.pRow}>
                <Avatar name={p.name} color={p.color} size={36} />
                <Text style={ms.pName}>{p.name}{p.id === "you" ? " (You)" : ""}</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Ionicons name={p.isMuted ? "mic-off" : "mic-outline"} size={16} color={p.isMuted ? T.red : T.green} />
                  <Ionicons name={p.hasVideo ? "videocam-outline" : "videocam-off-outline"} size={16} color={p.hasVideo ? T.green : T.red} />
                </View>
              </View>
            ))}
            <TouchableOpacity style={ms.inviteBtn} onPress={() => { setShowPeople(false); Alert.alert("Invite Link", "Meeting link copied!\nhttps://sdacommunity.app/join/847293"); }}>
              <Ionicons name="person-add-outline" size={16} color={T.purple} />
              <Text style={[ms.inviteText, { color: T.purple }]}>Invite people</Text>
            </TouchableOpacity>
            <TouchableOpacity style={ms.closeSheetBtn} onPress={() => setShowPeople(false)}>
              <Text style={ms.closeSheetText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── Root export ──────────────────────────────────────────────────────────────
export default function MeetingScreen() {
  const [screen, setScreen] = useState<Screen>("calendar");

  if (screen === "new-meeting") return <NewMeetingScreen onBack={() => setScreen("calendar")} onStart={() => setScreen("in-meeting")} />;
  if (screen === "join") return <JoinScreen onBack={() => setScreen("calendar")} onJoin={() => setScreen("in-meeting")} />;
  if (screen === "in-meeting") return <InMeetingScreen onEnd={() => setScreen("calendar")} />;
  return <CalendarScreen onNavigate={setScreen} />;
}

// ── Main styles ──────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  topBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 8, paddingBottom: 8,
  },
  topTitle: { color: T.text, fontSize: 18, fontWeight: "700" },

  // Week strip
  weekStrip: {
    flexDirection: "row", justifyContent: "space-around",
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: T.panel,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: T.border,
  },
  dayCol: { alignItems: "center", gap: 6 },
  dayLetter: { color: T.sub, fontSize: 11, fontWeight: "600" },
  dateCircle: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  dateNum: { color: T.text, fontSize: 14 },

  // Action row
  actionRow: {
    flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 14,
  },
  primaryActionBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: T.purple, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 10, flex: 1, justifyContent: "center",
  },
  primaryActionText: { color: "#FFF", fontSize: 13, fontWeight: "700" },
  secondaryActionBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: T.card, borderRadius: 8, borderWidth: 1, borderColor: T.border,
    paddingHorizontal: 10, paddingVertical: 10, flex: 1, justifyContent: "center",
  },
  secondaryActionText: { color: T.purple, fontSize: 12, fontWeight: "600" },

  // Section
  sectionHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 10,
  },
  sectionTitle: { color: T.text, fontSize: 15, fontWeight: "700" },
  sectionSub: { color: T.sub, fontSize: 12 },

  // Meeting card
  meetingCard: {
    flexDirection: "row", alignItems: "center",
    marginHorizontal: 16, marginBottom: 8,
    backgroundColor: T.card, borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth, borderColor: T.border,
    overflow: "hidden",
  },
  colorBar: { width: 4, alignSelf: "stretch" },
  meetingCardBody: { flex: 1, padding: 12, gap: 4 },
  meetingTimeRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  meetingTime: { color: T.sub, fontSize: 11 },
  meetingTitle: { color: T.text, fontSize: 14, fontWeight: "600" },
  meetingMeta: { flexDirection: "row", alignItems: "center", gap: 5 },
  meetingOrganizer: { color: T.sub, fontSize: 11 },
  dot: { color: T.sub, fontSize: 11 },
  meetingCount: { color: T.sub, fontSize: 11 },
  joinBtn: {
    backgroundColor: T.purple, borderRadius: 6,
    paddingHorizontal: 14, paddingVertical: 8, margin: 12,
  },
  joinBtnText: { color: "#FFF", fontSize: 13, fontWeight: "700" },

  // Week rows
  weekRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: T.border,
  },
  weekDayTag: { width: 36, height: 36, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  weekDayText: { fontSize: 11, fontWeight: "700" },
  weekTitle: { color: T.text, fontSize: 14, fontWeight: "600" },
  weekTime: { color: T.sub, fontSize: 12, marginTop: 1 },

  // Form
  formPad: { padding: 20, gap: 12 },
  preview: {
    alignItems: "center", backgroundColor: "#1a1a1a", borderRadius: 16,
    padding: 24, marginBottom: 8, gap: 16,
  },
  videoOffBox: { alignItems: "center", width: 80, height: 80, backgroundColor: T.panel, borderRadius: 12, justifyContent: "center" },
  previewControls: { flexDirection: "row", gap: 12 },
  previewBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: T.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: T.border },
  previewBtnOff: { backgroundColor: T.red + "22", borderColor: T.red + "55" },
  inputLabel: { color: T.sub, fontSize: 13, fontWeight: "600", marginTop: 4 },
  inputField: {
    backgroundColor: T.card, borderRadius: 8, borderWidth: 1, borderColor: T.border,
    paddingHorizontal: 14, height: 48, color: T.text, fontSize: 15,
  },
  startNowBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: T.purple, borderRadius: 10, height: 52, marginTop: 8,
  },
  startNowBtnDisabled: { opacity: 0.4 },
  startNowText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  scheduleLink: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 8 },
  scheduleLinkText: { color: T.purple, fontSize: 14, fontWeight: "600" },
  joinIcon: { alignItems: "center", marginVertical: 16 },
  joinPrompt: { color: T.sub, fontSize: 14, textAlign: "center", marginBottom: 8 },

  // In-meeting
  meetTopBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: "#1a1a1a",
  },
  meetTopLeft: {},
  secureBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: T.green + "22", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  secureText: { color: T.green, fontSize: 11, fontWeight: "600" },
  meetTopCenter: { alignItems: "center" },
  meetTopTitle: { color: T.text, fontSize: 15, fontWeight: "700" },
  meetTimer: { color: T.sub, fontSize: 12, marginTop: 1 },
  endCallBtn: { backgroundColor: T.red, width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },

  // Tiles
  tileGrid: { flex: 1, flexDirection: "row", flexWrap: "wrap", padding: 8, gap: 6 },
  tile: { width: "48%", backgroundColor: "#1e1e1e", borderRadius: 12, aspectRatio: 1.2, alignItems: "center", justifyContent: "center", position: "relative" },
  tileSelf: { borderWidth: 2, borderColor: T.purple },
  tileAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  tileInitials: { color: "#FFF", fontSize: 20, fontWeight: "700" },
  videoOffChip: { position: "absolute", top: 8, right: 8, backgroundColor: "#000000aa", borderRadius: 4, padding: 3 },
  tileFooter: { position: "absolute", bottom: 8, left: 8, flexDirection: "row", alignItems: "center", backgroundColor: "#00000099", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  tileName: { color: "#FFF", fontSize: 11, fontWeight: "600" },

  // Reactions
  reactRow: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  reactBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: T.card, alignItems: "center", justifyContent: "center" },

  // Bottom toolbar
  meetToolbar: {
    flexDirection: "row", justifyContent: "space-around", alignItems: "flex-start",
    paddingTop: 12, paddingHorizontal: 8, backgroundColor: "#1a1a1a",
  },
  toolBtn: { alignItems: "center", gap: 4, minWidth: 56 },
  toolCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: T.card, alignItems: "center", justifyContent: "center", position: "relative" },
  toolCircleDanger: { backgroundColor: T.red + "22" },
  toolCircleActive: { backgroundColor: T.purple + "44" },
  toolLabel: { color: T.sub, fontSize: 10, fontWeight: "500" },
  pBadge: { position: "absolute", top: -2, right: -2, backgroundColor: T.red, borderRadius: 8, minWidth: 16, height: 16, alignItems: "center", justifyContent: "center", paddingHorizontal: 3 },
  pBadgeText: { color: "#FFF", fontSize: 9, fontWeight: "700" },
});

// ── Modal styles ─────────────────────────────────────────────────────────────
const ms = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  panel: {
    backgroundColor: T.panel, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20, minHeight: SH * 0.45,
  },
  panelHandle: { width: 36, height: 4, backgroundColor: T.border, borderRadius: 2, alignSelf: "center", marginBottom: 12 },
  panelHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  panelTitle: { color: T.text, fontSize: 16, fontWeight: "700" },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: T.border, marginBottom: 12 },
  chatRow: { flexDirection: "row", gap: 10 },
  chatSender: { color: T.text, fontSize: 13, fontWeight: "600" },
  chatTime: { color: T.sub, fontSize: 11 },
  chatText: { color: T.sub, fontSize: 13, marginTop: 2 },
  chatInputRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: T.border },
  chatInput: { flex: 1, backgroundColor: T.card, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, color: T.text, fontSize: 14, borderWidth: 1, borderColor: T.border },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: T.card, alignItems: "center", justifyContent: "center" },
  pRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: T.border },
  pName: { flex: 1, color: T.text, fontSize: 14, fontWeight: "500" },
  inviteBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 14, justifyContent: "center" },
  inviteText: { fontSize: 14, fontWeight: "600" },
  closeSheetBtn: { backgroundColor: T.card, borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 4 },
  closeSheetText: { color: T.text, fontSize: 15, fontWeight: "600" },
});
