import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { View } from "react-native";

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return <View style={{ flex: 1, backgroundColor: "#0A0A0A" }} />;
  return <Redirect href={isSignedIn ? "/(tabs)" : "/signin"} />;
}
