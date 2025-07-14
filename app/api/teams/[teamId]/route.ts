import { NextRequest } from 'next/server';
import { db } from '@/db';
import { teams, teamMembers } from '@/db/schema';
import {
  createResponse,
  createErrorResponse,
  getRequestBody,
} from '@/lib/utils';
import { eq, and } from 'drizzle-orm';

interface Context {
  params: { teamId: string };
}

// GET /api/teams/[teamId] - Get team details
export async function GET(request: NextRequest, { params }: Context) {
  try {
    const userId = request.headers.get('x-user-id');
    const { teamId } = params;

    if (!userId) {
      return createErrorResponse('No autorizado', 401);
    }

    // Check if user is member of the team
    const membership = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.userId, userId),
        eq(teamMembers.teamId, teamId),
      ),
    });

    if (!membership) {
      return createErrorResponse('No tienes acceso a este equipo', 403);
    }

    const team = await db.query.teams.findFirst({
      where: eq(teams.id, teamId),
      with: {
        members: {
          with: {
            user: true,
          },
        },
      },
    });

    if (!team) {
      return createErrorResponse('Equipo no encontrado', 404);
    }

    return createResponse(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    return createErrorResponse('Error interno del servidor', 500);
  }
}

// PUT /api/teams/[teamId] - Update team
export async function PUT(request: NextRequest, { params }: Context) {
  try {
    const userId = request.headers.get('x-user-id');
    const { teamId } = params;

    if (!userId) {
      return createErrorResponse('No autorizado', 401);
    }

    // Check if user is admin of the team
    const membership = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.userId, userId),
        eq(teamMembers.teamId, teamId),
        eq(teamMembers.role, 'admin'),
      ),
    });

    if (!membership) {
      return createErrorResponse(
        'Solo los administradores pueden actualizar el equipo',
        403,
      );
    }

    const body = await getRequestBody(request);
    const { name, description } = body;

    const [updatedTeam] = await db
      .update(teams)
      .set({
        name,
        description,
        updatedAt: new Date(),
      })
      .where(eq(teams.id, teamId))
      .returning();

    if (!updatedTeam) {
      return createErrorResponse('Equipo no encontrado', 404);
    }

    return createResponse(updatedTeam);
  } catch (error) {
    console.error('Error updating team:', error);
    return createErrorResponse('Error interno del servidor', 500);
  }
}

// DELETE /api/teams/[teamId] - Delete team
export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    const userId = request.headers.get('x-user-id');
    const { teamId } = params;

    if (!userId) {
      return createErrorResponse('No autorizado', 401);
    }

    // Check if user is admin of the team
    const membership = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.userId, userId),
        eq(teamMembers.teamId, teamId),
        eq(teamMembers.role, 'admin'),
      ),
    });

    if (!membership) {
      return createErrorResponse(
        'Solo los administradores pueden eliminar el equipo',
        403,
      );
    }

    await db.delete(teams).where(eq(teams.id, teamId));

    return createResponse({ message: 'Equipo eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting team:', error);
    return createErrorResponse('Error interno del servidor', 500);
  }
}
