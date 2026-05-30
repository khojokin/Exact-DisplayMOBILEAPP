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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSignIn } from "@clerk/clerk-expo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

const { width: SW } = Dimensions.get("window");

type Step = "email" | "code" | "password" | "done";

const STEPS = {
  email:    { icon: "mail-outline" as const,            title: "Forgot Password?",  sub: "Enter your email and we'll send\na 6-digit reset code." },
  code:     { icon: "shield-checkmark-outline" as const, title: "Check Your Email",  sub: "" },
  password: { icon: "lock-closed-outline" as const,     title: "New Password",       sub: "Choose a strong password\n(min. 8 characters)." },
  done:     { icon: "checkmark-circle-outline" as const, title: "All Done!",          sub: "Your password has been reset.\nYou are now signed in." },
};

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail]             = useState("");
  const [code, setCode]               = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep]               = useState<Step>("email");
  const [loading, setLoading]         = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const bgOp   = useRef(new Animated.Value(0)).current;
  const cardY  = useRef(new Animated.Value(50)).current;
  const cardOp = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.6)).current;
  const iconOp    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(bgOp, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(100),
        Animated.parallel([
          Animated.spring(iconScale, { toValue: 1, tension: 70, friction: 8, useNativeDriver: true }),
          Animated.timing(iconOp, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
      ]),
      Animated.sequence([
        Animated.delay(200),
        Animated.parallel([
          Animated.spring(cardY, { toValue: 0, tension: 55, friction: 11, useNativeDriver: true }),
          Animated.timing(cardOp, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]),
      ]),
    ]).start();
  }, []);

  const animateStepChange = () => {
    iconScale.setValue(0.7);
    iconOp.setValue(0);
    Animated.parallel([
      Animated.spring(iconScale, { toValue: 1, tension: 70, friction: 8, useNativeDriver: true }),
      Animated.timing(iconOp, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();
  };

  const handleSend = async () => {
    if (!email.trim()) {
      Alert.alert("Enter email", "Please enter your registered email address.");
      return;
    }
    if (!isLoaded || !signIn) return;
    setLoading(true);
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email.trim().toLowerCase(),
      });
      animateStepChange();
      setStep("code");
    } catch (err: any) {
      Alert.alert("Error", err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || "Could not send reset email. Check the address and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code.trim()) {
      Alert.alert("Enter code", "Please enter the 6-digit code from your email.");
      return;
    }
    if (!isLoaded || !signIn) return;
    setLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: code.trim(),
      });
      if (result.status === "needs_new_password") {
        animateStepChange();
        setStep("password");
      } else {
        Alert.alert("Error", "Unexpected response. Please start over.");
        setStep("email");
      }
    } catch (err: any) {
      Alert.alert("Incorrect code", err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 8) {
      Alert.alert("Too short", "Password must be at least 8 characters.");
      return;
    }
    if (!isLoaded || !signIn) return;
    setLoading(true);
    try {
      const result = await signIn.resetPassword({ password: newPassword });
      if (result.status === "complete") {
        await setActive?.({ session: result.createdSessionId });
        animateStepChange();
        setStep("done");
        setTimeout(() => router.replace("/(tabs)"), 1600);
      }
    } catch (err: any) {
      Alert.alert("Error", err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || "Could not reset password. Please start over.");
    } finally {
      setLoading(false);
    }
  };

  const meta = STEPS[step];

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
          {/* ── Header ── */}
          <View
            style={[
              styles.header,
              { paddingTop: Platform.OS === "web" ? 56 : insets.top + 16 },
            ]}
          >
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={20} color="#4A6644" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            {/* Step dots */}
            <View style={styles.dots}>
              {(["email", "code", "password"] as const).map((s, i) => (
                <View
                  key={s}
                  style={[
                    styles.dot,
                    (step === s || (step === "done" && i < 3)) && styles.dotActive,
                    step === "done" && styles.dotDone,
                  ]}
                />
              ))}
            </View>
          </View>

          {/* ── Icon ── */}
          <Animated.View
            style={[styles.iconSection, { opacity: iconOp, transform: [{ scale: iconScale }] }]}
          >
            <View style={styles.iconRing}>
              <LinearGradient colors={["#1A4016", "#2A6020", "#1A4016"]} style={StyleSheet.absoluteFill} />
              <Ionicons name={meta.icon} size={40} color="#6DBF67" />
            </View>
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
            <Text style={styles.cardTitle}>{meta.title}</Text>
            <Text style={styles.cardSub}>
              {step === "code"
                ? `We sent a code to\n`
                : meta.sub}
              {step === "code" && (
                <Text style={styles.emailHighlight}>{email}</Text>
              )}
            </Text>

            {/* ── Step: email ── */}
            {step === "email" && (
              <>
                <View style={[styles.field, focusedField === "email" && styles.fieldFocused]}>
                  <Ionicons
                    name="mail-outline"
                    size={17}
                    color={focusedField === "email" ? "#6DBF67" : "#4A4A52"}
                    style={styles.fieldIcon}
                  />
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="your@email.com"
                    placeholderTextColor="#3A3A44"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    autoFocus
                  />
                </View>

                <TouchableOpacity
                  style={[styles.cta, loading && styles.ctaDisabled]}
                  onPress={handleSend}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={loading ? ["#1E3B1A", "#1E3B1A"] : ["#2E6B26", "#3D8A34", "#2E6B26"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.ctaGradient}
                  >
                    {loading ? (
                      <View style={styles.ctaRow}><Ionicons name="sync-outline" size={17} color="#6DBF67" /><Text style={styles.ctaText}>Sending…</Text></View>
                    ) : (
                      <Text style={styles.ctaText}>Send Reset Code</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {/* ── Step: code ── */}
            {step === "code" && (
              <>
                <View style={[styles.field, styles.codeField, focusedField === "code" && styles.fieldFocused]}>
                  <Ionicons
                    name="keypad-outline"
                    size={17}
                    color={focusedField === "code" ? "#6DBF67" : "#4A4A52"}
                    style={styles.fieldIcon}
                  />
                  <TextInput
                    style={[styles.fieldInput, styles.codeInput]}
                    placeholder="000000"
                    placeholderTextColor="#3A3A44"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={code}
                    onChangeText={setCode}
                    onFocus={() => setFocusedField("code")}
                    onBlur={() => setFocusedField(null)}
                    autoFocus
                  />
                </View>

                <TouchableOpacity
                  style={[styles.cta, loading && styles.ctaDisabled]}
                  onPress={handleVerifyCode}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={loading ? ["#1E3B1A", "#1E3B1A"] : ["#2E6B26", "#3D8A34", "#2E6B26"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.ctaGradient}
                  >
                    {loading ? (
                      <View style={styles.ctaRow}><Ionicons name="sync-outline" size={17} color="#6DBF67" /><Text style={styles.ctaText}>Verifying…</Text></View>
                    ) : (
                      <Text style={styles.ctaText}>Verify Code</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.resendBtn} onPress={() => { setStep("email"); setCode(""); }}>
                  <Text style={styles.resendText}>Use a different email</Text>
                </TouchableOpacity>
              </>
            )}

            {/* ── Step: password ── */}
            {step === "password" && (
              <>
                <View style={[styles.field, focusedField === "pw" && styles.fieldFocused]}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={17}
                    color={focusedField === "pw" ? "#6DBF67" : "#4A4A52"}
                    style={styles.fieldIcon}
                  />
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="Min. 8 characters"
                    placeholderTextColor="#3A3A44"
                    secureTextEntry={!showPassword}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    onFocus={() => setFocusedField("pw")}
                    onBlur={() => setFocusedField(null)}
                    autoFocus
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={17} color="#4A4A52" />
                  </TouchableOpacity>
                </View>

                {newPassword.length > 0 && (
                  <View style={styles.strengthRow}>
                    {[1, 2, 3, 4].map((i) => (
                      <View
                        key={i}
                        style={[
                          styles.strengthBar,
                          newPassword.length >= i * 3 && styles.strengthBarFill,
                          newPassword.length >= 10 && i <= 4 && styles.strengthBarStrong,
                        ]}
                      />
                    ))}
                    <Text style={styles.strengthLabel}>
                      {newPassword.length < 8 ? "Too short" : newPassword.length < 10 ? "Good" : "Strong"}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.cta, loading && styles.ctaDisabled]}
                  onPress={handleResetPassword}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={loading ? ["#1E3B1A", "#1E3B1A"] : ["#2E6B26", "#3D8A34", "#2E6B26"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.ctaGradient}
                  >
                    {loading ? (
                      <View style={styles.ctaRow}><Ionicons name="sync-outline" size={17} color="#6DBF67" /><Text style={styles.ctaText}>Saving…</Text></View>
                    ) : (
                      <Text style={styles.ctaText}>Reset Password</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {/* ── Step: done ── */}
            {step === "done" && (
              <View style={styles.doneSection}>
                <Text style={styles.doneSub}>Redirecting you to the app…</Text>
                <TouchableOpacity style={styles.cta} onPress={() => router.replace("/(tabs)")} activeOpacity={0.85}>
                  <LinearGradient colors={["#2E6B26", "#3D8A34", "#2E6B26"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaGradient}>
                    <Text style={styles.ctaText}>Go to App</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
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
    top: -80,
    left: SW / 2 - 160,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "#1A4D16",
    opacity: 0.28,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  backText: { color: "#4A6644", fontSize: 14 },
  dots: { flexDirection: "row", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#172219" },
  dotActive: { backgroundColor: "#3D6B30", width: 20 },
  dotDone: { backgroundColor: "#6DBF67" },

  iconSection: {
    alignItems: "center",
    paddingVertical: 32,
  },
  iconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(109,191,103,0.2)",
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
  cardTitle: { color: "#FFFFFF", fontSize: 24, fontWeight: "800", letterSpacing: -0.3, marginBottom: 8 },
  cardSub: { color: "#4A6644", fontSize: 14, lineHeight: 22, marginBottom: 28 },
  emailHighlight: { color: "#6DBF67", fontWeight: "700" },

  field: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0A140B",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#172219",
    paddingHorizontal: 14,
    height: 54,
    marginBottom: 4,
  },
  codeField: { height: 64 },
  fieldFocused: { borderColor: "#2E6B26", backgroundColor: "#0D1A0F" },
  fieldIcon: { marginRight: 10 },
  fieldInput: { flex: 1, color: "#E8F0E6", fontSize: 15 },
  codeInput: { fontSize: 28, fontWeight: "700", letterSpacing: 8, textAlign: "center" },
  eyeBtn: { padding: 4 },

  strengthRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 8, marginBottom: 4 },
  strengthBar: { flex: 1, height: 3, borderRadius: 2, backgroundColor: "#172219" },
  strengthBarFill: { backgroundColor: "#3D6B30" },
  strengthBarStrong: { backgroundColor: "#6DBF67" },
  strengthLabel: { color: "#3A5C34", fontSize: 10, marginLeft: 4 },

  cta: { borderRadius: 16, overflow: "hidden", marginTop: 20 },
  ctaDisabled: { opacity: 0.55 },
  ctaGradient: { height: 54, alignItems: "center", justifyContent: "center" },
  ctaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  ctaText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700", letterSpacing: 0.2 },

  resendBtn: { alignItems: "center", marginTop: 20 },
  resendText: { color: "#4A7A40", fontSize: 13, fontWeight: "600" },

  doneSection: { alignItems: "center", gap: 8 },
  doneSub: { color: "#4A6644", fontSize: 13, marginBottom: 8 },
});
