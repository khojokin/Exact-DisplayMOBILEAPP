import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface SessionUser {
  id: string;
  fullName: string;
  username?: string;
  imageUrl?: string;
  primaryEmailAddress?: { emailAddress: string } | null;
  firstName?: string;
}

interface SessionState {
  user: SessionUser | null;
  isLoaded: boolean;
}

interface SessionContextValue extends SessionState {
  userId: string | null;
  isSignedIn: boolean;
  resetSession: () => Promise<void>;
  updateSession: (
    patch: Partial<Pick<SessionUser, "fullName" | "username" | "imageUrl" | "firstName">>
  ) => Promise<void>;
}

const SESSION_STORAGE_KEY = "sda-community:session";

const SessionContext = createContext<SessionContextValue | null>(null);

function createGuestId() {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `guest-${Date.now().toString(36)}-${randomPart}`;
}

function createDefaultUser(id = createGuestId()): SessionUser {
  return {
    id,
    fullName: "Guest Member",
    username: "guest",
    imageUrl: undefined,
    primaryEmailAddress: null,
    firstName: "Guest",
  };
}

function normalizeUser(input: Partial<SessionUser> | null | undefined): SessionUser {
  const fallback = createDefaultUser(input?.id ?? undefined);
  return {
    ...fallback,
    ...input,
    id: input?.id?.trim() || fallback.id,
    fullName: input?.fullName?.trim() || fallback.fullName,
    username: input?.username?.trim() || fallback.username,
    imageUrl: input?.imageUrl || undefined,
    firstName: input?.firstName?.trim() || fallback.firstName,
    primaryEmailAddress: input?.primaryEmailAddress?.emailAddress
      ? { emailAddress: input.primaryEmailAddress.emailAddress }
      : null,
  };
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SessionState>({
    user: null,
    isLoaded: false,
  });

  const persistUser = useCallback(async (nextUser: SessionUser) => {
    setState({ user: nextUser, isLoaded: true });
    await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextUser));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const stored = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
        if (cancelled) return;

        if (stored) {
          const parsed = JSON.parse(stored) as Partial<SessionUser>;
          const nextUser = normalizeUser(parsed);
          setState({ user: nextUser, isLoaded: true });
          await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextUser));
          return;
        }

        const nextUser = createDefaultUser();
        setState({ user: nextUser, isLoaded: true });
        await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextUser));
      } catch {
        if (cancelled) return;
        const nextUser = createDefaultUser();
        setState({ user: nextUser, isLoaded: true });
        await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextUser));
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const resetSession = useCallback(async () => {
    const nextUser = createDefaultUser();
    await persistUser(nextUser);
  }, [persistUser]);

  const updateSession = useCallback(
    async (patch: Partial<Pick<SessionUser, "fullName" | "username" | "imageUrl" | "firstName">>) => {
      const current = state.user ?? createDefaultUser();
      const nextUser = normalizeUser({ ...current, ...patch });
      await persistUser(nextUser);
    },
    [persistUser, state.user]
  );

  const value = useMemo<SessionContextValue>(
    () => ({
      user: state.user,
      userId: state.user?.id ?? null,
      isLoaded: state.isLoaded,
      isSignedIn: state.isLoaded,
      resetSession,
      updateSession,
    }),
    [resetSession, state.isLoaded, state.user, updateSession]
  );

  return React.createElement(SessionContext.Provider, { value }, children);
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}