import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js/dist/module/index.js";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";
const HAS_SUPABASE_CONFIG = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Avoid crashing the app during startup when environment values are missing.
const SAFE_SUPABASE_URL = HAS_SUPABASE_CONFIG
  ? SUPABASE_URL
  : "https://placeholder.supabase.co";
const SAFE_SUPABASE_ANON_KEY = HAS_SUPABASE_CONFIG
  ? SUPABASE_ANON_KEY
  : "placeholder-anon-key";

if (!HAS_SUPABASE_CONFIG) {
  console.warn(
    "[supabase] EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY is missing. Supabase calls will fail until configured."
  );
}

export const supabase = createClient(SAFE_SUPABASE_URL, SAFE_SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type SubscriptionPlan = "free" | "plus" | "premium";

export interface UserSubscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: "active" | "canceled" | "past_due" | "incomplete" | "trialing" | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) return null;
  return data as UserSubscription;
}

export async function upsertSubscription(row: Partial<UserSubscription>) {
  const { error } = await supabase.from("subscriptions").upsert(row, { onConflict: "user_id" });
  if (error) throw error;
}
