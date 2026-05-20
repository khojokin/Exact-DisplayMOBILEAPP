import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NotificationProvider } from "@/hooks/useNotifications";
import { AIProvider } from "@/hooks/useAI";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#0A0A0A" } }}>
      <Stack.Screen name="signin" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="activity"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="settings"
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen
        name="post/[id]"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="edit-profile"
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen
        name="followers"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="story/[id]"
        options={{ headerShown: false, presentation: "fullScreenModal" }}
      />
      <Stack.Screen
        name="dm/[id]"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="call/[id]"
        options={{ headerShown: false, presentation: "fullScreenModal" }}
      />
      <Stack.Screen
        name="members"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="community-detail"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="prayer-wall"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="devotional"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="church-directory"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="church-bulletin"
        options={{ headerShown: false, presentation: "card" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#0A0A0A" }}>
            <KeyboardProvider>
              <AIProvider>
                <NotificationProvider>
                  <RootLayoutNav />
                </NotificationProvider>
              </AIProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
