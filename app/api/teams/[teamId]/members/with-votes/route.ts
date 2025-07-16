import { NextRequest } from 'next/server';
import { db } from '@/db';
import { teamMembers } from '@/db/schema';
import { createResponse, createErrorResponse } from '@/lib/utils';
import { eq, and } from 'drizzle-orm';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getTeamMembersWithLastVote } from '@/db/team';

interface Context {
  params: Promise<{ teamId: string }>;
}

// GET /api/teams/[teamId]/members/with-votes - Get team members with their last vote
export async function GET(request: NextRequest, { params }: Context) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const { teamId } = await params;

    if (!session) {
      return createErrorResponse('Not authorized', 401);
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
      return createErrorResponse('You do not have access to this team', 403);
    }

    const membersWithVotes = await getTeamMembersWithLastVote(teamId);

    return createResponse(membersWithVotes);
  } catch (error) {
    console.error('Error fetching team members with votes:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
