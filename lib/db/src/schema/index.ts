import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  varchar,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ── Enums ─────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", [
  "member",
  "deacon",
  "elder",
  "pastor",
  "youth_leader",
  "admin",
]);

export const postFlairEnum = pgEnum("post_flair", [
  "announcement",
  "prayer",
  "devotional",
  "testimony",
  "question",
  "discussion",
  "event",
]);

export const meetingStatusEnum = pgEnum("meeting_status", [
  "scheduled",
  "live",
  "ended",
  "cancelled",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "like",
  "comment",
  "follow",
  "mention",
  "meeting_invite",
  "message",
  "prayer_request",
]);

// ── Users ─────────────────────────────────────────────────────────────────────

export const usersTable = pgTable("users", {
  id:           serial("id").primaryKey(),
  username:     varchar("username", { length: 50 }).notNull().unique(),
  email:        varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName:  varchar("display_name", { length: 100 }).notNull(),
  bio:          text("bio"),
  avatarUrl:    text("avatar_url"),
  role:         userRoleEnum("role").default("member").notNull(),
  isVerified:   boolean("is_verified").default(false).notNull(),
  churchBranch: varchar("church_branch", { length: 150 }),
  readingStreak:integer("reading_streak").default(0).notNull(),
  createdAt:    timestamp("created_at").defaultNow().notNull(),
  updatedAt:    timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;

// ── Follows ───────────────────────────────────────────────────────────────────

export const followsTable = pgTable("follows", {
  id:          serial("id").primaryKey(),
  followerId:  integer("follower_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  followingId: integer("following_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
});

export const insertFollowSchema = createInsertSchema(followsTable).omit({ id: true, createdAt: true });
export type InsertFollow = z.infer<typeof insertFollowSchema>;
export type Follow = typeof followsTable.$inferSelect;

// ── Communities ───────────────────────────────────────────────────────────────

export const communitiesTable = pgTable("communities", {
  id:          serial("id").primaryKey(),
  name:        varchar("name", { length: 100 }).notNull(),
  slug:        varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  iconName:    varchar("icon_name", { length: 50 }),
  color:       varchar("color", { length: 7 }),
  bannerUrl:   text("banner_url"),
  memberCount: integer("member_count").default(0).notNull(),
  createdById: integer("created_by_id").references(() => usersTable.id),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
});

export const insertCommunitySchema = createInsertSchema(communitiesTable).omit({ id: true, createdAt: true });
export type InsertCommunity = z.infer<typeof insertCommunitySchema>;
export type Community = typeof communitiesTable.$inferSelect;

// ── Community members ─────────────────────────────────────────────────────────

export const communityMembersTable = pgTable("community_members", {
  id:          serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communitiesTable.id, { onDelete: "cascade" }),
  userId:      integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  joinedAt:    timestamp("joined_at").defaultNow().notNull(),
});

// ── Posts ─────────────────────────────────────────────────────────────────────

export const postsTable = pgTable("posts", {
  id:          serial("id").primaryKey(),
  authorId:    integer("author_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  communityId: integer("community_id").references(() => communitiesTable.id, { onDelete: "set null" }),
  content:     text("content").notNull(),
  flair:       postFlairEnum("flair"),
  imageUrl:    text("image_url"),
  upvotes:     integer("upvotes").default(0).notNull(),
  downvotes:   integer("downvotes").default(0).notNull(),
  commentCount:integer("comment_count").default(0).notNull(),
  isPinned:    boolean("is_pinned").default(false).notNull(),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
  updatedAt:   timestamp("updated_at").defaultNow().notNull(),
});

export const insertPostSchema = createInsertSchema(postsTable).omit({ id: true, createdAt: true, updatedAt: true, upvotes: true, downvotes: true, commentCount: true });
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof postsTable.$inferSelect;

// ── Votes ─────────────────────────────────────────────────────────────────────

export const votesTable = pgTable("votes", {
  id:        serial("id").primaryKey(),
  postId:    integer("post_id").notNull().references(() => postsTable.id, { onDelete: "cascade" }),
  userId:    integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  value:     integer("value").notNull(), // 1 = upvote, -1 = downvote
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Comments ──────────────────────────────────────────────────────────────────

export const commentsTable = pgTable("comments", {
  id:        serial("id").primaryKey(),
  postId:    integer("post_id").notNull().references(() => postsTable.id, { onDelete: "cascade" }),
  authorId:  integer("author_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  parentId:  integer("parent_id"), // for threaded replies
  content:   text("content").notNull(),
  upvotes:   integer("upvotes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCommentSchema = createInsertSchema(commentsTable).omit({ id: true, createdAt: true, updatedAt: true, upvotes: true });
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof commentsTable.$inferSelect;

// ── Saved posts ───────────────────────────────────────────────────────────────

export const savedPostsTable = pgTable("saved_posts", {
  id:        serial("id").primaryKey(),
  userId:    integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  postId:    integer("post_id").notNull().references(() => postsTable.id, { onDelete: "cascade" }),
  savedAt:   timestamp("saved_at").defaultNow().notNull(),
});

// ── Conversations ─────────────────────────────────────────────────────────────

export const conversationsTable = pgTable("conversations", {
  id:          serial("id").primaryKey(),
  isGroup:     boolean("is_group").default(false).notNull(),
  groupName:   varchar("group_name", { length: 100 }),
  groupColor:  varchar("group_color", { length: 7 }),
  createdById: integer("created_by_id").references(() => usersTable.id),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
  updatedAt:   timestamp("updated_at").defaultNow().notNull(),
});

// ── Conversation participants ──────────────────────────────────────────────────

export const conversationParticipantsTable = pgTable("conversation_participants", {
  id:             serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversationsTable.id, { onDelete: "cascade" }),
  userId:         integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  joinedAt:       timestamp("joined_at").defaultNow().notNull(),
  lastReadAt:     timestamp("last_read_at"),
});

// ── Messages ──────────────────────────────────────────────────────────────────

export const messagesTable = pgTable("messages", {
  id:             serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversationsTable.id, { onDelete: "cascade" }),
  senderId:       integer("sender_id").notNull().references(() => usersTable.id, { onDelete: "set null" }),
  content:        text("content").notNull(),
  imageUrl:       text("image_url"),
  isRead:         boolean("is_read").default(false).notNull(),
  createdAt:      timestamp("created_at").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messagesTable).omit({ id: true, createdAt: true });
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messagesTable.$inferSelect;

// ── Meetings ──────────────────────────────────────────────────────────────────

export const meetingsTable = pgTable("meetings", {
  id:             serial("id").primaryKey(),
  title:          varchar("title", { length: 200 }).notNull(),
  description:    text("description"),
  hostId:         integer("host_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  meetingCode:    varchar("meeting_code", { length: 20 }).notNull().unique(),
  passcode:       varchar("passcode", { length: 20 }),
  status:         meetingStatusEnum("status").default("scheduled").notNull(),
  scheduledAt:    timestamp("scheduled_at"),
  startedAt:      timestamp("started_at"),
  endedAt:        timestamp("ended_at"),
  isRecorded:     boolean("is_recorded").default(false).notNull(),
  createdAt:      timestamp("created_at").defaultNow().notNull(),
});

export const insertMeetingSchema = createInsertSchema(meetingsTable).omit({ id: true, createdAt: true });
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type Meeting = typeof meetingsTable.$inferSelect;

// ── Meeting participants ───────────────────────────────────────────────────────

export const meetingParticipantsTable = pgTable("meeting_participants", {
  id:        serial("id").primaryKey(),
  meetingId: integer("meeting_id").notNull().references(() => meetingsTable.id, { onDelete: "cascade" }),
  userId:    integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  isMuted:   boolean("is_muted").default(false).notNull(),
  hasVideo:  boolean("has_video").default(true).notNull(),
  joinedAt:  timestamp("joined_at").defaultNow().notNull(),
  leftAt:    timestamp("left_at"),
});

// ── Church events ─────────────────────────────────────────────────────────────

export const churchEventsTable = pgTable("church_events", {
  id:          serial("id").primaryKey(),
  title:       varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  location:    varchar("location", { length: 255 }),
  startsAt:    timestamp("starts_at").notNull(),
  endsAt:      timestamp("ends_at"),
  color:       varchar("color", { length: 7 }),
  createdById: integer("created_by_id").references(() => usersTable.id),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
});

// ── Notifications ─────────────────────────────────────────────────────────────

export const notificationsTable = pgTable("notifications", {
  id:         serial("id").primaryKey(),
  userId:     integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  actorId:    integer("actor_id").references(() => usersTable.id, { onDelete: "set null" }),
  type:       notificationTypeEnum("type").notNull(),
  postId:     integer("post_id").references(() => postsTable.id, { onDelete: "cascade" }),
  commentId:  integer("comment_id").references(() => commentsTable.id, { onDelete: "cascade" }),
  meetingId:  integer("meeting_id").references(() => meetingsTable.id, { onDelete: "cascade" }),
  isRead:     boolean("is_read").default(false).notNull(),
  createdAt:  timestamp("created_at").defaultNow().notNull(),
});

// ── Stories ───────────────────────────────────────────────────────────────────

export const storiesTable = pgTable("stories", {
  id:         serial("id").primaryKey(),
  authorId:   integer("author_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  mediaUrl:   text("media_url").notNull(),
  caption:    text("caption"),
  expiresAt:  timestamp("expires_at").notNull(),
  viewCount:  integer("view_count").default(0).notNull(),
  createdAt:  timestamp("created_at").defaultNow().notNull(),
});

// ── AI chat history ───────────────────────────────────────────────────────────

export const aiChatsTable = pgTable("ai_chats", {
  id:        serial("id").primaryKey(),
  userId:    integer("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
  role:      varchar("role", { length: 10 }).notNull(), // 'user' | 'ai'
  content:   text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAIChatSchema = createInsertSchema(aiChatsTable).omit({ id: true, createdAt: true });
export type InsertAIChat = z.infer<typeof insertAIChatSchema>;
export type AIChat = typeof aiChatsTable.$inferSelect;
