import React, { useState } from "react";
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

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 120 : insets.bottom + 16;

  const [name, setName] = useState("Maria Santos");
  const [pronouns, setPronouns] = useState("she/her");
  const [bio, setBio] = useState("SDA member since 2019 · Daily Word devotee 🙏");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("maria.santos@sda.org");
  const [phone, setPhone] = useState("");
  const [privateAccount, setPrivateAccount] = useState(false);

  function handleDone() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit profile</Text>
        <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
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
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>MS</Text>
              <View style={styles.cameraOverlay}>
                <Feather name="camera" size={13} color="#FFFFFF" />
              </View>
            </View>
            <TouchableOpacity onPress={() => Alert.alert("Edit Photo", "Photo upload coming soon.", [{ text: "OK" }])}>
              <Text style={styles.editPhotoText}>Edit photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <FieldRow
              label="Name"
              value={name}
              onChangeText={setName}
              placeholder="Your name"
            />
            <FieldRow
              label="Pronouns"
              value={pronouns}
              onChangeText={setPronouns}
              placeholder="Add pronouns"
              isLast
            />
          </View>

          <View style={styles.section}>
            <FieldRow
              label="Bio"
              value={bio}
              onChangeText={setBio}
              placeholder="Write a bio..."
              multiline
            />
            <FieldRow
              label="Website"
              value={website}
              onChangeText={setWebsite}
              placeholder="Add a link"
              isLast
            />
          </View>

          <Text style={styles.sectionHeader}>Contact info</Text>
          <View style={styles.section}>
            <FieldRow
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              keyboardType="email-address"
            />
            <FieldRow
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone number"
              keyboardType="phone-pad"
              isLast
            />
          </View>

          <Text style={styles.sectionHeader}>Privacy</Text>
          <View style={styles.section}>
            <View style={[styles.fieldRow, styles.fieldRowLast]}>
              <View style={styles.fieldLeft}>
                <Text style={styles.fieldLabel}>Private account</Text>
                <Text style={styles.fieldSubtitle}>Only approved followers see your posts</Text>
              </View>
              <Switch
                value={privateAccount}
                onValueChange={(v) => { Haptics.selectionAsync(); setPrivateAccount(v); }}
                trackColor={{ false: "#3A3A3C", true: "#4A6741" }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          <Text style={styles.sectionHeader}>Personal information</Text>
          <View style={styles.section}>
            <TouchableOpacity style={[styles.fieldRow, styles.fieldRowLast]} activeOpacity={0.7} onPress={() => Alert.alert("Personal Information", "Birthday and gender settings coming soon.", [{ text: "OK" }])}>
              <View style={styles.fieldLeft}>
                <Text style={styles.fieldLabel}>Personal information</Text>
                <Text style={styles.fieldSubtitle}>Manage your birthday and gender</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#636366" />
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
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  isLast?: boolean;
  multiline?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad";
}) {
  return (
    <View style={[styles.fieldRow, isLast && styles.fieldRowLast]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, multiline && { minHeight: 50 }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#636366"
        multiline={multiline}
        keyboardType={keyboardType ?? "default"}
        textAlignVertical={multiline ? "top" : "center"}
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
