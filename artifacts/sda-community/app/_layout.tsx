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
import { Platform, View, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NotificationProvider } from "@/hooks/useNotifications";
import { AIProvider } from "@/hooks/useAI";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import { VideoPostsProvider } from "@/hooks/useVideoPosts";
import { StripeProviderWrapper } from "@/components/StripeProviderWrapper";
import { STRIPE_PUBLISHABLE_KEY } from "@/lib/stripe";
import { ThemeProvider } from "@/hooks/useTheme";
import { SessionProvider, useSession } from "@/lib/session";
import { useProfileSync } from "@/hooks/useProfileSync";

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0A0A0A" },
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen name="signin" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="activity"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="settings"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="accessibility"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="post/[id]"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="edit-profile"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="followers"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="story/[id]"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="dm/[id]"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="call/[id]"
        options={{ headerShown: false, presentation: "card" }}
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
        name="new-community"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="devotional"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="resources"
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
      <Stack.Screen
        name="subscription"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="analytics"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="live"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="shorts"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="shorts-see-all"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="go-live"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="admin"
        options={{ headerShown: false, presentation: "card" }}
      />
    </Stack>
  );
}

function AppBootstrap() {
  const { isLoaded } = useSession();
  useProfileSync();

  if (!isLoaded) {
    return <View style={{ flex: 1, backgroundColor: "#0A0A0A" }} />;
  }

  try {
    return (
      <StripeProviderWrapper publishableKey={STRIPE_PUBLISHABLE_KEY}>
        <SubscriptionProvider>
          <VideoPostsProvider>
            <AIProvider>
              <NotificationProvider>
                <RootLayoutNav />
              </NotificationProvider>
            </AIProvider>
          </VideoPostsProvider>
        </SubscriptionProvider>
      </StripeProviderWrapper>
    );
  } catch (error) {
    console.error("[AppBootstrap] Render error:", error);
    return (
      <View style={{ flex: 1, backgroundColor: "#0A0A0A", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#FFFFFF", textAlign: "center", paddingHorizontal: 16 }}>
          Failed to initialize app. Please restart.
        </Text>
      </View>
    );
  }
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError || Platform.OS === "web") {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  // Fallback: ensure splash is hidden after a timeout in case auth, fonts,
  // or other initialization hang in production (prevents permanent black screen).
  useEffect(() => {
    if (Platform.OS === "web") return;
    const id = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 5000);
    return () => clearTimeout(id);
  }, []);

  if (!fontsLoaded && !fontError && Platform.OS !== "web") return <SafeAreaProvider><View style={{ flex: 1, backgroundColor: "#0A0A0A" }} /></SafeAreaProvider>;

  try {
    return (
      <SafeAreaProvider>
        <ThemeProvider>
          <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
              <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#0A0A0A" }}>
                <KeyboardProvider>
                  <SessionProvider>
                    <AppBootstrap />
                  </SessionProvider>
                </KeyboardProvider>
              </GestureHandlerRootView>
            </QueryClientProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </SafeAreaProvider>
    );
  } catch (error) {
    console.error("[RootLayout] Error:", error);
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: "#0A0A0A", justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "#FFFFFF", textAlign: "center", paddingHorizontal: 16 }}>
            Failed to initialize: {error instanceof Error ? error.message : "Unknown error"}
          </Text>
        </View>
      </SafeAreaProvider>
    );
  }
}
