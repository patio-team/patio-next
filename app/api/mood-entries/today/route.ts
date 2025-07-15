import { NextRequest } from 'next/server';
import { db } from '@/db';
import { moodEntries, teamMembers } from '@/db/schema';
import {
  createResponse,
  createErrorResponse,
  getTodayInTimezone,
  getParticipationStats,
  formatDateForDB,
} from '@/lib/utils';
import { eq, and, gte, lt, count } from 'drizzle-orm';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

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
    const startOfDay = formatDateForDB(today);
    const endOfDay = formatDateForDB(today.plus({ days: 1 }));

    // Get today's entries
    const entries = await db.query.moodEntries.findMany({
      where: and(
        eq(moodEntries.teamId, teamId),
        gte(moodEntries.entryDate, startOfDay),
        lt(moodEntries.entryDate, endOfDay),
      ),
      with: {
        user: true,
        mentions: {
          with: {
            mentionedUser: true,
          },
        },
      },
      orderBy: [moodEntries.createdAt],
    });

    // Get total team members count
    const totalMembersResult = await db
      .select({ count: count() })
      .from(teamMembers)
      .where(eq(teamMembers.teamId, teamId));

    const totalMembers = totalMembersResult[0]?.count || 0;

    // Hide user info for anonymous entries
    const processedEntries = entries.map((entry) => ({
      ...entry,
      user: entry.visibility === 'private' ? null : entry.user,
    }));

    // Get participation stats
    const stats = getParticipationStats(entries, totalMembers);

    return createResponse({
      date: today.toISODate(),
      entries: processedEntries,
      stats,
    });
  } catch (error) {
    console.error("Error fetching today's mood entries:", error);
    return createErrorResponse('Internal server error', 500);
  }
}
