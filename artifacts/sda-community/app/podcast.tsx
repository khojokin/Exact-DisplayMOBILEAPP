import React, { useState, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Platform, StatusBar, ScrollView, Modal, Dimensions,
  Share, Alert, TextInput,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";

const { width: SW } = Dimensions.get("window");

interface Episode {
  id: string;
  showId: string;
  title: string;
  description: string;
  duration: string;
  durationSecs: number;
  date: string;
  played: number;
}
interface Show {
  id: string;
  name: string;
  host: string;
  description: string;
  color: string;
  icon: string;
  episodes: number;
}

const SHOWS: Show[] = [
  {
    id: "gospel",
    name: "The Everlasting Gospel",
    host: "Pastor James Osei",
    description: "Weekly expository sermons from the SDA Community pulpit. Deep dives into scripture and prophetic truth.",
    color: "#3B5BDB",
    icon: "book-outline",
    episodes: 142,
  },
  {
    id: "devotion",
    name: "Daily Devotional",
    host: "Elder Ruth Nakamura",
    description: "5-minute morning devotions to start your day in the Word. Fresh every morning, Monday through Saturday.",
    color: "#6B7B5A",
    icon: "sunny-outline",
    episodes: 365,
  },
  {
    id: "youth",
    name: "SDA Youth Hour",
    host: "David Mensah & Youth Team",
    description: "Relevant conversations for Seventh-day Adventist youth navigating faith, culture, and purpose.",
    color: "#C85200",
    icon: "people-outline",
    episodes: 58,
  },
  {
    id: "prophecy",
    name: "Bible Prophecy Today",
    host: "Dr. Emmanuel Darko",
    description: "Exploring Daniel, Revelation, and the Spirit of Prophecy through careful, verse-by-verse study.",
    color: "#B8860B",
    icon: "telescope-outline",
    episodes: 88,
  },
];

const EPISODES: Episode[] = [
  {
    id: "e1", showId: "gospel",
    title: "The Sanctuary: God's Blueprint for Redemption",
    description: "An in-depth study of the heavenly sanctuary and its significance for SDA believers today. Pastor James walks through the tabernacle structure, its furniture, and what each element points to in Christ's ministry.",
    duration: "52:14", durationSecs: 3134, date: "May 17, 2026", played: 0,
  },
  {
    id: "e2", showId: "devotion",
    title: "Be Still and Know — Psalm 46:10",
    description: "Elder Ruth Nakamura meditates on what it means to be still before God in a noisy world. A powerful 5-minute word to start your Sabbath morning.",
    duration: "5:02", durationSecs: 302, date: "May 17, 2026", played: 1,
  },
  {
    id: "e3", showId: "youth",
    title: "Faith, Social Media & Mental Health",
    description: "David Mensah and guests discuss how young SDA members can guard their hearts and minds in the age of social media, while staying rooted in Christ.",
    duration: "38:47", durationSecs: 2327, date: "May 15, 2026", played: 0.3,
  },
  {
    id: "e4", showId: "gospel",
    title: "Daniel 2: The Dream That Changed History",
    description: "Why did God reveal the rise and fall of world empires to a pagan king? Pastor James unpacks Daniel chapter 2 and the statue of world empires.",
    duration: "45:30", durationSecs: 2730, date: "May 10, 2026", played: 0.85,
  },
  {
    id: "e5", showId: "prophecy",
    title: "The 1844 Judgment — Vindication or Condemnation?",
    description: "Dr. Emmanuel Darko carefully examines the investigative judgment, answering the hardest questions critics raise and showing why this teaching is good news.",
    duration: "1:02:18", durationSecs: 3738, date: "May 8, 2026", played: 0,
  },
  {
    id: "e6", showId: "devotion",
    title: "His Mercies Are New Every Morning",
    description: "Lamentations 3:22-23 reminds us that God's compassions never fail. Elder Ruth shares a personal testimony and a simple prayer to begin your day.",
    duration: "4:48", durationSecs: 288, date: "May 16, 2026", played: 1,
  },
  {
    id: "e7", showId: "youth",
    title: "Why I'm Staying SDA — Honest Conversations",
    description: "Three young adults share raw, honest testimonies about doubt, questioning, and ultimately choosing to stay committed to the Adventist faith.",
    duration: "44:05", durationSecs: 2645, date: "May 12, 2026", played: 0,
  },
  {
    id: "e8", showId: "gospel",
    title: "The State of the Dead: What the Bible Actually Says",
    description: "One of the most misunderstood biblical topics, carefully addressed with scripture. Pastor James walks through key passages on death, sleep, and resurrection hope.",
    duration: "49:22", durationSecs: 2962, date: "May 3, 2026", played: 0.15,
  },
];

function fmtProgress(secs: number, played: number): string {
  const elapsed = Math.floor(secs * played);
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return `${m}:${String(s).padStart(2, "0")} played`;
}

export default function PodcastScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [currentEp, setCurrentEp] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerProgress, setPlayerProgress] = useState(0);
  const [selectedShow, setSelectedShow] = useState<string | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const SPEEDS = [1, 1.25, 1.5, 1.75, 2];
  const [speedIdx, setSpeedIdx] = useState(0);

  const displayedEps = EPISODES.filter((e) => {
    const matchShow = !selectedShow || e.showId === selectedShow;
    const matchSearch = searchText === "" ||
      e.title.toLowerCase().includes(searchText.toLowerCase()) ||
      e.description.toLowerCase().includes(searchText.toLowerCase());
    return matchShow && matchSearch;
  });

  function playEpisode(ep: Episode) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCurrentEp(ep);
    setIsPlaying(true);
    setPlayerProgress(ep.played);
    setShowPlayer(true);
  }

  function toggleLike(id: string) {
    Haptics.selectionAsync();
    setLiked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function getShow(showId: string) {
    return SHOWS.find((s) => s.id === showId)!;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Podcasts</Text>
        <TouchableOpacity style={styles.headerSearch} onPress={() => { setShowSearch((v) => !v); if (showSearch) setSearchText(""); }}>
          <Ionicons name={showSearch ? "close-outline" : "search-outline"} size={22} color={showSearch ? "#FFF" : "#8E8E93"} />
        </TouchableOpacity>
      </View>
      {showSearch && (
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={15} color="#636366" />
          <TextInput
            style={styles.searchBarInput}
            placeholder="Search episodes..."
            placeholderTextColor="#636366"
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Ionicons name="close-circle" size={15} color="#636366" />
            </TouchableOpacity>
          )}
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: currentEp ? insets.bottom + 110 : insets.bottom + 40 }}
      >
        {/* Featured show */}
        <View style={styles.featuredCard}>
          <View style={[styles.featuredArt, { backgroundColor: SHOWS[0].color + "33" }]}>
            <Ionicons name={SHOWS[0].icon as any} size={60} color={SHOWS[0].color} />
          </View>
          <View style={styles.featuredInfo}>
            <Text style={styles.featuredLabel}>FEATURED SHOW</Text>
            <Text style={styles.featuredTitle}>{SHOWS[0].name}</Text>
            <Text style={styles.featuredHost}>by {SHOWS[0].host}</Text>
            <Text style={styles.featuredDesc} numberOfLines={2}>{SHOWS[0].description}</Text>
            <TouchableOpacity
              style={[styles.featuredPlayBtn, { backgroundColor: SHOWS[0].color }]}
              onPress={() => playEpisode(EPISODES[0])}
            >
              <Ionicons name="play" size={16} color="#FFF" />
              <Text style={styles.featuredPlayText}>Play Latest</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Shows scroll */}
        <Text style={styles.sectionLabel}>ALL SHOWS</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.showsScroll}
        >
          <TouchableOpacity
            style={[styles.showChip, !selectedShow && styles.showChipActive]}
            onPress={() => setSelectedShow(null)}
          >
            <Text style={[styles.showChipText, !selectedShow && styles.showChipTextActive]}>All</Text>
          </TouchableOpacity>
          {SHOWS.map((show) => (
            <TouchableOpacity
              key={show.id}
              style={[styles.showPill, selectedShow === show.id && { borderColor: show.color, backgroundColor: show.color + "22" }]}
              onPress={() => { Haptics.selectionAsync(); setSelectedShow(selectedShow === show.id ? null : show.id); }}
            >
              <View style={[styles.showPillDot, { backgroundColor: show.color }]} />
              <Text style={styles.showPillText}>{show.name.split(":")[0].split(",")[0]}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Shows grid */}
        <Text style={styles.sectionLabel}>BROWSE SHOWS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.showsGrid}>
          {SHOWS.map((show) => (
            <TouchableOpacity
              key={show.id}
              style={styles.showCard}
              onPress={() => { Haptics.selectionAsync(); setSelectedShow(show.id); }}
              activeOpacity={0.8}
            >
              <View style={[styles.showArt, { backgroundColor: show.color + "22" }]}>
                <Ionicons name={show.icon as any} size={40} color={show.color} />
              </View>
              <Text style={styles.showName} numberOfLines={2}>{show.name}</Text>
              <Text style={styles.showHost} numberOfLines={1}>{show.host}</Text>
              <Text style={[styles.showEps, { color: show.color }]}>{show.episodes} episodes</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Episodes list */}
        <Text style={styles.sectionLabel}>
          {selectedShow ? SHOWS.find((s) => s.id === selectedShow)?.name.toUpperCase() : "RECENT EPISODES"}
        </Text>
        {displayedEps.map((ep) => {
          const show = getShow(ep.showId);
          const isActive = currentEp?.id === ep.id;
          const isEpPlaying = isActive && isPlaying;
          return (
            <View key={ep.id} style={[styles.epCard, isActive && { borderColor: show.color + "66", borderWidth: 1 }]}>
              <View style={styles.epTop}>
                <View style={[styles.epShowDot, { backgroundColor: show.color }]} />
                <Text style={[styles.epShow, { color: show.color }]}>{show.name}</Text>
                <Text style={styles.epDate}>{ep.date}</Text>
              </View>
              <Text style={styles.epTitle}>{ep.title}</Text>
              <Text style={styles.epDesc} numberOfLines={2}>{ep.description}</Text>

              {ep.played > 0 && ep.played < 1 && (
                <View style={styles.progressWrap}>
                  <View style={[styles.progressBar, { width: `${ep.played * 100}%` as any, backgroundColor: show.color }]} />
                  <Text style={styles.progressLabel}>{fmtProgress(ep.durationSecs, ep.played)} of {ep.duration}</Text>
                </View>
              )}
              {ep.played >= 1 && (
                <Text style={styles.playedBadge}>✓ Played</Text>
              )}

              <View style={styles.epActions}>
                <TouchableOpacity style={styles.playBtn} onPress={() => playEpisode(ep)}>
                  <Ionicons name={isEpPlaying ? "pause-circle" : "play-circle"} size={38} color={show.color} />
                </TouchableOpacity>
                <Text style={styles.epDuration}>{ep.duration}</Text>
                <View style={{ flex: 1 }} />
                <TouchableOpacity onPress={() => toggleLike(ep.id)} style={styles.epActionBtn}>
                  <Ionicons name={liked.has(ep.id) ? "heart" : "heart-outline"} size={20} color={liked.has(ep.id) ? "#FF453A" : "#636366"} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.epActionBtn} onPress={() => { Haptics.selectionAsync(); Share.share({ message: `🎙️ "${ep.title}" on ${SHOWS.find(s=>s.id===ep.showId)?.name}\n\nListen on SDA Community App.` }); }}>
                  <Ionicons name="arrow-redo-outline" size={20} color="#636366" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.epActionBtn} onPress={() => { Haptics.selectionAsync(); Alert.alert(ep.title, undefined, [ { text: "Add to Queue", onPress: () => playEpisode(ep) }, { text: "Share Episode", onPress: () => Share.share({ message: `🎙️ "${ep.title}" — Listen on SDA Community` }) }, { text: "Cancel", style: "cancel" }]); }}>
                  <Feather name="more-horizontal" size={20} color="#636366" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Mini player */}
      {currentEp && (
        <TouchableOpacity
          style={[styles.miniPlayer, { paddingBottom: Math.max(insets.bottom + 4, 12) }]}
          activeOpacity={0.95}
          onPress={() => setShowPlayer(true)}
        >
          <View style={[styles.miniPlayerArt, { backgroundColor: getShow(currentEp.showId).color + "33" }]}>
            <Ionicons name={getShow(currentEp.showId).icon as any} size={22} color={getShow(currentEp.showId).color} />
          </View>
          <View style={styles.miniPlayerInfo}>
            <Text style={styles.miniPlayerTitle} numberOfLines={1}>{currentEp.title}</Text>
            <Text style={styles.miniPlayerShow} numberOfLines={1}>{getShow(currentEp.showId).name}</Text>
          </View>
          <TouchableOpacity onPress={() => { Haptics.selectionAsync(); setIsPlaying(!isPlaying); }} style={styles.miniPlayBtn}>
            <Ionicons name={isPlaying ? "pause" : "play"} size={22} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setCurrentEp(null); setIsPlaying(false); }} style={styles.miniCloseBtn}>
            <Ionicons name="close" size={18} color="#8E8E93" />
          </TouchableOpacity>
          {/* Progress bar at top of mini player */}
          <View style={styles.miniProgressTrack}>
            <View style={[styles.miniProgressFill, { width: `${playerProgress * 100}%` as any, backgroundColor: getShow(currentEp.showId).color }]} />
          </View>
        </TouchableOpacity>
      )}

      {/* Full player modal */}
      <Modal visible={showPlayer && !!currentEp} animationType="slide" onRequestClose={() => setShowPlayer(false)}>
        {currentEp && (
          <View style={[styles.fullPlayer, { paddingTop: topPad }]}>
            <StatusBar barStyle="light-content" backgroundColor="#111" />
            <View style={styles.fpHeader}>
              <TouchableOpacity onPress={() => setShowPlayer(false)}>
                <Ionicons name="chevron-down" size={28} color="#8E8E93" />
              </TouchableOpacity>
              <View style={styles.fpHeaderCenter}>
                <Text style={styles.fpNowPlaying}>NOW PLAYING</Text>
                <Text style={styles.fpShow}>{getShow(currentEp.showId).name}</Text>
              </View>
              <TouchableOpacity onPress={() => { Haptics.selectionAsync(); Alert.alert("Episode Options", undefined, [ { text: `Share Episode`, onPress: () => Share.share({ message: `🎙️ "${currentEp?.title}" — Listen on SDA Community` }) }, { text: "Go to Show", onPress: () => { setShowPlayer(false); setSelectedShow(currentEp?.showId ?? null); } }, { text: "Cancel", style: "cancel" }]); }}>
                <Feather name="more-horizontal" size={22} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <View style={[styles.fpArt, { backgroundColor: getShow(currentEp.showId).color + "22" }]}>
              <Ionicons name={getShow(currentEp.showId).icon as any} size={100} color={getShow(currentEp.showId).color} />
            </View>

            <View style={styles.fpMeta}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fpTitle}>{currentEp.title}</Text>
                <Text style={styles.fpHost}>{getShow(currentEp.showId).host}</Text>
              </View>
              <TouchableOpacity onPress={() => toggleLike(currentEp.id)}>
                <Ionicons name={liked.has(currentEp.id) ? "heart" : "heart-outline"} size={26} color={liked.has(currentEp.id) ? "#FF453A" : "#636366"} />
              </TouchableOpacity>
            </View>

            {/* Progress slider */}
            <View style={styles.fpSliderWrap}>
              <View style={styles.fpTrack}>
                <View style={[styles.fpFill, { width: `${playerProgress * 100}%` as any, backgroundColor: getShow(currentEp.showId).color }]} />
                <View style={[styles.fpThumb, { left: `${Math.max(playerProgress * 100 - 1, 0)}%` as any, backgroundColor: getShow(currentEp.showId).color }]} />
              </View>
              <View style={styles.fpTimes}>
                <Text style={styles.fpTimeText}>{fmtProgress(currentEp.durationSecs, playerProgress)}</Text>
                <Text style={styles.fpTimeText}>-{fmtProgress(currentEp.durationSecs, 1 - playerProgress)}</Text>
              </View>
            </View>

            {/* Controls */}
            <View style={styles.fpControls}>
              <TouchableOpacity onPress={() => Haptics.selectionAsync()}>
                <Ionicons name="shuffle-outline" size={24} color="#636366" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setPlayerProgress(Math.max(0, playerProgress - 30 / currentEp.durationSecs)); Haptics.selectionAsync(); }}>
                <Ionicons name="play-back-outline" size={30} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.fpPlayBtn, { backgroundColor: getShow(currentEp.showId).color }]}
                onPress={() => { setIsPlaying(!isPlaying); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
              >
                <Ionicons name={isPlaying ? "pause" : "play"} size={34} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setPlayerProgress(Math.min(1, playerProgress + 30 / currentEp.durationSecs)); Haptics.selectionAsync(); }}>
                <Ionicons name="play-forward-outline" size={30} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Haptics.selectionAsync()}>
                <Ionicons name="repeat-outline" size={24} color="#636366" />
              </TouchableOpacity>
            </View>

            <View style={styles.fpExtras}>
              <TouchableOpacity style={styles.fpExtraBtn} onPress={() => { Haptics.selectionAsync(); setSpeedIdx((i) => (i + 1) % SPEEDS.length); }}>
                <Ionicons name="speedometer-outline" size={20} color="#6B7B5A" />
                <Text style={[styles.fpExtraLabel, { color: "#6B7B5A" }]}>{SPEEDS[speedIdx]}× Speed</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.fpExtraBtn} onPress={() => { Haptics.selectionAsync(); Alert.alert("Sleep Timer", "Stop playing after:", [ { text: "15 minutes" }, { text: "30 minutes" }, { text: "End of episode" }, { text: "Cancel", style: "cancel" }]); }}>
                <Ionicons name="moon-outline" size={20} color="#636366" />
                <Text style={styles.fpExtraLabel}>Sleep Timer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.fpExtraBtn} onPress={() => { Haptics.selectionAsync(); if (currentEp) Share.share({ message: `🎙️ "${currentEp.title}"\n${getShow(currentEp.showId).name}\n\nListening on SDA Community App` }); }}>
                <Ionicons name="arrow-redo-outline" size={20} color="#636366" />
                <Text style={styles.fpExtraLabel}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.fpExtraBtn} onPress={() => { Haptics.selectionAsync(); Alert.alert("Transcript", currentEp ? `Full transcript for "${currentEp.title}" is available in the episode notes on the SDA Community website.` : "", [{ text: "OK" }]); }}>
                <Ionicons name="chatbubble-outline" size={20} color="#636366" />
                <Text style={styles.fpExtraLabel}>Transcript</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#2C2C2E",
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  headerSearch: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#1C1C1E", borderRadius: 12,
    marginHorizontal: 16, marginBottom: 8, paddingHorizontal: 12,
  },
  searchBarInput: { flex: 1, color: "#FFF", fontSize: 15, paddingVertical: 10 },
  featuredCard: {
    flexDirection: "row", margin: 16, gap: 14,
    backgroundColor: "#111", borderRadius: 16, padding: 16, overflow: "hidden",
  },
  featuredArt: {
    width: 100, height: 100, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  featuredInfo: { flex: 1, gap: 4 },
  featuredLabel: { color: "#636366", fontSize: 9, fontWeight: "700", letterSpacing: 0.8 },
  featuredTitle: { color: "#FFF", fontSize: 14, fontWeight: "700", lineHeight: 18 },
  featuredHost: { color: "#8E8E93", fontSize: 11 },
  featuredDesc: { color: "#8E8E93", fontSize: 11, lineHeight: 16 },
  featuredPlayBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, alignSelf: "flex-start", marginTop: 4,
  },
  featuredPlayText: { color: "#FFF", fontSize: 12, fontWeight: "700" },
  sectionLabel: {
    color: "#636366", fontSize: 11, fontWeight: "600", letterSpacing: 0.5,
    marginHorizontal: 16, marginTop: 20, marginBottom: 10,
  },
  showsScroll: { paddingHorizontal: 16, gap: 8 },
  showChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: "#1C1C1E", borderWidth: StyleSheet.hairlineWidth, borderColor: "#2C2C2E",
  },
  showChipActive: { backgroundColor: "#4A6741", borderColor: "#6B7B5A" },
  showChipText: { color: "#8E8E93", fontSize: 13, fontWeight: "500" },
  showChipTextActive: { color: "#FFF", fontWeight: "600" },
  showPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    backgroundColor: "#1C1C1E", borderWidth: StyleSheet.hairlineWidth, borderColor: "#2C2C2E",
  },
  showPillDot: { width: 7, height: 7, borderRadius: 4 },
  showPillText: { color: "#AEAEB2", fontSize: 12, fontWeight: "500" },
  showsGrid: { paddingHorizontal: 16, gap: 12 },
  showCard: { width: 130, gap: 6 },
  showArt: {
    width: 130, height: 130, borderRadius: 16,
    alignItems: "center", justifyContent: "center", marginBottom: 2,
  },
  showName: { color: "#FFF", fontSize: 12, fontWeight: "700", lineHeight: 16 },
  showHost: { color: "#8E8E93", fontSize: 11 },
  showEps: { fontSize: 11, fontWeight: "600" },
  epCard: {
    backgroundColor: "#111", borderRadius: 14, padding: 16,
    marginHorizontal: 16, marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth, borderColor: "#1C1C1E",
  },
  epTop: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  epShowDot: { width: 8, height: 8, borderRadius: 4 },
  epShow: { fontSize: 11, fontWeight: "700", flex: 1 },
  epDate: { color: "#636366", fontSize: 11 },
  epTitle: { color: "#FFF", fontSize: 14, fontWeight: "700", lineHeight: 20, marginBottom: 6 },
  epDesc: { color: "#8E8E93", fontSize: 12, lineHeight: 18, marginBottom: 10 },
  progressWrap: { marginBottom: 8 },
  progressBar: { height: 3, borderRadius: 2, marginBottom: 4 },
  progressLabel: { color: "#636366", fontSize: 10 },
  playedBadge: { color: "#6B7B5A", fontSize: 11, fontWeight: "600", marginBottom: 8 },
  epActions: { flexDirection: "row", alignItems: "center", gap: 4 },
  playBtn: {},
  epDuration: { color: "#8E8E93", fontSize: 12, marginLeft: 6 },
  epActionBtn: { padding: 8 },
  miniPlayer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "#111", borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#2C2C2E",
    flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingTop: 14, gap: 10,
  },
  miniPlayerArt: { width: 42, height: 42, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  miniPlayerInfo: { flex: 1 },
  miniPlayerTitle: { color: "#FFF", fontSize: 13, fontWeight: "600" },
  miniPlayerShow: { color: "#8E8E93", fontSize: 11, marginTop: 2 },
  miniPlayBtn: { padding: 6 },
  miniCloseBtn: { padding: 6 },
  miniProgressTrack: { position: "absolute", top: 0, left: 0, right: 0, height: 2, backgroundColor: "#2C2C2E" },
  miniProgressFill: { height: 2 },
  fullPlayer: {
    flex: 1, backgroundColor: "#111",
    paddingHorizontal: 24, gap: 24,
  },
  fpHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  fpHeaderCenter: { alignItems: "center" },
  fpNowPlaying: { color: "#636366", fontSize: 10, fontWeight: "700", letterSpacing: 1 },
  fpShow: { color: "#FFF", fontSize: 13, fontWeight: "600", marginTop: 2 },
  fpArt: {
    alignSelf: "center", width: SW - 80, height: SW - 80,
    borderRadius: 20, alignItems: "center", justifyContent: "center",
  },
  fpMeta: { flexDirection: "row", alignItems: "center", gap: 12 },
  fpTitle: { color: "#FFF", fontSize: 16, fontWeight: "700", lineHeight: 22 },
  fpHost: { color: "#8E8E93", fontSize: 13, marginTop: 4 },
  fpSliderWrap: { gap: 8 },
  fpTrack: { height: 4, backgroundColor: "#2C2C2E", borderRadius: 2, position: "relative" },
  fpFill: { height: 4, borderRadius: 2, position: "absolute", top: 0, left: 0 },
  fpThumb: { width: 14, height: 14, borderRadius: 7, position: "absolute", top: -5 },
  fpTimes: { flexDirection: "row", justifyContent: "space-between" },
  fpTimeText: { color: "#636366", fontSize: 12 },
  fpControls: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  fpPlayBtn: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: "center", justifyContent: "center",
  },
  fpExtras: { flexDirection: "row", justifyContent: "space-around" },
  fpExtraBtn: { alignItems: "center", gap: 6 },
  fpExtraLabel: { color: "#636366", fontSize: 11 },
});
