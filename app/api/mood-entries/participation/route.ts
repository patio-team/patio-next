import { NextRequest } from 'next/server';
import { db } from '@/db';
import { teamMembers } from '@/db/schema';
import { createResponse, createErrorResponse } from '@/lib/utils';
import { eq, and } from 'drizzle-orm';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { participationStats } from '@/db/team';
import { DateTime } from 'luxon';

// GET /api/mood-entries/participation - Get average participation stats for a team within a date range
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return createErrorResponse('Not authorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!teamId) {
      return createErrorResponse('Team ID is required', 400);
    }

    if (!startDate || !endDate) {
      return createErrorResponse(
        'Start date and end date are required (YYYY-MM-DD)',
        400,
      );
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

    const startDateObj = DateTime.fromISO(startDate);
    const endDateObj = DateTime.fromISO(endDate);

    // Validate date range
    if (startDateObj >= endDateObj) {
      return createErrorResponse('Start date must be before end date', 400);
    }

    const stats = await participationStats(
      teamId,
      startDateObj.toJSDate(),
      endDateObj.toJSDate(),
    );

    return createResponse(stats);
  } catch (error) {
    console.error('Error fetching participation stats:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
