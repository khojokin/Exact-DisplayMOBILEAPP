import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  StatusBar,
  Switch,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSubscription } from "@/hooks/useSubscription";

const NAME_LOCK_KEY = "profile.name.lock.until";
const USERNAME_LOCK_KEY = "profile.username.lock.until";
const INITIAL_NAME = "Maria Santos";
const INITIAL_USERNAME = "mariasantos";

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 120 : insets.bottom + 16;
  const { isPremium } = useSubscription();
  const theme = isPremium
    ? {
        background: "#F6FBF4",
        text: "#153221",
        subtext: "#567263",
        card: "#FFFFFF",
        border: "#DCE9D8",
        accent: "#2E7D4E",
      }
    : {
        background: "#0A0A0A",
        text: "#FFFFFF",
        subtext: "#8E8E93",
        card: "#111111",
        border: "#2C2C2E",
        accent: "#4A6741",
      };

  const [name, setName] = useState(INITIAL_NAME);
  const [username, setUsername] = useState(INITIAL_USERNAME);
  const [pronouns, setPronouns] = useState("she/her");
  const [bio, setBio] = useState("SDA member since 2019 · Daily Word devotee 🙏");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("maria.santos@sda.org");
  const [phone, setPhone] = useState("");
  const [privateAccount, setPrivateAccount] = useState(false);
  const [nameLockedUntil, setNameLockedUntil] = useState<number | null>(null);
  const [usernameLockedUntil, setUsernameLockedUntil] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const [storedNameLock, storedUsernameLock] = await Promise.all([
        AsyncStorage.getItem(NAME_LOCK_KEY),
        AsyncStorage.getItem(USERNAME_LOCK_KEY),
      ]);
      if (storedNameLock) setNameLockedUntil(Number(storedNameLock));
      if (storedUsernameLock) setUsernameLockedUntil(Number(storedUsernameLock));
    })();
  }, []);

  const now = Date.now();
  const canEditName = !nameLockedUntil || now >= nameLockedUntil;
  const canEditUsername = !usernameLockedUntil || now >= usernameLockedUntil;

  function daysRemaining(lockUntil: number | null) {
    if (!lockUntil) return 0;
    const diff = lockUntil - Date.now();
    if (diff <= 0) return 0;
    return Math.ceil(diff / (24 * 60 * 60 * 1000));
  }

  function handleNameChange(value: string) {
    if (!canEditName) {
      Alert.alert("Name locked", `You can change your name again in ${daysRemaining(nameLockedUntil)} day(s).`);
      return;
    }
    setName(value);
  }

  function handleUsernameChange(value: string) {
    if (!canEditUsername) {
      Alert.alert("Username locked", `You can change your username again in ${daysRemaining(usernameLockedUntil)} day(s).`);
      return;
    }
    setUsername(value.replace(/\s+/g, "").toLowerCase());
  }

  async function handleDone() {
    const updates: Promise<void>[] = [];
    const updatedNow = Date.now();
    if (name.trim() !== INITIAL_NAME && canEditName) {
      updates.push(AsyncStorage.setItem(NAME_LOCK_KEY, String(updatedNow + 7 * 24 * 60 * 60 * 1000)));
    }
    if (username.trim() !== INITIAL_USERNAME && canEditUsername) {
      updates.push(AsyncStorage.setItem(USERNAME_LOCK_KEY, String(updatedNow + 30 * 24 * 60 * 60 * 1000)));
    }
    if (updates.length) await Promise.all(updates);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <StatusBar barStyle={isPremium ? "dark-content" : "light-content"} backgroundColor={theme.background} />
      <View style={[styles.header, { paddingTop: topPad, borderBottomColor: theme.border }]}> 
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.cancelText, { color: theme.subtext }]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Edit profile</Text>
        <TouchableOpacity style={[styles.doneBtn, { backgroundColor: theme.accent }]} onPress={handleDone}>
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: bottomPad }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.avatarSection, { borderBottomColor: theme.border }]}> 
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>MS</Text>
              <View style={styles.cameraOverlay}>
                <Feather name="camera" size={13} color="#FFFFFF" />
              </View>
            </View>
            <TouchableOpacity onPress={() => Alert.alert("Edit Photo", "Photo upload coming soon.", [{ text: "OK" }])}>
              <Text style={[styles.editPhotoText, { color: theme.accent }]}>Edit photo</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.section, { backgroundColor: theme.card }]}> 
            <FieldRow
              label="Name"
              value={name}
              onChangeText={handleNameChange}
              placeholder="Your name"
              editable={canEditName}
              tint={{ text: theme.text, subtext: theme.subtext, border: theme.border }}
            />
            <FieldRow
              label="Username"
              value={username}
              onChangeText={handleUsernameChange}
              placeholder="Username"
              editable={canEditUsername}
              tint={{ text: theme.text, subtext: theme.subtext, border: theme.border }}
            />
            <FieldRow
              label="Pronouns"
              value={pronouns}
              onChangeText={setPronouns}
              placeholder="Add pronouns"
              tint={{ text: theme.text, subtext: theme.subtext, border: theme.border }}
              isLast
            />
          </View>
          <Text style={[styles.limitHint, { color: theme.subtext }]}> 
            {canEditName
              ? "Name can be changed once every 7 days."
              : `Name can be changed again in ${daysRemaining(nameLockedUntil)} day(s).`}
          </Text>
          <Text style={[styles.limitHint, { color: theme.subtext }]}> 
            {canEditUsername
              ? "Username can be changed once every 30 days."
              : `Username can be changed again in ${daysRemaining(usernameLockedUntil)} day(s).`}
          </Text>

          <View style={styles.section}>
            <FieldRow
              label="Bio"
              value={bio}
              onChangeText={setBio}
              placeholder="Write a bio..."
              multiline
              tint={{ text: theme.text, subtext: theme.subtext, border: theme.border }}
            />
            <FieldRow
              label="Website"
              value={website}
              onChangeText={setWebsite}
              placeholder="Add a link"
              tint={{ text: theme.text, subtext: theme.subtext, border: theme.border }}
              isLast
            />
          </View>

          <Text style={[styles.sectionHeader, { color: theme.subtext }]}>Contact info</Text>
          <View style={[styles.section, { backgroundColor: theme.card }]}> 
            <FieldRow
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              keyboardType="email-address"
              tint={{ text: theme.text, subtext: theme.subtext, border: theme.border }}
            />
            <FieldRow
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone number"
              keyboardType="phone-pad"
              tint={{ text: theme.text, subtext: theme.subtext, border: theme.border }}
              isLast
            />
          </View>

          <Text style={[styles.sectionHeader, { color: theme.subtext }]}>Privacy</Text>
          <View style={[styles.section, { backgroundColor: theme.card }]}> 
            <View style={[styles.fieldRow, styles.fieldRowLast]}>
              <View style={styles.fieldLeft}>
                <Text style={[styles.fieldLabel, { color: theme.subtext }]}>Private account</Text>
                <Text style={[styles.fieldSubtitle, { color: theme.subtext }]}>Only approved followers see your posts</Text>
              </View>
              <Switch
                value={privateAccount}
                onValueChange={(v) => { Haptics.selectionAsync(); setPrivateAccount(v); }}
                trackColor={{ false: "#3A3A3C", true: theme.accent }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          <Text style={[styles.sectionHeader, { color: theme.subtext }]}>Personal information</Text>
          <View style={[styles.section, { backgroundColor: theme.card }]}> 
            <TouchableOpacity style={[styles.fieldRow, styles.fieldRowLast]} activeOpacity={0.7} onPress={() => Alert.alert("Personal Information", "Birthday and gender settings coming soon.", [{ text: "OK" }])}>
              <View style={styles.fieldLeft}>
                <Text style={[styles.fieldLabel, { color: theme.subtext }]}>Personal information</Text>
                <Text style={[styles.fieldSubtitle, { color: theme.subtext }]}>Manage your birthday and gender</Text>
              </View>
              <Feather name="chevron-right" size={18} color={theme.subtext} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function FieldRow({
  label,
  value,
  onChangeText,
  placeholder,
  isLast,
  multiline,
  keyboardType,
  editable,
  tint,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  isLast?: boolean;
  multiline?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad";
  editable?: boolean;
  tint?: { text: string; subtext: string; border: string };
}) {
  return (
    <View style={[styles.fieldRow, isLast && styles.fieldRowLast, tint && { borderBottomColor: tint.border }]}> 
      <Text style={[styles.fieldLabel, tint && { color: tint.subtext }]}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, multiline && { minHeight: 50 }, tint && { color: tint.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={tint?.subtext ?? "#636366"}
        multiline={multiline}
        keyboardType={keyboardType ?? "default"}
        textAlignVertical={multiline ? "top" : "center"}
        selectionColor={tint?.text}
        editable={editable}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2C2C2E",
  },
  cancelText: { color: "#8E8E93", fontSize: 16 },
  headerTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  doneBtn: {
    backgroundColor: "#4A6741",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  doneBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2C2C2E",
    marginBottom: 8,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#8B3A8B",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  avatarText: { color: "#FFF", fontSize: 32, fontWeight: "700" },
  cameraOverlay: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#4A4A4C",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#0A0A0A",
  },
  editPhotoText: { color: "#6B7B5A", fontSize: 14, fontWeight: "600" },
  sectionHeader: {
    color: "#8E8E93",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.4,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 6,
    textTransform: "uppercase",
  },
  section: {
    backgroundColor: "#111111",
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: "hidden",
  },
  limitHint: {
    color: "#8E8E93",
    fontSize: 12,
    marginTop: 8,
    marginHorizontal: 20,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2C2C2E",
    gap: 12,
    minHeight: 50,
  },
  fieldRowLast: {
    borderBottomWidth: 0,
  },
  fieldLeft: { flex: 1 },
  fieldLabel: {
    color: "#8E8E93",
    fontSize: 14,
    width: 90,
    flexShrink: 0,
  },
  fieldSubtitle: {
    color: "#636366",
    fontSize: 12,
    marginTop: 2,
  },
  fieldInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "right",
  },
});
