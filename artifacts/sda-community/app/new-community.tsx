import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@clerk/clerk-expo";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/hooks/useTheme";

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function NewCommunityScreen() {
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();
  const { t } = useTheme();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const canSubmit = useMemo(() => name.trim().length >= 3 && !saving, [name, saving]);

  async function handleCreate() {
    if (!canSubmit) return;
    if (!userId) {
      Alert.alert("Sign in required", "Please sign in to create a community.");
      return;
    }

    setSaving(true);
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    const basePayload: Record<string, any> = {
      name: trimmedName,
      description: trimmedDescription || null,
      member_count: 1,
    };

    const withSlugPayload = {
      ...basePayload,
      slug: slugify(trimmedName),
    };

    try {
      // Try with slug first for schemas that require it, fallback when slug doesn't exist.
      let insertError: any = null;
      const firstTry = await supabase.from("communities").insert(withSlugPayload).select("id").single();
      if (firstTry.error && /column .*slug|slug/i.test(firstTry.error.message ?? "")) {
        const secondTry = await supabase.from("communities").insert(basePayload).select("id").single();
        insertError = secondTry.error;
      } else {
        insertError = firstTry.error;
      }

      if (insertError) throw insertError;

      router.back();
    } catch (error: any) {
      Alert.alert("Create failed", error?.message ?? "Unable to create this community right now.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}> 
      <StatusBar barStyle={t.statusBar} backgroundColor={t.bg} />

      <View style={[styles.header, { paddingTop: topPad, borderBottomColor: t.border }]}> 
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color={t.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: t.text }]}>Create Community</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.formWrap}>
        <Text style={[styles.label, { color: t.text }]}>Name</Text>
        <TextInput
          style={[styles.input, { color: t.text, borderColor: t.border, backgroundColor: t.card }]}
          placeholder="Community name"
          placeholderTextColor={t.mutedText}
          value={name}
          onChangeText={setName}
          maxLength={80}
        />

        <Text style={[styles.label, { color: t.text, marginTop: 14 }]}>Description</Text>
        <TextInput
          style={[styles.input, styles.multiline, { color: t.text, borderColor: t.border, backgroundColor: t.card }]}
          placeholder="What is this community about?"
          placeholderTextColor={t.mutedText}
          value={description}
          onChangeText={setDescription}
          maxLength={280}
          multiline
            textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.createBtn, { opacity: canSubmit ? 1 : 0.55 }]}
          onPress={handleCreate}
          disabled={!canSubmit}
        >
          <Text style={styles.createBtnText}>{saving ? "Creating..." : "Create Community"}</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 10,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  formWrap: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  multiline: {
    minHeight: 120,
  },
  createBtn: {
    marginTop: 18,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#3B5BDB",
    alignItems: "center",
    justifyContent: "center",
  },
  createBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
