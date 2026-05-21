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
  ScrollView,
  Alert,
  Animated,
  Easing,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

function GoogleIcon() {
  return (
    <View style={{ width: 20, height: 20, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 15, fontWeight: "700", color: "#4285F4" }}>G</Text>
    </View>
  );
}

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── Animation values ─────────────────────────────────────────
  const logoScale   = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity= useRef(new Animated.Value(0)).current;
  const titleY      = useRef(new Animated.Value(20)).current;
  const taglineOp   = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formY       = useRef(new Animated.Value(30)).current;
  const footerOp    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance sequence
    Animated.sequence([
      // 1. Logo pop-in
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 70,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // 2. Title slides up
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 380,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(titleY, {
          toValue: 0,
          duration: 380,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      // 3. Tagline
      Animated.timing(taglineOp, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
      // 4. Form slides up
      Animated.parallel([
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(formY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      // 5. Footer
      Animated.timing(footerOp, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSignIn = () => {
    if (!identifier.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Please enter your email/username and password.");
      return;
    }
    router.replace("/(tabs)");
  };

  const handleSocial = (_provider: "Google" | "Apple") => {
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: Platform.OS === "web" ? 60 : insets.top + 30,
              paddingBottom: insets.bottom + 40,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Animated logo + title ─────────────────────── */}
          <View style={styles.logoSection}>
            <Animated.View style={[styles.logoCircle, { transform: [{ scale: logoScale }], opacity: logoOpacity }]}>
              <Image source={require("@/assets/images/sda-logo.png")} style={styles.logoImage} resizeMode="contain" />
            </Animated.View>

            <Animated.Text style={[styles.appName, { opacity: titleOpacity, transform: [{ translateY: titleY }] }]}>
              SDA Community
            </Animated.Text>

            <Animated.Text style={[styles.tagline, { opacity: taglineOp }]}>
              Welcome back
            </Animated.Text>
          </View>

          {/* ── Animated form ─────────────────────────────── */}
          <Animated.View style={{ opacity: formOpacity, transform: [{ translateY: formY }] }}>
            {/* Social buttons */}
            <View style={styles.socialGroup}>
              <TouchableOpacity style={styles.appleBtn} onPress={() => handleSocial("Apple")}>
                <Ionicons name="logo-apple" size={20} color="#FFF" />
                <Text style={styles.appleBtnText}>Continue with Apple</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.googleBtn} onPress={() => handleSocial("Google")}>
                <GoogleIcon />
                <Text style={styles.googleBtnText}>Continue with Google</Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Form fields */}
            <View style={styles.form}>
              <View style={styles.inputWrap}>
                <Ionicons name="person-outline" size={18} color="#636366" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email or username"
                  placeholderTextColor="#636366"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={identifier}
                  onChangeText={setIdentifier}
                />
              </View>

              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color="#636366" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#636366"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color="#636366"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.forgotLink} onPress={() => router.push("/forgot-password")}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.signInBtn, loading && styles.btnDisabled]}
                onPress={handleSignIn}
                disabled={loading}
              >
                {loading ? (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Ionicons name="sync-outline" size={18} color="#FFF" />
                    <Text style={styles.signInBtnText}>Signing in…</Text>
                  </View>
                ) : (
                  <Text style={styles.signInBtnText}>Log in</Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* ── Footer ────────────────────────────────────── */}
          <Animated.View style={[styles.footer, { opacity: footerOp }]}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/signup")}>
              <Text style={styles.footerLink}> Sign up</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.Text style={[styles.termsText, { opacity: footerOp }]}>
            By continuing you agree to our Terms of Service and Privacy Policy.
          </Animated.Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  scroll: { flexGrow: 1, paddingHorizontal: 24 },
  logoSection: { alignItems: "center", marginBottom: 36 },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logoImage: { width: 60, height: 60 },
  appName: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  tagline: { color: "#8E8E93", fontSize: 15 },
  socialGroup: { gap: 12, marginBottom: 24 },
  appleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    height: 52,
  },
  appleBtnText: { color: "#000000", fontSize: 15, fontWeight: "600" },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#1C1C1E",
    borderRadius: 14,
    height: 52,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#3C3C3E",
  },
  googleBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: "#2C2C2E" },
  dividerText: { color: "#636366", fontSize: 13 },
  form: { gap: 12 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111111",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2C2C2E",
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, color: "#FFFFFF", fontSize: 15 },
  eyeBtn: { padding: 4 },
  forgotLink: { alignSelf: "flex-end" },
  forgotText: { color: "#6B7B5A", fontSize: 13, fontWeight: "600" },
  signInBtn: {
    backgroundColor: "#4A6741",
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  btnDisabled: { opacity: 0.6 },
  signInBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 32 },
  footerText: { color: "#8E8E93", fontSize: 14 },
  footerLink: { color: "#6B7B5A", fontSize: 14, fontWeight: "700" },
  termsText: {
    color: "#48484A",
    fontSize: 11,
    textAlign: "center",
    marginTop: 20,
    lineHeight: 16,
  },
});
