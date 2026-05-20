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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

type Step = "email" | "sent";

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (!email.trim()) {
      Alert.alert("Enter email", "Please enter your registered email address.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("sent");
    }, 1200);
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

          {step === "email" ? (
            <>
              <View style={styles.iconSection}>
                <View style={styles.iconCircle}>
                  <Ionicons name="lock-open-outline" size={44} color="#6B7B5A" />
                </View>
                <Text style={styles.title}>Forgot Password?</Text>
                <Text style={styles.subtitle}>
                  No worries! Enter your registered email and we'll send you a reset link.
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

                <TouchableOpacity
                  style={[styles.sendBtn, loading && styles.btnDisabled]}
                  onPress={handleSend}
                  disabled={loading}
                >
                  <Text style={styles.sendBtnText}>{loading ? "Sending…" : "Send Reset Link"}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.backToSignIn} onPress={() => router.back()}>
                  <Ionicons name="arrow-back-outline" size={16} color="#6B7B5A" />
                  <Text style={styles.backToSignInText}>Back to Sign In</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.successSection}>
              <View style={styles.successCircle}>
                <Ionicons name="checkmark-circle" size={64} color="#6B7B5A" />
              </View>
              <Text style={styles.successTitle}>Email Sent!</Text>
              <Text style={styles.successBody}>
                We sent a password reset link to{"\n"}
                <Text style={styles.successEmail}>{email}</Text>
              </Text>
              <Text style={styles.successHint}>
                Check your inbox (and spam folder) and follow the link to reset your password.
              </Text>

              <TouchableOpacity
                style={styles.sendBtn}
                onPress={() => {
                  setStep("email");
                  setEmail("");
                }}
              >
                <Text style={styles.sendBtnText}>Try a Different Email</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.backToSignIn} onPress={() => router.replace("/signin")}>
                <Ionicons name="arrow-back-outline" size={16} color="#6B7B5A" />
                <Text style={styles.backToSignInText}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
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
  successSection: { flex: 1, alignItems: "center", paddingTop: 40 },
  successCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#4A674122",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#6B7B5A33",
  },
  successTitle: { color: "#FFFFFF", fontSize: 26, fontWeight: "800", marginBottom: 12 },
  successBody: { color: "#8E8E93", fontSize: 14, textAlign: "center", lineHeight: 22, marginBottom: 10 },
  successEmail: { color: "#6B7B5A", fontWeight: "700" },
  successHint: { color: "#636366", fontSize: 13, textAlign: "center", lineHeight: 20, marginBottom: 32, maxWidth: 300 },
});
