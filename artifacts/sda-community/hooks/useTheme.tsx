import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME_KEY = "@sda_theme_dark";

export const DARK = {
  bg: "#07070A",
  bgSecondary: "#0E0E12",
  card: "#1C1C1E",
  text: "#FFFFFF",
  subtext: "#8E8E93",
  mutedText: "#636366",
  border: "#2C2C2E",
  borderLight: "#3C3C3E",
  accent: "#6B7B5A",
  accentDark: "#4A6741",
  bubbleSent: "#2E7D4E",
  bubbleReceived: "#232326",
  bubbleTextSent: "#FFFFFF",
  bubbleTextReceived: "#EDEDED",
  inputBg: "#1C1C1E",
  inputText: "#FFFFFF",
  inputPlaceholder: "#636366",
  statusBar: "light-content" as const,
  tabBar: "#111111",
  tabBorder: "#2C2C2E",
  online: "#34C759",
  headerBorder: "#1D1D1F",
  sectionHeader: "#8E8E93",
  danger: "#FF453A",
  // Glass tokens
  glassCard: "rgba(28, 28, 34, 0.76)",
  glassBg: "rgba(10, 10, 14, 0.92)",
  glassBorder: "rgba(255, 255, 255, 0.09)",
  glassHighlight: "rgba(255, 255, 255, 0.14)",
  glassTabBar: "rgba(6, 6, 10, 0.90)",
  glassSheet: "rgba(16, 16, 22, 0.97)",
  glassInput: "rgba(255, 255, 255, 0.06)",
};

export const LIGHT = {
  bg: "#F0F0F5",
  bgSecondary: "#FFFFFF",
  card: "#FFFFFF",
  text: "#000000",
  subtext: "#6D6D6D",
  mutedText: "#8A8A8E",
  border: "#E5E5EA",
  borderLight: "#D1D1D6",
  accent: "#4A8A5D",
  accentDark: "#3A7050",
  bubbleSent: "#4A8A5D",
  bubbleReceived: "#E9E9EB",
  bubbleTextSent: "#FFFFFF",
  bubbleTextReceived: "#1C1C1E",
  inputBg: "#E9E9EB",
  inputText: "#000000",
  inputPlaceholder: "#8A8A8E",
  statusBar: "light-content" as const,
  tabBar: "#FFFFFF",
  tabBorder: "#E5E5EA",
  online: "#34C759",
  headerBorder: "#E5E5EA",
  sectionHeader: "#6D6D6D",
  danger: "#FF3B30",
  // Glass tokens
  glassCard: "rgba(255, 255, 255, 0.72)",
  glassBg: "rgba(240, 240, 248, 0.92)",
  glassBorder: "rgba(0, 0, 0, 0.07)",
  glassHighlight: "rgba(255, 255, 255, 0.90)",
  glassTabBar: "rgba(255, 255, 255, 0.88)",
  glassSheet: "rgba(248, 248, 252, 0.97)",
  glassInput: "rgba(0, 0, 0, 0.04)",
};

export type ThemeColors = typeof DARK;

interface ThemeCtx {
  isDark: boolean;
  toggle: () => void;
  t: ThemeColors;
}

const ThemeContext = createContext<ThemeCtx>({
  isDark: true,
  toggle: () => {},
  t: DARK,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((v) => {
      if (v !== null) setIsDark(v === "true");
    });
  }, []);

  function toggle() {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(THEME_KEY, String(next));
      return next;
    });
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggle, t: isDark ? DARK : LIGHT }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
