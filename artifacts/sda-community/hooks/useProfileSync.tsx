import { useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-expo";
import { upsertProfile } from "@/lib/profiles";

// Mirrors the signed-in Clerk user into the Supabase `profiles` table.
// Runs once per Clerk userId per app session.
export function useProfileSync() {
  const { user, isLoaded, isSignedIn } = useUser();
  const SKIP_CLERK = (process?.env?.EXPO_PUBLIC_SKIP_CLERK === "1") || (process?.env?.SKIP_CLERK === "1");
  const syncedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (SKIP_CLERK) return; // Don't try to sync profiles when Clerk is disabled for FT/testing
    if (!isLoaded || !isSignedIn || !user?.id) return;
    if (syncedUserId.current === user.id) return;

    const fullName = user.fullName?.trim() || user.firstName?.trim() || null;
    const username = user.username?.trim() || null;
    const avatarUrl = user.imageUrl || null;

    let timeout: ReturnType<typeof setTimeout> | null = null;
    
    Promise.race([
      upsertProfile({
        id: user.id,
        fullName,
        username,
        avatarUrl,
      }),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error("Profile sync timeout")), 10000);
      }),
    ])
      .then(() => {
        syncedUserId.current = user.id;
        console.log("[profile-sync] success for user", user.id);
      })
      .catch((error) => {
        console.warn("[profile-sync] error:", error?.message || error);
        // Mark as synced anyway to prevent retries
        syncedUserId.current = user.id;
      })
      .finally(() => {
        if (timeout !== null) {
          clearTimeout(timeout);
        }
      });
  }, [isLoaded, isSignedIn, user?.id, user?.fullName, user?.firstName, user?.username, user?.imageUrl]);
}
