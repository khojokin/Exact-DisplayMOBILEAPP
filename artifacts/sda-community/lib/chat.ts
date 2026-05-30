import { supabase } from "@/lib/supabase";

export interface ConversationListItem {
  id: string;
  title: string;
  participantIds: string[];
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export async function fetchConversations(userId: string): Promise<ConversationListItem[]> {
  const { data: memberships, error: membershipError } = await supabase
    .from("conversation_participants")
    .select("conversation_id, last_read_at")
    .eq("user_id", userId);

  if (membershipError) throw membershipError;

  const conversationIds = (memberships ?? []).map((row: any) => row.conversation_id).filter(Boolean);
  if (conversationIds.length === 0) return [];

  const { data: conversations, error: conversationError } = await supabase
    .from("conversations")
    .select("id, title, updated_at")
    .in("id", conversationIds)
    .order("updated_at", { ascending: false });

  if (conversationError) throw conversationError;

  const { data: participants, error: participantError } = await supabase
    .from("conversation_participants")
    .select("conversation_id, user_id")
    .in("conversation_id", conversationIds);

  if (participantError) throw participantError;

  const { data: messages, error: messageError } = await supabase
    .from("messages")
    .select("id, conversation_id, sender_id, content, created_at")
    .in("conversation_id", conversationIds)
    .order("created_at", { ascending: false });

  if (messageError) throw messageError;

  const participantMap = new Map<string, string[]>();
  for (const row of participants ?? []) {
    const list = participantMap.get((row as any).conversation_id) ?? [];
    list.push((row as any).user_id);
    participantMap.set((row as any).conversation_id, list);
  }

  const latestMessageMap = new Map<string, any>();
  for (const row of messages ?? []) {
    const cid = (row as any).conversation_id;
    if (!latestMessageMap.has(cid)) latestMessageMap.set(cid, row);
  }

  const unreadMap = new Map<string, number>();
  const lastReadMap = new Map<string, number>();
  for (const membership of memberships ?? []) {
    const conversationId = (membership as any).conversation_id as string;
    const lastReadAt = (membership as any).last_read_at as string | null;
    lastReadMap.set(conversationId, lastReadAt ? new Date(lastReadAt).getTime() : 0);
  }

  for (const row of messages ?? []) {
    const message = row as any;
    if (message.sender_id === userId) continue;
    const conversationId = message.conversation_id as string;
    const lastReadMs = lastReadMap.get(conversationId) ?? 0;
    const messageMs = message.created_at ? new Date(message.created_at).getTime() : 0;
    if (messageMs > lastReadMs) {
      unreadMap.set(conversationId, (unreadMap.get(conversationId) ?? 0) + 1);
    }
  }

  return (conversations ?? []).map((conversation: any) => {
    const latest = latestMessageMap.get(conversation.id);
    return {
      id: conversation.id,
      title: conversation.title ?? "Conversation",
      participantIds: participantMap.get(conversation.id) ?? [],
      lastMessage: latest?.content ?? "No messages yet",
      lastMessageAt: latest?.created_at ?? conversation.updated_at,
      unreadCount: unreadMap.get(conversation.id) ?? 0,
    };
  });
}

export async function fetchUnreadMessageCount(userId: string): Promise<number> {
  const { data: memberships, error: membershipError } = await supabase
    .from("conversation_participants")
    .select("conversation_id, last_read_at")
    .eq("user_id", userId);

  if (membershipError) throw membershipError;

  const conversationIds = (memberships ?? []).map((row: any) => row.conversation_id).filter(Boolean);
  if (conversationIds.length === 0) return 0;

  const { data: messages, error: messageError } = await supabase
    .from("messages")
    .select("conversation_id, sender_id, created_at")
    .in("conversation_id", conversationIds)
    .neq("sender_id", userId);

  if (messageError) throw messageError;

  const lastReadMap = new Map<string, number>();
  for (const membership of memberships ?? []) {
    const conversationId = (membership as any).conversation_id as string;
    const lastReadAt = (membership as any).last_read_at as string | null;
    lastReadMap.set(conversationId, lastReadAt ? new Date(lastReadAt).getTime() : 0);
  }

  let count = 0;
  for (const row of messages ?? []) {
    const message = row as any;
    const lastReadMs = lastReadMap.get(message.conversation_id as string) ?? 0;
    const messageMs = message.created_at ? new Date(message.created_at).getTime() : 0;
    if (messageMs > lastReadMs) count += 1;
  }

  return count;
}

export async function markConversationRead(conversationId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from("conversation_participants")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function fetchConversationMessages(conversationId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("id, conversation_id, sender_id, content, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    content: row.content ?? "",
    createdAt: row.created_at,
  }));
}

export async function sendConversationMessage(input: {
  conversationId: string;
  senderId: string;
  content: string;
}) {
  const { error } = await supabase.from("messages").insert({
    conversation_id: input.conversationId,
    sender_id: input.senderId,
    content: input.content,
  });

  if (error) throw error;

  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", input.conversationId);
}

export async function ensureDirectConversation(userA: string, userB: string): Promise<string> {
  const pair = [userA, userB].sort();

  const { data: candidateMemberships, error: membershipError } = await supabase
    .from("conversation_participants")
    .select("conversation_id, user_id")
    .in("user_id", pair);

  if (membershipError) throw membershipError;

  const bucket = new Map<string, Set<string>>();
  for (const row of candidateMemberships ?? []) {
    const cid = (row as any).conversation_id;
    const uid = (row as any).user_id;
    const set = bucket.get(cid) ?? new Set<string>();
    set.add(uid);
    bucket.set(cid, set);
  }

  for (const [conversationId, users] of bucket) {
    if (users.has(pair[0]) && users.has(pair[1]) && users.size === 2) {
      return conversationId;
    }
  }

  const { data: created, error: createError } = await supabase
    .from("conversations")
    .insert({ title: "Direct message", is_group: false })
    .select("id")
    .single();

  if (createError) throw createError;

  const conversationId = (created as any).id as string;

  const { error: participantInsertError } = await supabase
    .from("conversation_participants")
    .insert([
      { conversation_id: conversationId, user_id: userA },
      { conversation_id: conversationId, user_id: userB },
    ]);

  if (participantInsertError) throw participantInsertError;

  return conversationId;
}
