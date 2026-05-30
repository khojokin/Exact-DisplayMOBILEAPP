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

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

function GoogleIcon() {
  return (
    <View style={{ width: 20, height: 20, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 15, fontWeight: "700", color: "#4285F4" }}>G</Text>
    </View>
  );
}

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Animations
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const formTranslate = useRef(new Animated.Value(40)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(heroOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(formTranslate, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(formOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
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
      Alert.alert("Auth not ready", "Please wait a moment and try again.");
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
        "Account created",
        "Please complete any required verification from your email, then sign in.",
        [{ text: "Go to Sign in", onPress: () => router.replace("/signin") }],
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

  const handleSocial = (_provider: "Google" | "Apple") => {
    Alert.alert("Coming soon", "Social sign-up can be enabled from your Clerk dashboard.");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Hero section */}
      <Animated.View style={[styles.heroSection, { opacity: heroOpacity }]}>
        <LinearGradient
          colors={["#0D1B0F", "#1A3A1F", "#2A4A2A"]}
          style={StyleSheet.absoluteFill}
        />
        <Image
          source={require("@/assets/images/sda-logo.png")}
          style={styles.heroLogo}
          resizeMode="contain"
        />
        <Text style={styles.heroTitle}>Join SDA Community</Text>
        <Text style={styles.heroSub}>Seventh-day Adventist · Faith · Fellowship</Text>
      </Animated.View>

      {/* Form card (slides up) */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.formCard,
              {
                opacity: formOpacity,
                transform: [{ translateY: formTranslate }],
                paddingBottom: insets.bottom + 32,
              },
            ]}
          >
            {/* Back button */}
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color="#8E8E93" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            <Text style={styles.cardTitle}>Create Account</Text>
            <Text style={styles.cardSub}>Start your faith journey today</Text>

            {/* Social buttons */}
            <View style={styles.socialGroup}>
              <TouchableOpacity style={styles.appleBtn} onPress={() => handleSocial("Apple")}>
                <Ionicons name="logo-apple" size={19} color="#FFF" />
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
              <Text style={styles.dividerText}>or sign up with email</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Form inputs */}
            <View style={styles.form}>
              <View style={styles.inputWrap}>
                <Ionicons name="person-outline" size={17} color="#636366" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full name"
                  placeholderTextColor="#636366"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              <View style={styles.inputWrap}>
                <Text style={styles.atSign}>@</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="#636366"
                  autoCapitalize="none"
                  value={username}
                  onChangeText={setUsername}
                />
              </View>

              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={17} color="#636366" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor="#636366"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={17} color="#636366" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password (min. 6 characters)"
                  placeholderTextColor="#636366"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={17} color="#636366" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.signUpBtn, loading && styles.btnDisabled]}
                onPress={handleSignUp}
                disabled={loading}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={["#3A6B32", "#4A7B42", "#5A8B52"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.signUpBtnGradient}
                >
                  <Text style={styles.signUpBtnText}>
                    {loading ? "Creating account…" : "Create Account"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.replace("/signin")}>
                <Text style={styles.footerLink}> Log in</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.termsText}>
              By creating an account you agree to our{" "}
              <Text style={styles.termsLink} onPress={() => router.push("/terms-of-service" as any)}>Terms of Service</Text>
              {" "}and{" "}
              <Text style={styles.termsLink} onPress={() => router.push("/privacy-policy" as any)}>Privacy Policy</Text>.
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },

  // Hero
  heroSection: {
    height: SCREEN_HEIGHT * 0.28,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  heroLogo: { width: 68, height: 68, marginBottom: 12 },
  heroTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "800", letterSpacing: 0.2 },
  heroSub: { color: "rgba(255,255,255,0.55)", fontSize: 12, marginTop: 5 },

  // Form card
  formCard: {
    flex: 1,
    backgroundColor: "#111",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    marginTop: -20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  backBtn: { flexDirection: "row", alignItems: "center", marginBottom: 16, alignSelf: "flex-start" },
  backText: { color: "#8E8E93", fontSize: 14, marginLeft: 2 },
  cardTitle: { color: "#FFFFFF", fontSize: 26, fontWeight: "800", marginBottom: 4 },
  cardSub: { color: "#636366", fontSize: 13, marginBottom: 24 },

  socialGroup: { gap: 11, marginBottom: 20 },
  appleBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: "#1C1C1E", borderRadius: 14, height: 50,
    borderWidth: StyleSheet.hairlineWidth, borderColor: "#3C3C3E",
  },
  appleBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
  googleBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: "#1C1C1E", borderRadius: 14, height: 50,
    borderWidth: StyleSheet.hairlineWidth, borderColor: "#3C3C3E",
  },
  googleBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },

  dividerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: "#2C2C2E" },
  dividerText: { color: "#48484A", fontSize: 12 },

  form: { gap: 11 },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#1A1A1A", borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth, borderColor: "#2C2C2E",
    paddingHorizontal: 14, height: 52,
  },
  inputIcon: { marginRight: 8 },
  atSign: { color: "#636366", fontSize: 16, marginRight: 6 },
  input: { flex: 1, color: "#FFFFFF", fontSize: 15 },
  eyeBtn: { padding: 4 },

  signUpBtn: { borderRadius: 14, overflow: "hidden", marginTop: 6 },
  signUpBtnGradient: { height: 52, alignItems: "center", justifyContent: "center" },
  btnDisabled: { opacity: 0.6 },
  signUpBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700", letterSpacing: 0.3 },

  footer: { flexDirection: "row", justifyContent: "center", marginTop: 28 },
  footerText: { color: "#8E8E93", fontSize: 14 },
  footerLink: { color: "#6B7B5A", fontSize: 14, fontWeight: "700" },

  termsText: { color: "#48484A", fontSize: 11, textAlign: "center", marginTop: 14, lineHeight: 16 },
  termsLink: { color: "#6B7B5A" },
});
