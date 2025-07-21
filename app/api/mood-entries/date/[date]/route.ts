import { NextRequest } from 'next/server';
import { db } from '@/db';
import { teamMembers } from '@/db/schema';
import { createResponse, createErrorResponse } from '@/lib/utils';
import { eq, and } from 'drizzle-orm';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getMoodEntries } from '@/db/mood-entries';
import { DateTime } from 'luxon';

// GET /api/mood-entries/date/[date] - Get mood entries for a specific date
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return createErrorResponse('Not authorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return createErrorResponse('Team ID is required', 400);
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
    const dateParam = (await params).date;
    // Parse and validate the date
    const targetDate = DateTime.fromISO(dateParam);

    // Get entries for the specified date
    const entries = await getMoodEntries(
      targetDate.toJSDate(),
      targetDate.plus({ days: 1 }).toJSDate(),
      teamId,
      membership.role === 'admin' ? undefined : 'public',
    );

    return createResponse(entries);
  } catch (error) {
    console.error('Error fetching mood entries for date:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
