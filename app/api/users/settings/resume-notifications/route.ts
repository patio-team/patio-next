import { NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createResponse, createErrorResponse } from "@/lib/utils";
import { eq } from "drizzle-orm";

// POST /api/users/settings/resume-notifications - Resume notifications
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return createErrorResponse("No autorizado", 401);
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        notificationsPaused: false,
        pauseReason: null,
        pausedUntil: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      return createErrorResponse("Usuario no encontrado", 404);
    }

    return createResponse({
      message: "Notificaciones reanudadas correctamente",
    });
  } catch (error) {
    console.error("Error resuming notifications:", error);
    return createErrorResponse("Error interno del servidor", 500);
  }
}
