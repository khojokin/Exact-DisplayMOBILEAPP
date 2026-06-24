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

    upsertProfile({
      id: user.id,
      fullName,
      username,
      avatarUrl,
    })
      .then(() => {
        syncedUserId.current = user.id;
      })
      .catch((error) => {
        if (__DEV__) {
          console.warn("[profile-sync] upsert failed", error);
        }
      });
  }, [isLoaded, isSignedIn, user?.id, user?.fullName, user?.firstName, user?.username, user?.imageUrl]);
}
