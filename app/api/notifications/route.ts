import { NextRequest } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import {
  createResponse,
  createErrorResponse,
  getRequestBody,
} from "@/lib/utils";
import { eq, and, desc } from "drizzle-orm";

// GET /api/notifications - Get user notifications
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    if (!userId) {
      return createErrorResponse("No autorizado", 401);
    }

    const whereConditions = [eq(notifications.userId, userId)];

    if (unreadOnly) {
      whereConditions.push(eq(notifications.isRead, false));
    }

    const userNotifications = await db.query.notifications.findMany({
      where: and(...whereConditions),
      orderBy: [desc(notifications.createdAt)],
      limit,
      offset,
    });

    return createResponse(userNotifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return createErrorResponse("Error interno del servidor", 500);
  }
}

// PUT /api/notifications - Mark notifications as read
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return createErrorResponse("No autorizado", 401);
    }

    const body = await getRequestBody(request);
    const { notificationIds, markAllAsRead = false } = body;

    if (markAllAsRead) {
      // Mark all notifications as read for this user
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.userId, userId));

      return createResponse({
        message: "Todas las notificaciones marcadas como leídas",
      });
    }

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return createErrorResponse("IDs de notificaciones requeridos", 400);
    }

    // Mark specific notifications as read
    const updatePromises = notificationIds.map((id: string) =>
      db
        .update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
    );

    await Promise.all(updatePromises);

    return createResponse({ message: "Notificaciones marcadas como leídas" });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return createErrorResponse("Error interno del servidor", 500);
  }
}

// DELETE /api/notifications - Delete notifications
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return createErrorResponse("No autorizado", 401);
    }

    const body = await getRequestBody(request);
    const { notificationIds, deleteAll = false } = body;

    if (deleteAll) {
      // Delete all notifications for this user
      await db.delete(notifications).where(eq(notifications.userId, userId));

      return createResponse({ message: "Todas las notificaciones eliminadas" });
    }

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return createErrorResponse("IDs de notificaciones requeridos", 400);
    }

    // Delete specific notifications
    const deletePromises = notificationIds.map((id: string) =>
      db
        .delete(notifications)
        .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
    );

    await Promise.all(deletePromises);

    return createResponse({ message: "Notificaciones eliminadas" });
  } catch (error) {
    console.error("Error deleting notifications:", error);
    return createErrorResponse("Error interno del servidor", 500);
  }
}
