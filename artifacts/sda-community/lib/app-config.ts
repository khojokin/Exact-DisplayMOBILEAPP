import { supabase } from "@/lib/supabase";

export interface AppConfigRow {
  key: string;
  value: unknown;
  description: string | null;
  category: string;
  updatedAt: string;
}

export async function fetchAllConfig(): Promise<AppConfigRow[]> {
  const { data, error } = await supabase
    .from("app_config")
    .select("key, value, description, category, updated_at")
    .order("category", { ascending: true })
    .order("key", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    key: row.key,
    value: row.value,
    description: row.description ?? null,
    category: row.category ?? "general",
    updatedAt: row.updated_at,
  }));
}

export async function fetchConfigValue<T = unknown>(key: string): Promise<T | undefined> {
  const { data, error } = await supabase
    .from("app_config")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error) return undefined;
  return (data as { value?: T } | null)?.value;
}

export async function updateConfigValue(input: {
  key: string;
  value: unknown;
  updatedBy?: string;
}): Promise<void> {
  const { error } = await supabase
    .from("app_config")
    .update({ value: input.value, updated_by: input.updatedBy ?? null })
    .eq("key", input.key);

  if (error) throw error;
}
