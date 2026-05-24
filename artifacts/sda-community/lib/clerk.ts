import * as SecureStore from "expo-secure-store";
import type { TokenCache } from "@clerk/clerk-expo";

export const CLERK_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ??
  "pk_live_Y2xlcmsuc2V2ZW50aGRheWFkdmVudGlzdC5vbmxpbmUk";

export const tokenCache: TokenCache = {
  async getToken(key) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key, token) {
    try {
      await SecureStore.setItemAsync(key, token);
    } catch {
      // Ignore token cache errors so auth still boots.
    }
  },
  async clearToken(key) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Ignore token cache errors so auth still boots.
    }
  },
};