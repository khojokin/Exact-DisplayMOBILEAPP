import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@clerk/clerk-expo";

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  const [authTimedOut, setAuthTimedOut] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setAuthTimedOut(true), 3000);
    return () => clearTimeout(timeout);
  }, []);

  if (!isLoaded && !authTimedOut) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0A0A0A",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="small" color="#FFFFFF" />
      </View>
    );
  }

  if (!isLoaded) {
    return <Redirect href="/signin" />;
  }

  return <Redirect href={isSignedIn ? "/(tabs)" : "/signin"} />;
}
