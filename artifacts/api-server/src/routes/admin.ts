import { Router } from "express";
import { db } from "@workspace/db";
import {
  announcementsTable,
  activityLogTable,
  usersTable,
  postsTable,
  commentsTable,
} from "@workspace/db/schema";
import { desc, count, eq, sql } from "drizzle-orm";
import { logger } from "../lib/logger";

const adminRouter = Router();

adminRouter.get("/admin/stats", async (_req, res) => {
  try {
    const [userCount, postCount, commentCount, announcementCount] =
      await Promise.all([
        db.select({ value: count() }).from(usersTable),
        db.select({ value: count() }).from(postsTable),
        db.select({ value: count() }).from(commentsTable),
        db
          .select({ value: count() })
          .from(announcementsTable)
          .where(eq(announcementsTable.isActive, true)),
      ]);

    const recentUsers = await db
      .select({
        id: usersTable.id,
        displayName: usersTable.displayName,
        username: usersTable.username,
        role: usersTable.role,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .orderBy(desc(usersTable.createdAt))
      .limit(5);

    const recentPosts = await db
      .select({
        id: postsTable.id,
        content: postsTable.content,
        createdAt: postsTable.createdAt,
        authorId: postsTable.authorId,
      })
      .from(postsTable)
      .orderBy(desc(postsTable.createdAt))
      .limit(5);

    res.json({
      totalUsers: userCount[0]?.value ?? 0,
      totalPosts: postCount[0]?.value ?? 0,
      totalComments: commentCount[0]?.value ?? 0,
      activeAnnouncements: announcementCount[0]?.value ?? 0,
      recentUsers,
      recentPosts,
    });
  } catch (err) {
    logger.error({ err }, "admin/stats failed");
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

adminRouter.get("/admin/announcements", async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(announcementsTable)
      .orderBy(desc(announcementsTable.createdAt))
      .limit(50);
    res.json(rows);
  } catch (err) {
    logger.error({ err }, "admin/announcements GET failed");
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});

adminRouter.post("/admin/announcements", async (req, res): Promise<void> => {
  const { title, body, createdById, isPinned } = req.body as {
    title?: unknown;
    body?: unknown;
    createdById?: unknown;
    isPinned?: unknown;
  };

  if (typeof title !== "string" || !title.trim()) {
    res.status(400).json({ error: "title is required" });
    return;
  }
  if (typeof body !== "string" || !body.trim()) {
    res.status(400).json({ error: "body is required" });
    return;
  }

  try {
    const [row] = await db
      .insert(announcementsTable)
      .values({
        title: title.trim(),
        body: body.trim(),
        createdById: typeof createdById === "string" ? createdById : null,
        isPinned: isPinned === true,
      })
      .returning();

    await db.insert(activityLogTable).values({
      actorId: typeof createdById === "string" ? createdById : null,
      action: "announcement_created",
      targetType: "announcement",
      targetId: String(row.id),
      metadata: JSON.stringify({ title: row.title }),
    });

    res.json(row);
  } catch (err) {
    logger.error({ err }, "admin/announcements POST failed");
    res.status(500).json({ error: "Failed to create announcement" });
  }
});

adminRouter.delete("/admin/announcements/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "invalid id" });
    return;
  }

  try {
    await db
      .delete(announcementsTable)
      .where(eq(announcementsTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    logger.error({ err }, "admin/announcements DELETE failed");
    res.status(500).json({ error: "Failed to delete announcement" });
  }
});

adminRouter.get("/admin/activity", async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(activityLogTable)
      .orderBy(desc(activityLogTable.createdAt))
      .limit(100);
    res.json(rows);
  } catch (err) {
    logger.error({ err }, "admin/activity GET failed");
    res.status(500).json({ error: "Failed to fetch activity log" });
  }
});

adminRouter.get("/admin/users", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const offset = Number(req.query.offset) || 0;

  try {
    const rows = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        displayName: usersTable.displayName,
        email: usersTable.email,
        role: usersTable.role,
        isVerified: usersTable.isVerified,
        churchBranch: usersTable.churchBranch,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .orderBy(desc(usersTable.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ value: total }] = await db.select({ value: count() }).from(usersTable);

    res.json({ users: rows, total });
  } catch (err) {
    logger.error({ err }, "admin/users GET failed");
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

adminRouter.patch("/admin/users/:id/role", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const { role } = req.body as { role?: unknown };

  const VALID_ROLES = ["member", "deacon", "elder", "pastor", "youth_leader", "admin"] as const;
  if (!VALID_ROLES.includes(role as any)) {
    res.status(400).json({ error: "invalid role" });
    return;
  }

  try {
    await db
      .update(usersTable)
      .set({ role: role as any })
      .where(eq(usersTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    logger.error({ err }, "admin/users/:id/role PATCH failed");
    res.status(500).json({ error: "Failed to update role" });
  }
});

export default adminRouter;
