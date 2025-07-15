import { NextRequest } from 'next/server';
import { db } from '@/db';
import { moodEntries, teamMembers } from '@/db/schema';
import {
  createResponse,
  createErrorResponse,
  getDateInTimezone,
  getParticipationStats,
  formatDateForDB,
} from '@/lib/utils';
import { eq, and, gte, lt, count } from 'drizzle-orm';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

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
    let targetDate;
    try {
      targetDate = getDateInTimezone(dateParam);
    } catch {
      return createErrorResponse('Invalid date format. Use YYYY-MM-DD', 400);
    }

    // Get date range for the specified day
    const startOfDay = formatDateForDB(targetDate);
    const endOfDay = formatDateForDB(targetDate.plus({ days: 1 }));

    // Get entries for the specified date
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

    // Get 2-week historical participation data for comparison
    const twoWeeksAgo = targetDate.minus({ weeks: 2 });
    const twoWeeksAgoDate = formatDateForDB(twoWeeksAgo);

    const historicalEntries = await db.query.moodEntries.findMany({
      where: and(
        eq(moodEntries.teamId, teamId),
        gte(moodEntries.entryDate, twoWeeksAgoDate),
        lt(moodEntries.entryDate, startOfDay),
      ),
      columns: {
        userId: true,
        entryDate: true,
      },
    });

    // Calculate average participation over the last 2 weeks
    const dailyParticipation: Record<string, Set<string>> = {};
    historicalEntries.forEach((entry) => {
      const dateKey = entry.entryDate.toISOString().split('T')[0];
      if (!dailyParticipation[dateKey]) {
        dailyParticipation[dateKey] = new Set();
      }
      dailyParticipation[dateKey].add(entry.userId);
    });

    const dailyParticipationCounts = Object.values(dailyParticipation).map(
      (participants) => participants.size,
    );

    const averageParticipation =
      dailyParticipationCounts.length > 0
        ? dailyParticipationCounts.reduce((sum, count) => sum + count, 0) /
          dailyParticipationCounts.length
        : 0;

    const averageParticipationRate =
      totalMembers > 0 ? (averageParticipation / totalMembers) * 100 : 0;

    return createResponse({
      date: targetDate.toISODate(),
      entries: processedEntries,
      averageParticipation: Math.round(averageParticipation * 100) / 100,
      averageParticipationRate:
        Math.round(averageParticipationRate * 100) / 100,
      stats,
    });
  } catch (error) {
    console.error('Error fetching mood entries for date:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
