import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "@clerk/clerk-expo";
import { useAdmin } from "@/hooks/useAdmin";
import {
  fetchAllConfig,
  updateConfigValue,
  type AppConfigRow,
} from "@/lib/app-config";

function renderValueForEdit(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  return JSON.stringify(value);
}

function parseValueForSave(raw: string, previous: unknown): unknown {
  const trimmed = raw.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "null") return null;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  try {
    return JSON.parse(trimmed);
  } catch {
    if (typeof previous === "string" || previous === null || previous === undefined) {
      return raw;
    }
    return raw;
  }
}

export default function AdminConfigScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { user } = useUser();

  const [rows, setRows] = useState<AppConfigRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await fetchAllConfig();
      setRows(list);
      setDrafts(
        list.reduce<Record<string, string>>((acc, row) => {
          acc[row.key] = renderValueForEdit(row.value);
          return acc;
        }, {}),
      );
    } catch (err: any) {
      setError(err?.message ?? "Could not load configuration.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (adminLoading) return;
    if (!isAdmin) {
      Alert.alert("Access Denied", "You do not have admin privileges.");
      router.back();
      return;
    }
    load();
  }, [adminLoading, isAdmin, load]);

  const grouped = useMemo(() => {
    const map = new Map<string, AppConfigRow[]>();
    for (const row of rows) {
      const list = map.get(row.category) ?? [];
      list.push(row);
      map.set(row.category, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [rows]);

  async function save(row: AppConfigRow) {
    const raw = drafts[row.key] ?? "";
    const parsed = parseValueForSave(raw, row.value);
    try {
      setSaving(row.key);
      await updateConfigValue({ key: row.key, value: parsed, updatedBy: user?.id });
      await load();
    } catch (err: any) {
      Alert.alert("Save failed", err?.message ?? "Could not update value.");
    } finally {
      setSaving(null);
    }
  }

  if (adminLoading || loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#4B7BEC" />
      </View>
    );
  }

  if (!isAdmin) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Config</Text>
        <TouchableOpacity onPress={load} style={styles.backBtn}>
          <Ionicons name="refresh-outline" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 60 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.warningCard}>
            <Feather name="alert-triangle" size={16} color="#D4AF37" />
            <Text style={styles.warningText}>
              Only safe-to-publish values belong here (publishable keys, feature flags, URLs).
              {"\n"}Server secrets must live in Worker secrets — never in this table.
            </Text>
          </View>

          {error && (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {grouped.length === 0 && !error && (
            <Text style={styles.empty}>
              No config rows yet. Run the schema in your Supabase SQL Editor — the seed
              INSERT will create a few starter rows.
            </Text>
          )}

          {grouped.map(([category, list]) => (
            <View key={category} style={{ marginTop: 20 }}>
              <Text style={styles.sectionLabel}>{category.toUpperCase()}</Text>
              <View style={styles.card}>
                {list.map((row, idx) => {
                  const isDirty = drafts[row.key] !== renderValueForEdit(row.value);
                  const isSaving = saving === row.key;
                  return (
                    <View key={row.key}>
                      <View style={styles.rowBlock}>
                        <Text style={styles.rowKey}>{row.key}</Text>
                        {row.description && (
                          <Text style={styles.rowDesc}>{row.description}</Text>
                        )}
                        <TextInput
                          value={drafts[row.key] ?? ""}
                          onChangeText={(text) =>
                            setDrafts((prev) => ({ ...prev, [row.key]: text }))
                          }
                          style={styles.input}
                          placeholder='string, number, true/false, or JSON like {"a":1}'
                          placeholderTextColor="#48484A"
                          autoCapitalize="none"
                          autoCorrect={false}
                          multiline
                        />
                        <View style={styles.actionRow}>
                          <Text style={styles.updatedText}>
                            Updated {new Date(row.updatedAt).toLocaleString()}
                          </Text>
                          <TouchableOpacity
                            disabled={!isDirty || isSaving}
                            style={[styles.saveBtn, (!isDirty || isSaving) && styles.saveBtnDisabled]}
                            onPress={() => save(row)}
                          >
                            <Text style={styles.saveBtnText}>
                              {isSaving ? "Saving…" : "Save"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      {idx < list.length - 1 && <View style={styles.divider} />}
                    </View>
                  );
                })}
              </View>
            </View>
          ))}

          <Text style={styles.sectionLabel}>SERVER SECRETS</Text>
          <View style={styles.card}>
            <View style={styles.rowBlock}>
              <Text style={styles.rowKey}>LiveKit API key / secret</Text>
              <Text style={styles.rowDesc}>
                Live on Cloudflare Worker, not in the app. Rotate via:
              </Text>
              <View style={styles.codeBox}>
                <Text style={styles.codeText}>
                  wrangler secret put LIVEKIT_API_KEY{"\n"}
                  wrangler secret put LIVEKIT_API_SECRET
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.rowBlock}>
              <Text style={styles.rowKey}>Stripe secret key / webhook secret</Text>
              <Text style={styles.rowDesc}>
                Lives on api-server / Worker — never in the mobile app. Rotate via your hosting provider's env settings.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  center: { justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  content: { paddingHorizontal: 16, paddingTop: 8 },
  warningCard: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#1C1A0E",
    borderColor: "#D4AF37",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  warningText: { flex: 1, color: "#E5C97A", fontSize: 12, lineHeight: 17 },
  errorCard: {
    backgroundColor: "#3F1D1D",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  errorText: { color: "#FCA5A5", fontSize: 13 },
  empty: {
    color: "#8E8E93",
    fontSize: 13,
    textAlign: "center",
    marginTop: 40,
    paddingHorizontal: 24,
    lineHeight: 19,
  },
  sectionLabel: {
    color: "#636366",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginTop: 16,
    marginBottom: 6,
    marginLeft: 4,
  },
  card: { backgroundColor: "#111", borderRadius: 14, overflow: "hidden" },
  rowBlock: { paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  rowKey: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  rowDesc: { color: "#8E8E93", fontSize: 12, lineHeight: 17 },
  input: {
    backgroundColor: "#0A0A0A",
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2C2C2E",
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#FFFFFF",
    fontSize: 13,
    minHeight: 44,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  updatedText: { color: "#48484A", fontSize: 11 },
  saveBtn: {
    backgroundColor: "#0E7B5B",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  codeBox: {
    backgroundColor: "#0A0A0A",
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2C2C2E",
    padding: 10,
  },
  codeText: { color: "#E5E5EA", fontSize: 12, fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#2C2C2E", marginLeft: 16 },
});
