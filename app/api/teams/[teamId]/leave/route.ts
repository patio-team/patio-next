import { NextRequest } from "next/server";
import { db } from "@/db";
import { teamMembers } from "@/db/schema";
import { createResponse, createErrorResponse } from "@/lib/utils";
import { eq, and } from "drizzle-orm";

interface Context {
  params: { teamId: string };
}

// POST /api/teams/[teamId]/leave - Leave team
export async function POST(request: NextRequest, { params }: Context) {
  try {
    const userId = request.headers.get("x-user-id");
    const { teamId } = params;

    if (!userId) {
      return createErrorResponse("No autorizado", 401);
    }

    // Check if user is member of the team
    const membership = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.userId, userId),
        eq(teamMembers.teamId, teamId)
      ),
    });

    if (!membership) {
      return createErrorResponse("No eres miembro de este equipo", 403);
    }

    // Remove user from team
    await db
      .delete(teamMembers)
      .where(
        and(eq(teamMembers.userId, userId), eq(teamMembers.teamId, teamId))
      );

    return createResponse({
      message: "Has abandonado el equipo correctamente",
    });
  } catch (error) {
    console.error("Error leaving team:", error);
    return createErrorResponse("Error interno del servidor", 500);
  }
}
