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
  Alert,
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

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Please fill in all required fields.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace("/(tabs)");
    }, 500);
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
        <View
          style={[
            styles.inner,
            {
              paddingTop: Platform.OS === "web" ? 40 : insets.top + 16,
              paddingBottom: insets.bottom + 40,
            },
          ]}
        >
          {/* Back */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Logo */}
          <View style={styles.logoSection}>
            <Image source={require("@/assets/images/sda-logo.png")} style={styles.logoImage} resizeMode="contain" />
            <Text style={styles.appName}>Create Account</Text>
            <Text style={styles.tagline} numberOfLines={1}>Join the Seventh Day Adventist</Text>
          </View>

          {/* Social buttons */}
          {!isLoaded && (
            <View style={styles.authStatusBanner}>
              <Ionicons name="time-outline" size={16} color="#FFD60A" />
              <Text style={styles.authStatusText}>
                Authentication is starting up. Account creation will be available as soon as Clerk is ready.
              </Text>
            </View>
          )}

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
            <Text style={styles.dividerText}>or sign up with email</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={18} color="#636366" style={styles.inputIcon} />
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
              <Ionicons name="mail-outline" size={18} color="#636366" style={styles.inputIcon} />
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
              <Ionicons name="lock-closed-outline" size={18} color="#636366" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password (min. 6 characters)"
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

            <TouchableOpacity
              style={[styles.signUpBtn, loading && styles.btnDisabled]}
              onPress={handleSignUp}
              disabled={loading}
            >
              <Text style={styles.signUpBtnText}>
                {loading ? "Creating account…" : "Create Account"}
              </Text>
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
            <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  inner: { flex: 1, paddingHorizontal: 24 },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  logoSection: { alignItems: "center", marginBottom: 28 },
  logoImage: { width: 76, height: 76 },
  appName: { color: "#FFFFFF", fontSize: 24, fontWeight: "800", marginBottom: 5 },
  tagline: { color: "#8E8E93", fontSize: 12, textAlign: "center" },
  socialGroup: { gap: 12, marginBottom: 22 },
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
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 22 },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: "#2C2C2E" },
  dividerText: { color: "#636366", fontSize: 12 },
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
  atSign: { color: "#636366", fontSize: 16, marginRight: 6 },
  input: { flex: 1, color: "#FFFFFF", fontSize: 15 },
  eyeBtn: { padding: 4 },
  signUpBtn: {
    backgroundColor: "#4A6741",
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  btnDisabled: { opacity: 0.6 },
  signUpBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 28 },
  footerText: { color: "#8E8E93", fontSize: 14 },
  footerLink: { color: "#6B7B5A", fontSize: 14, fontWeight: "700" },
  authStatusBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#16161A",
    borderColor: "#2C2C2E",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  authStatusText: {
    flex: 1,
    color: "#E5E5EA",
    fontSize: 13,
    lineHeight: 18,
  },
  termsText: {
    color: "#48484A",
    fontSize: 11,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 16,
  },
  termsLink: { color: "#6B7B5A" },
});
