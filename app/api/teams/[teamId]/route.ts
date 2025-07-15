import { NextRequest } from 'next/server';
import { db } from '@/db';
import { teams, teamMembers, teamInvitations } from '@/db/schema';
import {
  createResponse,
  createErrorResponse,
  getRequestBody,
} from '@/lib/utils';
import { eq, and, isNull } from 'drizzle-orm';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

interface Context {
  params: Promise<{ teamId: string }>;
}

// GET /api/teams/[teamId] - Get team details
export async function GET(request: NextRequest, { params }: Context) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(), // some endpoint might require headers
    });
    const { teamId } = await params;

    if (!session) {
      return createErrorResponse('Not authorized', 401);
    }

    // Check if user is member of the team
    const membership = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.userId, session.user.id),
        eq(teamMembers.teamId, teamId),
      ),
    });

    if (!membership) {
      return createErrorResponse('You do not have access to this team', 403);
    }

    const team = await db.query.teams.findFirst({
      where: eq(teams.id, teamId),
      with: {
        members: {
          with: {
            user: true,
          },
        },
        invitations: {
          where: and(
            isNull(teamInvitations.acceptedAt),
            isNull(teamInvitations.rejectedAt),
          ),
        },
      },
    });

    if (!team) {
      return createErrorResponse('Team not found', 404);
    }

    return createResponse(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    return createErrorResponse('Internal error', 500);
  }
}

// PUT /api/teams/[teamId] - Update team
export async function PUT(request: NextRequest, { params }: Context) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(), // some endpoint might require headers
    });
    const { teamId } = await params;

    if (!session) {
      return createErrorResponse('Not authorized', 401);
    }

    const userId = session.user.id;

    // Check if user is admin of the team
    const membership = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.userId, userId),
        eq(teamMembers.teamId, teamId),
        eq(teamMembers.role, 'admin'),
      ),
    });

    if (!membership) {
      return createErrorResponse('Only admins can update the team', 403);
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
      return createErrorResponse('Team not found', 404);
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
    const session = await auth.api.getSession({
      headers: await headers(), // some endpoint might require headers
    });
    const { teamId } = await params;

    if (!session) {
      return createErrorResponse('Not authorized', 401);
    }

    const userId = session.user.id;

    // Check if user is admin of the team
    const membership = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.userId, userId),
        eq(teamMembers.teamId, teamId),
        eq(teamMembers.role, 'admin'),
      ),
    });

    if (!membership) {
      return createErrorResponse('Only admins can delete the team', 403);
    }

    await db.delete(teams).where(eq(teams.id, teamId));

    return createResponse({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    return createErrorResponse('Internal error', 500);
  }
}
