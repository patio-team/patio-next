import { NextRequest } from 'next/server';
import { db } from '@/db';
import { moodEntries, teamMembers } from '@/db/schema';
import {
  createResponse,
  createErrorResponse,
  getDateInTimezone,
  formatDateForDB,
} from '@/lib/utils';
import { eq, and, gte, lt, count } from 'drizzle-orm';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

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

    // Parse and validate the dates
    let startDateObj, endDateObj;
    try {
      startDateObj = getDateInTimezone(startDate);
      endDateObj = getDateInTimezone(endDate);
    } catch {
      return createErrorResponse('Invalid date format. Use YYYY-MM-DD', 400);
    }

    // Validate date range
    if (startDateObj >= endDateObj) {
      return createErrorResponse('Start date must be before end date', 400);
    }

    // Get total team members count
    const totalMembersResult = await db
      .select({ count: count() })
      .from(teamMembers)
      .where(eq(teamMembers.teamId, teamId));

    const totalMembers = totalMembersResult[0]?.count || 0;

    // Get historical participation data for the date range
    const startOfRange = formatDateForDB(startDateObj);
    const endOfRange = formatDateForDB(endDateObj.plus({ days: 1 }));

    const historicalEntries = await db.query.moodEntries.findMany({
      where: and(
        eq(moodEntries.teamId, teamId),
        gte(moodEntries.entryDate, startOfRange),
        lt(moodEntries.entryDate, endOfRange),
      ),
      columns: {
        userId: true,
        entryDate: true,
      },
    });

    // Calculate daily participation within the date range
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
      teamId,
      startDate: startDateObj.toISODate(),
      endDate: endDateObj.toISODate(),
      totalMembers,
      averageParticipation: Math.round(averageParticipation * 100) / 100,
      averageParticipationRate:
        Math.round(averageParticipationRate * 100) / 100,
      totalDays: dailyParticipationCounts.length,
      dailyParticipationCounts,
    });
  } catch (error) {
    console.error('Error fetching participation stats:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
