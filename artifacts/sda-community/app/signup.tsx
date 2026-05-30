import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  Alert,
  Image,
  Animated,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSignUp } from "@clerk/clerk-expo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";

const { width: SW } = Dimensions.get("window");

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const bgOp    = useRef(new Animated.Value(0)).current;
  const heroY   = useRef(new Animated.Value(-20)).current;
  const heroOp  = useRef(new Animated.Value(0)).current;
  const cardY   = useRef(new Animated.Value(70)).current;
  const cardOp  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(bgOp, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(100),
        Animated.parallel([
          Animated.spring(heroY, { toValue: 0, tension: 65, friction: 10, useNativeDriver: true }),
          Animated.timing(heroOp, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]),
      ]),
      Animated.sequence([
        Animated.delay(300),
        Animated.parallel([
          Animated.spring(cardY, { toValue: 0, tension: 55, friction: 11, useNativeDriver: true }),
          Animated.timing(cardOp, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]),
      ]),
    ]).start();
  }, []);

  const handleSignUp = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Please fill in all required fields.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }
    if (!isLoaded || !signUp) {
      Alert.alert("Not ready", "Please wait a moment and try again.");
      return;
    }

    setLoading(true);
    try {
      const names = fullName.trim().split(/\s+/);
      const firstName = names[0] ?? undefined;
      const lastName = names.length > 1 ? names.slice(1).join(" ") : undefined;

      const result = await signUp.create({
        emailAddress: email.trim(),
        password,
        username: username.trim() || undefined,
        firstName,
        lastName,
      });

      if (result.status === "complete") {
        await supabase.from("profiles").upsert({
          id: result.createdUserId,
          full_name: fullName.trim(),
          username: username.trim() || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: "id" });

        await setActive?.({ session: result.createdSessionId });
        router.replace("/(tabs)");
        return;
      }

      Alert.alert(
        "Almost there!",
        "Check your email to complete verification, then sign in.",
        [{ text: "Sign in", onPress: () => router.replace("/signin") }],
      );
    } catch (error: any) {
      const message =
        error?.errors?.[0]?.longMessage ||
        error?.errors?.[0]?.message ||
        error?.message ||
        "Unable to create your account right now.";
      Alert.alert("Sign up failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Background */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: bgOp }]}>
        <LinearGradient
          colors={["#030C04", "#071A0A", "#0C2410", "#071A0A"]}
          locations={[0, 0.3, 0.65, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />
      </Animated.View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Hero ── */}
          <Animated.View
            style={[
              styles.hero,
              {
                paddingTop: Platform.OS === "web" ? 64 : insets.top + 40,
                opacity: heroOp,
                transform: [{ translateY: heroY }],
              },
            ]}
          >
            <View style={styles.logoRing}>
              <LinearGradient colors={["#1A4016", "#2A6020", "#1A4016"]} style={StyleSheet.absoluteFill} />
              <Image
                source={require("@/assets/images/sda-logo.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.heroTitle}>Join SDA Community</Text>
            <Text style={styles.heroSub}>Seventh-day Adventist · Faith · Fellowship</Text>
          </Animated.View>

          {/* ── Card ── */}
          <Animated.View
            style={[
              styles.card,
              {
                opacity: cardOp,
                transform: [{ translateY: cardY }],
                paddingBottom: (insets.bottom || 16) + 24,
              },
            ]}
          >
            {/* Back */}
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={20} color="#4A6644" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            <Text style={styles.cardTitle}>Create Account</Text>
            <Text style={styles.cardSub}>Start your faith journey today</Text>

            {/* Social */}
            <View style={styles.socialRow}>
              <TouchableOpacity
                style={styles.socialBtn}
                onPress={() =>
                  Alert.alert("Coming soon", "Social sign-up can be enabled from your Clerk dashboard.")
                }
              >
                <Ionicons name="logo-apple" size={19} color="#FFF" />
                <Text style={styles.socialBtnText}>Apple</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialBtn}
                onPress={() =>
                  Alert.alert("Coming soon", "Social sign-up can be enabled from your Clerk dashboard.")
                }
              >
                <Text style={styles.googleG}>G</Text>
                <Text style={styles.socialBtnText}>Google</Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>or sign up with email</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Fields */}
            <View style={styles.fields}>
              <View style={[styles.field, focusedField === "name" && styles.fieldFocused]}>
                <Ionicons
                  name="person-outline"
                  size={17}
                  color={focusedField === "name" ? "#6DBF67" : "#4A4A52"}
                  style={styles.fieldIcon}
                />
                <TextInput
                  style={styles.fieldInput}
                  placeholder="Full name"
                  placeholderTextColor="#3A3A44"
                  value={fullName}
                  onChangeText={setFullName}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              <View style={[styles.field, focusedField === "user" && styles.fieldFocused]}>
                <Text
                  style={[
                    styles.atSign,
                    focusedField === "user" && { color: "#6DBF67" },
                  ]}
                >
                  @
                </Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="Username (optional)"
                  placeholderTextColor="#3A3A44"
                  autoCapitalize="none"
                  value={username}
                  onChangeText={setUsername}
                  onFocus={() => setFocusedField("user")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              <View style={[styles.field, focusedField === "email" && styles.fieldFocused]}>
                <Ionicons
                  name="mail-outline"
                  size={17}
                  color={focusedField === "email" ? "#6DBF67" : "#4A4A52"}
                  style={styles.fieldIcon}
                />
                <TextInput
                  style={styles.fieldInput}
                  placeholder="Email address"
                  placeholderTextColor="#3A3A44"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              <View style={[styles.field, focusedField === "pw" && styles.fieldFocused]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={17}
                  color={focusedField === "pw" ? "#6DBF67" : "#4A4A52"}
                  style={styles.fieldIcon}
                />
                <TextInput
                  style={styles.fieldInput}
                  placeholder="Password (min. 6 characters)"
                  placeholderTextColor="#3A3A44"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedField("pw")}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={17}
                    color="#4A4A52"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Strength hint */}
            {password.length > 0 && (
              <View style={styles.strengthRow}>
                {[1, 2, 3, 4].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.strengthBar,
                      password.length >= i * 3 && styles.strengthBarFill,
                      password.length >= 10 && i <= 4 && styles.strengthBarStrong,
                    ]}
                  />
                ))}
                <Text style={styles.strengthLabel}>
                  {password.length < 6 ? "Too short" : password.length < 10 ? "Good" : "Strong"}
                </Text>
              </View>
            )}

            {/* CTA */}
            <TouchableOpacity
              style={[styles.cta, loading && styles.ctaDisabled]}
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={loading ? ["#1E3B1A", "#1E3B1A"] : ["#2E6B26", "#3D8A34", "#2E6B26"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                {loading ? (
                  <View style={styles.ctaRow}>
                    <Ionicons name="sync-outline" size={17} color="#6DBF67" />
                    <Text style={styles.ctaText}>Creating account…</Text>
                  </View>
                ) : (
                  <Text style={styles.ctaText}>Create Account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.replace("/signin")}>
                <Text style={styles.footerLink}> Sign in</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.termsText}>
              By creating an account you agree to our{" "}
              <Text style={styles.termsLink} onPress={() => router.push("/terms-of-service" as any)}>
                Terms of Service
              </Text>
              {" "}and{" "}
              <Text style={styles.termsLink} onPress={() => router.push("/privacy-policy" as any)}>
                Privacy Policy
              </Text>
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#030C04" },

  glowTop: {
    position: "absolute",
    top: -100,
    left: SW / 2 - 180,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: "#1A4D16",
    opacity: 0.3,
  },
  glowBottom: {
    position: "absolute",
    bottom: -80,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "#0E3A10",
    opacity: 0.4,
  },

  hero: {
    alignItems: "center",
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  logoRing: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(109,191,103,0.2)",
  },
  logoImage: { width: 54, height: 54 },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 5,
  },
  heroSub: {
    color: "rgba(255,255,255,0.32)",
    fontSize: 11,
    letterSpacing: 0.4,
  },

  card: {
    backgroundColor: "#0D1A0E",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 28,
    borderTopWidth: 1,
    borderColor: "rgba(109,191,103,0.1)",
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 18,
    gap: 2,
  },
  backText: { color: "#4A6644", fontSize: 14 },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  cardSub: { color: "#4A6644", fontSize: 13, marginBottom: 24 },

  socialRow: { flexDirection: "row", gap: 12, marginBottom: 22 },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#111C12",
    borderWidth: 1,
    borderColor: "#1E3020",
  },
  socialBtnText: { color: "#C8D8C4", fontSize: 14, fontWeight: "600" },
  googleG: { fontSize: 16, fontWeight: "800", color: "#6DBF67" },

  divider: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 22 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#14221A" },
  dividerLabel: { color: "#2E4030", fontSize: 11, fontWeight: "500", letterSpacing: 0.3 },

  fields: { gap: 11 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0A140B",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#172219",
    paddingHorizontal: 14,
    height: 52,
  },
  fieldFocused: {
    borderColor: "#2E6B26",
    backgroundColor: "#0D1A0F",
  },
  fieldIcon: { marginRight: 10 },
  atSign: { color: "#4A4A52", fontSize: 16, marginRight: 8, fontWeight: "600" },
  fieldInput: { flex: 1, color: "#E8F0E6", fontSize: 15 },
  eyeBtn: { padding: 4 },

  strengthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
    marginBottom: 2,
  },
  strengthBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#172219",
  },
  strengthBarFill: { backgroundColor: "#3D6B30" },
  strengthBarStrong: { backgroundColor: "#6DBF67" },
  strengthLabel: { color: "#3A5C34", fontSize: 10, marginLeft: 4 },

  cta: { borderRadius: 16, overflow: "hidden", marginTop: 22 },
  ctaDisabled: { opacity: 0.55 },
  ctaGradient: { height: 54, alignItems: "center", justifyContent: "center" },
  ctaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  ctaText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700", letterSpacing: 0.2 },

  footer: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  footerText: { color: "#3A4E38", fontSize: 14 },
  footerLink: { color: "#6DBF67", fontSize: 14, fontWeight: "700" },

  termsText: { color: "#253A23", fontSize: 11, textAlign: "center", marginTop: 14, lineHeight: 17 },
  termsLink: { color: "#3D6B38" },
});
