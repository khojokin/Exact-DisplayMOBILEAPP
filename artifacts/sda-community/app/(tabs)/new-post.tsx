import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useNotifications } from "@/hooks/useNotifications";

const POST_TYPES = [
  { id: "update", label: "Update", icon: "refresh-cw" as const },
  { id: "prayer", label: "Prayer Request", icon: "heart" as const },
  { id: "photo", label: "Photo", icon: "image" as const },
  { id: "video", label: "Video", icon: "video" as const },
  { id: "audio", label: "Audio", icon: "mic" as const },
];

const TAGGABLE = [
  { id: "1", name: "Pastor James Osei", verified: true },
  { id: "2", name: "Elder Ruth Nakamura", verified: true },
  { id: "3", name: "David Mensah", verified: false },
  { id: "4", name: "Grace Adetokunbo", verified: false },
  { id: "5", name: "Samuel Boateng", verified: false },
  { id: "6", name: "Abigail Owusu", verified: false },
  { id: "7", name: "Emmanuel Darko", verified: false },
];

const POPULAR_HASHTAGS = ["#SDAcommunity", "#Sabbath", "#Prayer", "#Faith", "#Devotional", "#SDAhymns", "#SabbathSchool", "#Praise", "#Testimony", "#BibleStudy"];

const LOCATIONS = [
  "Main Sanctuary, Accra", "Fellowship Hall", "Youth Centre", "Education Block",
  "Online — Zoom", "Camp Calvary", "Community Centre, Accra", "Worship Room",
  "Music Room", "Conference Room", "Prayer Garden", "Sabbath School Room",
  "Children's Ministry Hall", "Church Library", "Baptistry", "Church Foyer",
  "Outdoor Grounds", "Health Centre", "Bible Study Room", "Memorial Hall",
];

function renderPostText(text: string) {
  const parts = text.split(/(@\w[\w\s]*|#\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("@")) return <Text key={i} style={{ color: "#3B5BDB" }}>{part}</Text>;
    if (part.startsWith("#")) return <Text key={i} style={{ color: "#6B7B5A" }}>{part}</Text>;
    return <Text key={i} style={{ color: "#FFF" }}>{part}</Text>;
  });
}

