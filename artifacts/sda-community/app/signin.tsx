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
  Animated,
  ScrollView,
  Dimensions,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSignIn } from "@clerk/clerk-expo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

const { width: SW, height: SH } = Dimensions.get("window");

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const bgScale    = useRef(new Animated.Value(1.08)).current;
  const heroOp     = useRef(new Animated.Value(0)).current;
  const logoY      = useRef(new Animated.Value(-24)).current;
  const logoOp     = useRef(new Animated.Value(0)).current;
  const cardY      = useRef(new Animated.Value(60)).current;
  const cardOp     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(bgScale, { toValue: 1, duration: 1200, useNativeDriver: true }),
      Animated.timing(heroOp, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(200),
        Animated.parallel([
          Animated.spring(logoY, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
          Animated.timing(logoOp, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]),
      ]),
      Animated.sequence([
        Animated.delay(400),
        Animated.parallel([
          Animated.spring(cardY, { toValue: 0, tension: 55, friction: 11, useNativeDriver: true }),
          Animated.timing(cardOp, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]),
      ]),
    ]).start();
  }, []);

  const handleSignIn = async () => {
    if (!isLoaded || !signIn) {
      Alert.alert("Not ready", "Please wait a moment and try again.");
      return;
    }
    if (!identifier.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Enter your email/username and password.");
      return;
    }
    setLoading(true);
    try {
      const result = await signIn.create({ identifier: identifier.trim(), password });
      if (result.status === "complete") {
        await setActive?.({ session: result.createdSessionId });
        router.replace("/(tabs)");
        return;
      }
      Alert.alert("Additional step required", "Please complete verification in your email.");
    } catch (error: any) {
      const message =
        error?.errors?.[0]?.longMessage ||
        error?.errors?.[0]?.message ||
        error?.message ||
        "Unable to sign in. Please try again.";
      Alert.alert("Sign-in failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Background */}
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ scale: bgScale }] }]}>
        <LinearGradient
          colors={["#030C04", "#071A0A", "#0C2410", "#071A0A"]}
          locations={[0, 0.3, 0.65, 1]}
          style={StyleSheet.absoluteFill}
        />
        {/* Radial glow top */}
        <View style={styles.glowTop} />
        {/* Subtle grid lines */}
        <Animated.View style={[styles.gridOverlay, { opacity: heroOp }]} />
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
                paddingTop: Platform.OS === "web" ? 72 : insets.top + 48,
                opacity: heroOp,
                transform: [{ translateY: logoY }],
              },
            ]}
          >
            <Animated.View style={[styles.logoRing, { opacity: logoOp }]}>
              <LinearGradient
                colors={["#1E4D1A", "#2E6B28", "#1E4D1A"]}
                style={styles.logoRingGradient}
              />
              <Image
                source={require("@/assets/images/sda-logo.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </Animated.View>
            <Animated.Text style={[styles.heroTitle, { opacity: logoOp }]}>
              SDA Community
            </Animated.Text>
            <Animated.Text style={[styles.heroSub, { opacity: logoOp }]}>
              Seventh-day Adventist · Faith · Fellowship
            </Animated.Text>
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
            <Text style={styles.cardTitle}>Welcome back</Text>
            <Text style={styles.cardSub}>Sign in to your account</Text>

            {/* Social */}
            <View style={styles.socialRow}>
              <TouchableOpacity
                style={styles.socialBtn}
                onPress={() =>
                  Alert.alert("Coming soon", "Social sign-in can be enabled from your Clerk dashboard.")
                }
              >
                <Ionicons name="logo-apple" size={19} color="#FFF" />
                <Text style={styles.socialBtnText}>Apple</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialBtn}
                onPress={() =>
                  Alert.alert("Coming soon", "Social sign-in can be enabled from your Clerk dashboard.")
                }
              >
                <Text style={styles.googleG}>G</Text>
                <Text style={styles.socialBtnText}>Google</Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>or continue with email</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Fields */}
            <View style={styles.fields}>
              <View style={[styles.field, focusedField === "id" && styles.fieldFocused]}>
                <Ionicons
                  name="mail-outline"
                  size={17}
                  color={focusedField === "id" ? "#6DBF67" : "#4A4A52"}
                  style={styles.fieldIcon}
                />
                <TextInput
                  style={styles.fieldInput}
                  placeholder="Email or username"
                  placeholderTextColor="#3A3A44"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={identifier}
                  onChangeText={setIdentifier}
                  onFocus={() => setFocusedField("id")}
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
                  placeholder="Password"
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

              <TouchableOpacity
                style={styles.forgotLink}
                onPress={() => router.push("/forgot-password")}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {/* CTA */}
            <TouchableOpacity
              style={[styles.cta, loading && styles.ctaDisabled]}
              onPress={handleSignIn}
              disabled={loading || !isLoaded}
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
                    <Text style={styles.ctaText}>Signing in…</Text>
                  </View>
                ) : (
                  <Text style={styles.ctaText}>Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => router.push("/signup")}>
                <Text style={styles.footerLink}> Create one</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.termsText}>
              By continuing you agree to our{" "}
              <Text style={styles.termsLink} onPress={() => router.push("/terms-of-service" as any)}>
                Terms
              </Text>
              {" & "}
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
    top: -120,
    left: SW / 2 - 200,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: "#1A4D16",
    opacity: 0.35,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.03,
  },

  hero: {
    alignItems: "center",
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  logoRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(109,191,103,0.25)",
  },
  logoRingGradient: { ...StyleSheet.absoluteFillObject },
  logoImage: { width: 60, height: 60 },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  heroSub: {
    color: "rgba(255,255,255,0.38)",
    fontSize: 12,
    letterSpacing: 0.4,
  },

  card: {
    backgroundColor: "#0D1A0E",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 32,
    borderTopWidth: 1,
    borderColor: "rgba(109,191,103,0.1)",
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  cardSub: { color: "#4A6644", fontSize: 13, marginBottom: 28 },

  socialRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
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

  divider: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#14221A" },
  dividerLabel: { color: "#2E4030", fontSize: 11, fontWeight: "500", letterSpacing: 0.3 },

  fields: { gap: 12 },
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
  fieldInput: { flex: 1, color: "#E8F0E6", fontSize: 15 },
  eyeBtn: { padding: 4 },
  forgotLink: { alignSelf: "flex-end", marginTop: 2 },
  forgotText: { color: "#4A7A40", fontSize: 13, fontWeight: "600" },

  cta: { borderRadius: 16, overflow: "hidden", marginTop: 24 },
  ctaDisabled: { opacity: 0.55 },
  ctaGradient: { height: 54, alignItems: "center", justifyContent: "center" },
  ctaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  ctaText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700", letterSpacing: 0.2 },

  footer: { flexDirection: "row", justifyContent: "center", marginTop: 28 },
  footerText: { color: "#3A4E38", fontSize: 14 },
  footerLink: { color: "#6DBF67", fontSize: 14, fontWeight: "700" },

  termsText: { color: "#253A23", fontSize: 11, textAlign: "center", marginTop: 16, lineHeight: 17 },
  termsLink: { color: "#3D6B38" },
});
