import { NextRequest } from 'next/server';
import { db } from '@/db';
import { teamMembers } from '@/db/schema';
import { createResponse, createErrorResponse } from '@/lib/utils';
import { eq, and } from 'drizzle-orm';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

interface Context {
  params: Promise<{ teamId: string }>;
}

// POST /api/teams/[teamId]/leave - Leave team
export async function POST(request: NextRequest, { params }: Context) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const { teamId } = await params;

    if (!session) {
      return createErrorResponse('No autorizado', 401);
    }

    const userId = session.user.id;

    // Check if user is member of the team
    const membership = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.userId, userId),
        eq(teamMembers.teamId, teamId),
      ),
    });

    if (!membership) {
      return createErrorResponse('You are not a member of this team', 403);
    }

    // If user is admin, check if they are the last admin
    if (membership.role === 'admin') {
      const adminMembers = await db.query.teamMembers.findMany({
        where: and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.role, 'admin'),
        ),
      });

      if (adminMembers.length <= 1) {
        return createErrorResponse(
          'You cannot leave the team as the last admin',
          400,
        );
      }
    }

    // Remove user from team
    await db
      .delete(teamMembers)
      .where(
        and(eq(teamMembers.userId, userId), eq(teamMembers.teamId, teamId)),
      );

    return createResponse({
      message: 'You have left the team successfully',
    });
  } catch (error) {
    console.error('Error leaving team:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
