import { NextRequest } from 'next/server';
import { db } from '@/db';
import { teamMembers } from '@/db/schema';
import {
  createResponse,
  createErrorResponse,
  getTodayInTimezone,
} from '@/lib/utils';
import { eq, and } from 'drizzle-orm';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getMoodEntries } from '@/db/mood-entries';

// GET /api/mood-entries/today - Get today's mood entries for a team
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

    // Get today's date range in the configured timezone
    const today = getTodayInTimezone();

    const entries = await getMoodEntries(
      today,
      today.plus({ days: 1 }),
      teamId,
      membership.role === 'admin' ? undefined : 'public',
    );

    return createResponse(entries);
  } catch (error) {
    console.error("Error fetching today's mood entries:", error);
    return createErrorResponse('Internal server error', 500);
  }
}