export default function NewPostScreen() {
  const insets = useSafeAreaInsets();
  const [selectedType, setSelectedType] = useState("update");
  const [postText, setPostText] = useState("");
  const [visible, setVisible] = useState(true);
  const [location, setLocation] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [locationFocused, setLocationFocused] = useState(false);
  const [showTagSuggest, setShowTagSuggest] = useState(false);
  const [tagQuery, setTagQuery] = useState("");
  const [showHashtagSuggest, setShowHashtagSuggest] = useState(false);
  const [hashtagQuery, setHashtagQuery] = useState("");
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { addNotification } = useNotifications();
  const inputRef = useRef<TextInput>(null);

  const placeholder =
    selectedType === "prayer" ? "Share your prayer request with SDA..."
    : selectedType === "photo" ? "Add a caption..."
    : selectedType === "video" ? "Describe your video..."
    : selectedType === "audio" ? "Describe your audio message..."
    : "Share an update with SDA... Use @ to tag people, # for hashtags";

  function handleTextChange(text: string) {
    setPostText(text);
    const words = text.split(/\s/);
    const lastWord = words[words.length - 1];
    if (lastWord.startsWith("@") && lastWord.length > 1) {
      setTagQuery(lastWord.slice(1).toLowerCase());
      setShowTagSuggest(true);
      setShowHashtagSuggest(false);
    } else if (lastWord.startsWith("#") && lastWord.length > 1) {
      setHashtagQuery(lastWord.slice(1).toLowerCase());
      setShowHashtagSuggest(true);
      setShowTagSuggest(false);
    } else {
      setShowTagSuggest(false);
      setShowHashtagSuggest(false);
    }
  }

  function insertTag(name: string) {
    const words = postText.split(/\s/);
    words[words.length - 1] = `@${name.replace(/\s+/g, "")} `;
    setPostText(words.join(" "));
    setShowTagSuggest(false);
    inputRef.current?.focus();
  }

  function insertHashtag(tag: string) {
    const words = postText.split(/\s/);
    words[words.length - 1] = `${tag} `;
    setPostText(words.join(" "));
    setShowHashtagSuggest(false);
    inputRef.current?.focus();
  }

  function handlePost() {
    if (!postText.trim()) {
      Alert.alert("Empty Post", "Please write something before posting.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addNotification({
      title: "Post published!",
      body: postText.trim().slice(0, 80) + (postText.length > 80 ? "..." : ""),
      type: selectedType === "prayer" ? "prayer" : "announcement",
    });
    setPostText("");
    setSelectedType("update");
    setLocation("");
    router.back();
  }

  function handleMediaPick(type: "photo" | "video" | "audio") {
    setSelectedType(type);
    Haptics.selectionAsync();
    Alert.alert(
      type === "photo" ? "Add Photo" : type === "video" ? "Add Video" : "Add Audio",
      "Choose a source",
      [
        { text: type === "audio" ? "Record Audio" : "Take " + (type === "photo" ? "Photo" : "Video"), onPress: () => {} },
        { text: "Choose from Library", onPress: () => {} },
        { text: "Cancel", style: "cancel" },
      ]
    );
  }

  const filteredTags = TAGGABLE.filter((t) => t.name.toLowerCase().includes(tagQuery));
  const filteredHashtags = POPULAR_HASHTAGS.filter((h) => h.toLowerCase().includes(hashtagQuery.toLowerCase()));
  const filteredLocations = locationQuery.length > 0
    ? LOCATIONS.filter((l) => l.toLowerCase().includes(locationQuery.toLowerCase()))
    : LOCATIONS.slice(0, 5);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Post</Text>
        <TouchableOpacity
          style={[styles.postButton, !postText.trim() && styles.postButtonDisabled]}
          onPress={handlePost}
        >
          <Text style={[styles.postButtonText, !postText.trim() && styles.postButtonTextDisabled]}>Post</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Post type */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>POST TYPE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typePills}>
            {POST_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[styles.typePill, selectedType === type.id && styles.typePillActive]}
                onPress={() => { Haptics.selectionAsync(); setSelectedType(type.id); }}
              >
                <Feather name={type.icon} size={14} color={selectedType === type.id ? "#FFFFFF" : "#8E8E93"} />
                <Text style={[styles.typePillText, selectedType === type.id && styles.typePillTextActive]}>{type.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Text area with highlighted tags/hashtags */}
        <View style={styles.textAreaContainer}>
          <TextInput
            ref={inputRef}
            style={styles.textArea}
            placeholder={placeholder}
            placeholderTextColor="#636366"
            multiline
            value={postText}
            onChangeText={handleTextChange}
            autoFocus
            textAlignVertical="top"
          />
        </View>

        {/* Tag suggestions */}
        {showTagSuggest && filteredTags.length > 0 && (
          <View style={styles.suggestBox}>
            <Text style={styles.suggestLabel}>TAG A PERSON</Text>
            {filteredTags.map((t) => (
              <TouchableOpacity key={t.id} style={styles.suggestRow} onPress={() => insertTag(t.name)}>
                <View style={[styles.suggestAvatar, { backgroundColor: "#3B5BDB" }]}>
                  <Text style={styles.suggestAvatarText}>{t.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</Text>
                </View>
                <Text style={styles.suggestName}>{t.name}</Text>
                {t.verified && <Ionicons name="checkmark-circle" size={14} color="#3B5BDB" />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Hashtag suggestions */}
        {showHashtagSuggest && filteredHashtags.length > 0 && (
          <View style={styles.suggestBox}>
            <Text style={styles.suggestLabel}>HASHTAGS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, padding: 4 }}>
              {filteredHashtags.map((tag) => (
                <TouchableOpacity key={tag} style={styles.hashtagChip} onPress={() => insertHashtag(tag)}>
                  <Text style={styles.hashtagChipText}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Quick insert buttons */}
        <View style={styles.insertRow}>
          <TouchableOpacity style={styles.insertBtn} onPress={() => { setPostText((t) => t + "@"); handleTextChange(postText + "@"); }}>
            <Text style={styles.insertBtnText}>@ Mention</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.insertBtn} onPress={() => { setPostText((t) => t + "#"); handleTextChange(postText + "#"); }}>
            <Text style={styles.insertBtnText}># Hashtag</Text>
          </TouchableOpacity>
        </View>

        {/* Location — inline live search */}
        <View style={styles.locationSection}>
          <View style={[styles.locationRow, locationFocused && styles.locationRowFocused]}>
            <Ionicons name="location-outline" size={18} color={location ? "#6B7B5A" : locationFocused ? "#6B7B5A" : "#636366"} />
            <TextInput
              style={[styles.locationInput, location ? { color: "#6B7B5A" } : {}]}
              placeholder="Add location..."
              placeholderTextColor="#636366"
              value={locationQuery}
              onChangeText={(t) => { setLocationQuery(t); setLocation(""); }}
              onFocus={() => setLocationFocused(true)}
              onBlur={() => setTimeout(() => setLocationFocused(false), 180)}
              returnKeyType="done"
            />
            {locationQuery.length > 0 && (
              <TouchableOpacity onPress={() => { setLocationQuery(""); setLocation(""); }}>
                <Ionicons name="close-circle" size={16} color="#636366" />
              </TouchableOpacity>
            )}
          </View>
          {locationFocused && filteredLocations.length > 0 && (
            <View style={styles.locationSuggestions}>
              <Text style={styles.locationSugLabel}>
                {locationQuery.length > 0 ? "MATCHING LOCATIONS" : "SUGGESTED LOCATIONS"}
              </Text>
              {filteredLocations.map((loc) => (
                <TouchableOpacity
                  key={loc}
                  style={[styles.locationSugRow, location === loc && styles.locationSugRowActive]}
                  onPress={() => { setLocation(loc); setLocationQuery(loc); setLocationFocused(false); }}
                >
                  <Ionicons name="location-sharp" size={14} color={location === loc ? "#6B7B5A" : "#636366"} />
                  <Text style={[styles.locationSugText, location === loc && { color: "#6B7B5A" }]}>{loc}</Text>
                  {location === loc && <Ionicons name="checkmark-circle" size={15} color="#6B7B5A" style={{ marginLeft: "auto" }} />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {selectedType === "photo" && (
          <TouchableOpacity style={styles.mediaPlaceholder} activeOpacity={0.7} onPress={() => handleMediaPick("photo")}>
            <Ionicons name="image-outline" size={40} color="#3C3C3E" />
            <Text style={styles.mediaPlaceholderText}>Tap to add photo</Text>
          </TouchableOpacity>
        )}
        {selectedType === "video" && (
          <TouchableOpacity style={styles.mediaPlaceholder} activeOpacity={0.7} onPress={() => handleMediaPick("video")}>
            <Ionicons name="videocam-outline" size={40} color="#3C3C3E" />
            <Text style={styles.mediaPlaceholderText}>Tap to add video</Text>
          </TouchableOpacity>
        )}
        {selectedType === "audio" && (
          <TouchableOpacity style={styles.mediaPlaceholder} activeOpacity={0.7} onPress={() => handleMediaPick("audio")}>
            <Ionicons name="mic-outline" size={40} color="#3C3C3E" />
            <Text style={styles.mediaPlaceholderText}>Tap to record audio</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 8 }]}>
        <View style={styles.mediaActions}>
          <TouchableOpacity style={styles.mediaActionBtn} onPress={() => handleMediaPick("photo")}>
            <Ionicons name="image-outline" size={22} color={selectedType === "photo" ? "#6B7B5A" : "#8E8E93"} />
            <Text style={[styles.mediaActionText, selectedType === "photo" && { color: "#6B7B5A" }]}>Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mediaActionBtn} onPress={() => handleMediaPick("video")}>
            <Ionicons name="videocam-outline" size={22} color={selectedType === "video" ? "#6B7B5A" : "#8E8E93"} />
            <Text style={[styles.mediaActionText, selectedType === "video" && { color: "#6B7B5A" }]}>Video</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mediaActionBtn} onPress={() => handleMediaPick("audio")}>
            <Ionicons name="mic-outline" size={22} color={selectedType === "audio" ? "#6B7B5A" : "#8E8E93"} />
            <Text style={[styles.mediaActionText, selectedType === "audio" && { color: "#6B7B5A" }]}>Audio</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.visibilityRow} onPress={() => { Haptics.selectionAsync(); setVisible((v) => !v); }}>
          <Ionicons name={visible ? "eye-outline" : "eye-off-outline"} size={18} color={visible ? "#6B7B5A" : "#8E8E93"} />
          <Text style={[styles.visibilityText, visible && { color: "#6B7B5A" }]}>
            {visible ? "Visible to SDA members" : "Only visible to me"}
          </Text>
        </TouchableOpacity>
      </View>

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
  cancelText: { color: "#8E8E93", fontSize: 16 },
  headerTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  postButton: { backgroundColor: "#6B7B5A", paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 },
  postButtonDisabled: { backgroundColor: "#2C2C2E" },
  postButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  postButtonTextDisabled: { color: "#636366" },
  body: { flex: 1 },
  section: { paddingTop: 16 },
  sectionLabel: { color: "#636366", fontSize: 11, fontWeight: "600", letterSpacing: 0.5, paddingHorizontal: 16, marginBottom: 10 },
  typePills: { paddingHorizontal: 14, gap: 8 },
  typePill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: "#1C1C1E", borderWidth: StyleSheet.hairlineWidth, borderColor: "#2C2C2E",
  },
  typePillActive: { backgroundColor: "#4A6741", borderColor: "#6B7B5A" },
  typePillText: { color: "#8E8E93", fontSize: 13, fontWeight: "500" },
  typePillTextActive: { color: "#FFFFFF", fontWeight: "600" },
  textAreaContainer: { paddingHorizontal: 16, paddingTop: 16 },
  textArea: { color: "#FFFFFF", fontSize: 16, lineHeight: 24, minHeight: 120 },
  suggestBox: { marginHorizontal: 16, backgroundColor: "#1C1C1E", borderRadius: 12, padding: 10, marginTop: 4 },
  suggestLabel: { color: "#636366", fontSize: 10, fontWeight: "600", letterSpacing: 0.5, marginBottom: 8 },
  suggestRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  suggestAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  suggestAvatarText: { color: "#FFF", fontSize: 10, fontWeight: "700" },
  suggestName: { flex: 1, color: "#FFF", fontSize: 14 },
  hashtagChip: { backgroundColor: "#4A674122", borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: "#6B7B5A44" },
  hashtagChipText: { color: "#6B7B5A", fontSize: 13, fontWeight: "600" },
  insertRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginTop: 12 },
  insertBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: "#1C1C1E" },
  insertBtnText: { color: "#8E8E93", fontSize: 13 },
  locationSection: {
    marginHorizontal: 16, marginTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#2C2C2E",
  },
  locationRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingVertical: 10,
  },
  locationRowFocused: {},
  locationInput: { flex: 1, color: "#636366", fontSize: 14, paddingVertical: 0 },
  locationSuggestions: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    marginBottom: 8,
    overflow: "hidden",
  },
  locationSugLabel: {
    color: "#636366", fontSize: 10, fontWeight: "600", letterSpacing: 0.5,
    paddingHorizontal: 12, paddingTop: 10, paddingBottom: 4,
  },
  locationSugRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#2C2C2E",
  },
  locationSugRowActive: { backgroundColor: "#6B7B5A11" },
  locationSugText: { flex: 1, color: "#FFFFFFCC", fontSize: 14 },
  mediaPlaceholder: {
    margin: 16, height: 160, backgroundColor: "#1C1C1E", borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth, borderColor: "#2C2C2E", borderStyle: "dashed", gap: 8,
  },
  mediaPlaceholderText: { color: "#636366", fontSize: 14 },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#2C2C2E",
    paddingHorizontal: 16, paddingTop: 12,
  },
  mediaActions: { flexDirection: "row", gap: 20, marginBottom: 12 },
  mediaActionBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  mediaActionText: { color: "#8E8E93", fontSize: 13 },
  visibilityRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6 },
  visibilityText: { color: "#8E8E93", fontSize: 13 },
});
