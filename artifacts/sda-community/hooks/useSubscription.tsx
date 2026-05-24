import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase, type SubscriptionPlan, type UserSubscription } from "@/lib/supabase";

interface SubscriptionState {
  plan: SubscriptionPlan;
  privacyMode: boolean;
  readReceipts: boolean;
}

interface SubscriptionContextValue extends SubscriptionState {
  ready: boolean;
  setPlan: (plan: SubscriptionPlan) => Promise<void>;
  setPrivacyMode: (enabled: boolean) => Promise<void>;
  setReadReceipts: (enabled: boolean) => Promise<void>;
  isPremium: boolean;
  isPlus: boolean;
  syncFromSupabase: (userId: string) => Promise<void>;
}

const STORAGE_KEY = "sda-community.subscription.state.v1";

const defaultState: SubscriptionState = {
  plan: "free",
  privacyMode: false,
  readReceipts: true,
};

const SubscriptionContext = createContext<SubscriptionContextValue>({
  ...defaultState,
  ready: false,
  setPlan: async () => {},
  setPrivacyMode: async () => {},
  setReadReceipts: async () => {},
  isPremium: false,
  isPlus: false,
  syncFromSupabase: async () => {},
});

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SubscriptionState>(defaultState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as Partial<SubscriptionState>;
        if (!mounted) return;
        setState((prev) => ({
          ...prev,
          ...parsed,
          plan: parsed.plan === "plus" || parsed.plan === "premium" ? parsed.plan : "free",
          privacyMode: Boolean(parsed.privacyMode),
          readReceipts: parsed.readReceipts === false ? false : true,
        }));
      } catch {
        // ignore corrupted local storage and continue with defaults
      } finally {
        if (mounted) setReady(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  async function persist(next: SubscriptionState) {
    setState(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  async function setPlan(plan: SubscriptionPlan) {
    const normalizedPlan: SubscriptionPlan = plan === "plus" || plan === "premium" ? plan : "free";
    const next: SubscriptionState = {
      ...state,
      plan: normalizedPlan,
      privacyMode: normalizedPlan === "premium" ? state.privacyMode : false,
      readReceipts: normalizedPlan === "premium" ? state.readReceipts : true,
    };
    await persist(next);
  }

  async function setPrivacyMode(enabled: boolean) {
    const next: SubscriptionState = { ...state, privacyMode: enabled };
    await persist(next);
  }

  async function setReadReceipts(enabled: boolean) {
    const next: SubscriptionState = { ...state, readReceipts: enabled };
    await persist(next);
  }

  async function syncFromSupabase(userId: string) {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (error || !data) return;
    const row = data as UserSubscription;
    const plan: SubscriptionPlan =
      row.plan === "plus" || row.plan === "premium" ? row.plan : "free";
    const next: SubscriptionState = {
      ...state,
      plan,
      privacyMode: plan === "premium" ? state.privacyMode : false,
      readReceipts: plan === "premium" ? state.readReceipts : true,
    };
    await persist(next);
  }

  const value = useMemo<SubscriptionContextValue>(
    () => ({
      ...state,
      ready,
      setPlan,
      setPrivacyMode,
      setReadReceipts,
      isPremium: state.plan === "premium",
      isPlus: state.plan === "plus" || state.plan === "premium",
      syncFromSupabase,
    }),
    [ready, state]
  );

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}
