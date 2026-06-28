import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { View } from "react-native";

export default function Index() {
  const skipAuth = process.env.EXPO_PUBLIC_SKIP_AUTH === "true";
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded && !skipAuth) return <View style={{ flex: 1, backgroundColor: "#0A0A0A" }} />;
  
  // Skip auth check if EXPO_PUBLIC_SKIP_AUTH is enabled
  if (skipAuth) {
    return <Redirect href="/(tabs)" />;
  }
  
  return <Redirect href={isSignedIn ? "/(tabs)" : "/signin"} />;
}
