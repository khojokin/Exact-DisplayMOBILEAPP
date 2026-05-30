import { Platform } from "react-native";

function getAdminApiBase(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN ?? "";
  if (domain) {
    return `https://${domain}:3003`;
  }
  if (Platform.OS === "web" && typeof window !== "undefined") {
    const origin = window.location.origin;
    return origin.replace(/:5000$/, ":3003").replace(/:80$/, ":3003");
  }
  return "http://localhost:3000";
}

export interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  activeAnnouncements: number;
  recentUsers: { id: number; displayName: string; username: string; role: string; createdAt: string }[];
  recentPosts: { id: number; content: string; createdAt: string; authorId: number }[];
}

export interface Announcement {
  id: number;
  title: string;
  body: string;
  createdById: string | null;
  isActive: boolean;
  isPinned: boolean;
  createdAt: string;
}

export interface AdminUser {
  id: number;
  username: string;
  displayName: string;
  email: string;
  role: string;
  isVerified: boolean;
  churchBranch: string | null;
  createdAt: string;
}

export interface ActivityEntry {
  id: number;
  actorId: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  metadata: string | null;
  createdAt: string;
}

async function apiFetch(path: string, init?: RequestInit) {
  const base = getAdminApiBase();
  const res = await fetch(`${base}/api${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchAdminStats(): Promise<AdminStats> {
  return apiFetch("/admin/stats");
}

export async function fetchAnnouncements(): Promise<Announcement[]> {
  return apiFetch("/admin/announcements");
}

export async function createAnnouncement(data: {
  title: string;
  body: string;
  createdById?: string;
  isPinned?: boolean;
}): Promise<Announcement> {
  return apiFetch("/admin/announcements", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteAnnouncement(id: number): Promise<void> {
  await apiFetch(`/admin/announcements/${id}`, { method: "DELETE" });
}

export async function fetchAdminActivity(): Promise<ActivityEntry[]> {
  return apiFetch("/admin/activity");
}

export async function fetchAdminUsers(opts?: { limit?: number; offset?: number }): Promise<{ users: AdminUser[]; total: number }> {
  const params = new URLSearchParams();
  if (opts?.limit) params.set("limit", String(opts.limit));
  if (opts?.offset) params.set("offset", String(opts.offset));
  return apiFetch(`/admin/users?${params}`);
}

export async function updateUserRole(id: number, role: string): Promise<void> {
  await apiFetch(`/admin/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}
