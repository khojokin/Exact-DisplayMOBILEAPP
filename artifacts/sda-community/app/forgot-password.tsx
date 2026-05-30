import React, { useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSignIn } from "@clerk/clerk-expo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

type Step = "email" | "code" | "password" | "done";

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);

  // Step 1: send a 6-digit OTP to the user's email
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
      setStep("code");
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        "Could not send reset email. Check the address and try again.";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: verify the OTP code
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
        setStep("password");
      } else {
        Alert.alert("Error", "Unexpected response. Please start over.");
        setStep("email");
      }
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        "Invalid or expired code. Please try again.";
      Alert.alert("Incorrect code", message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: set the new password
  const handleResetPassword = async () => {
    if (newPassword.length < 8) {
      Alert.alert("Weak password", "Password must be at least 8 characters.");
      return;
    }
    if (!isLoaded || !signIn) return;
    setLoading(true);
    try {
      const result = await signIn.resetPassword({ password: newPassword });
      if (result.status === "complete") {
        await setActive?.({ session: result.createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        "Could not reset password. Please start over.";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: Platform.OS === "web" ? 40 : insets.top + 20, paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* ── Step 1: Enter email ── */}
          {step === "email" && (
            <>
              <View style={styles.iconSection}>
                <View style={styles.iconCircle}>
                  <Ionicons name="lock-open-outline" size={44} color="#6B7B5A" />
                </View>
                <Text style={styles.title}>Forgot Password?</Text>
                <Text style={styles.subtitle}>
                  Enter your email and we'll send you a 6-digit code to reset your password.
                </Text>
              </View>
              <View style={styles.form}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="mail-outline" size={18} color="#636366" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor="#636366"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    autoFocus
                  />
                </View>
              </View>
              <TouchableOpacity
                style={[styles.sendBtn, loading && styles.btnDisabled]}
                onPress={handleSend}
                disabled={loading}
              >
                <Text style={styles.sendBtnText}>{loading ? "Sending…" : "Send Reset Code"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.backToSignIn} onPress={() => router.back()}>
                <Ionicons name="arrow-back-outline" size={16} color="#6B7B5A" />
                <Text style={styles.backToSignInText}>Back to Sign In</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── Step 2: Enter OTP code ── */}
          {step === "code" && (
            <>
              <View style={styles.iconSection}>
                <View style={styles.iconCircle}>
                  <Ionicons name="keypad-outline" size={44} color="#6B7B5A" />
                </View>
                <Text style={styles.title}>Check Your Email</Text>
                <Text style={styles.subtitle}>
                  We sent a 6-digit code to{"\n"}
                  <Text style={{ color: "#6B7B5A", fontWeight: "700" }}>{email}</Text>
                </Text>
              </View>
              <View style={styles.form}>
                <Text style={styles.label}>6-Digit Code</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="shield-checkmark-outline" size={18} color="#636366" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="000000"
                    placeholderTextColor="#636366"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={code}
                    onChangeText={setCode}
                    autoFocus
                  />
                </View>
              </View>
              <TouchableOpacity
                style={[styles.sendBtn, loading && styles.btnDisabled]}
                onPress={handleVerifyCode}
                disabled={loading}
              >
                <Text style={styles.sendBtnText}>{loading ? "Verifying…" : "Verify Code"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.backToSignIn} onPress={() => { setStep("email"); setCode(""); }}>
                <Ionicons name="arrow-back-outline" size={16} color="#6B7B5A" />
                <Text style={styles.backToSignInText}>Use a different email</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── Step 3: Set new password ── */}
          {step === "password" && (
            <>
              <View style={styles.iconSection}>
                <View style={styles.iconCircle}>
                  <Ionicons name="lock-closed-outline" size={44} color="#6B7B5A" />
                </View>
                <Text style={styles.title}>New Password</Text>
                <Text style={styles.subtitle}>
                  Create a new password for your account. Must be at least 8 characters.
                </Text>
              </View>
              <View style={styles.form}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={18} color="#636366" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Min. 8 characters"
                    placeholderTextColor="#636366"
                    secureTextEntry={!showPassword}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    autoFocus
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={18}
                      color="#636366"
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.sendBtn, loading && styles.btnDisabled]}
                onPress={handleResetPassword}
                disabled={loading}
              >
                <Text style={styles.sendBtnText}>{loading ? "Saving…" : "Reset Password"}</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  scroll: { flexGrow: 1, paddingHorizontal: 24 },
  backBtn: { marginBottom: 24, width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  iconSection: { alignItems: "center", marginBottom: 36 },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#4A674122",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#6B7B5A33",
  },
  title: { color: "#FFFFFF", fontSize: 26, fontWeight: "800", marginBottom: 10 },
  subtitle: { color: "#8E8E93", fontSize: 14, textAlign: "center", lineHeight: 22, maxWidth: 300 },
  form: { gap: 4 },
  label: { color: "#AEAEB2", fontSize: 13, fontWeight: "600", marginBottom: 8 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111111",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2C2C2E",
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, color: "#FFFFFF", fontSize: 15 },
  sendBtn: {
    backgroundColor: "#4A6741",
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  btnDisabled: { opacity: 0.6 },
  sendBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  backToSignIn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 20 },
  backToSignInText: { color: "#6B7B5A", fontSize: 14, fontWeight: "600" },
});
