import { moodEntries, teamMembers } from './schema';
import { db } from '.';
import { eq, and, gte, lt, count, desc, lte } from 'drizzle-orm';
import { getMoodEntries } from './mood-entries';
import { DateTime } from 'luxon';

export async function totalMembersCount(teamId: string) {
  const result = await db
    .select({ count: count() })
    .from(teamMembers)
    .where(eq(teamMembers.teamId, teamId));

  return result[0]?.count || 0;
}

export async function participationStats(
  teamId: string,
  startOfRange: Date,
  endOfRange: Date,
) {
  const totalMembers = await totalMembersCount(teamId);

  const historicalEntries = await db.query.moodEntries.findMany({
    where: and(
      eq(moodEntries.teamId, teamId),
      gte(moodEntries.entryDate, startOfRange),
      lt(moodEntries.entryDate, endOfRange),
    ),
    columns: {
      userId: true,
      entryDate: true,
      rating: true,
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

  const averageRating =
    historicalEntries.length > 0
      ? historicalEntries.reduce(
          (sum, entry) => sum + Number(entry.rating),
          0,
        ) / historicalEntries.length || 0
      : 0;

  return {
    totalMembers,
    averageRating,
    averageParticipation: Math.round(averageParticipation * 100) / 100,
    totalDays: dailyParticipationCounts.length,
    dailyParticipationCounts,
  };
}

export async function dateScore(
  entries: Awaited<ReturnType<typeof getMoodEntries>>,
) {
  const averageScore =
    entries.reduce((sum, entry) => sum + Number(entry.rating), 0) /
      entries.length || 0;

  const scoreVotes = entries.reduce(
    (acc, entry) => {
      acc[entry.rating] = (acc[entry.rating] || 0) + 1;
      return acc;
    },
    {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    } as Record<string, number>,
  );

  const totalVotes = entries.length;

  return {
    averageScore: Math.round(averageScore * 10) / 10,
    scoreVotes,
    totalVotes,
  };
}

export async function getTeamMembersWithLastVote(teamId: string) {
  const members = await db.query.teamMembers.findMany({
    where: eq(teamMembers.teamId, teamId),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  // Get last vote for each member
  const membersWithLastVote = await Promise.all(
    members.map(async (member) => {
      const lastVote = await db.query.moodEntries.findFirst({
        where: and(
          eq(moodEntries.userId, member.userId),
          eq(moodEntries.teamId, teamId),
        ),
        orderBy: desc(moodEntries.entryDate),
      });

      return {
        ...member,
        lastVote: lastVote
          ? {
              date: lastVote.entryDate,
              rating: lastVote.rating,
              comment: lastVote.comment,
            }
          : null,
      };
    }),
  );

  return membersWithLastVote;
}

export async function getDailyAverageWithMovingAverage(
  teamId: string,
  startOfRange: Date,
  endOfRange: Date,
  movingAverageDays: number = 7,
) {
  const historicalEntries = await db.query.moodEntries.findMany({
    where: and(
      eq(moodEntries.teamId, teamId),
      gte(moodEntries.entryDate, startOfRange),
      lte(moodEntries.entryDate, endOfRange),
    ),
    columns: {
      entryDate: true,
      rating: true,
    },
    orderBy: desc(moodEntries.entryDate),
  });

  // Group entries by date and calculate daily averages
  const dailyData: Record<string, { ratings: number[]; average: number }> = {};

  historicalEntries.forEach((entry) => {
    const dateKey = DateTime.fromJSDate(entry.entryDate).toFormat('yyyy-MM-dd');
    if (!dailyData[dateKey]) {
      dailyData[dateKey] = { ratings: [], average: 0 };
    }
    dailyData[dateKey].ratings.push(Number(entry.rating));
  });

  // Calculate daily averages
  Object.keys(dailyData).forEach((dateKey) => {
    const ratings = dailyData[dateKey].ratings;
    dailyData[dateKey].average =
      ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  });

  // Sort dates and create final result with moving averages
  const sortedDates = Object.keys(dailyData).sort();
  const result = sortedDates.map((date, index) => {
    // Calculate moving average using the specified number of days
    const startIndex = Math.max(0, index - movingAverageDays + 1);
    const relevantDates = sortedDates.slice(startIndex, index + 1);

    const movingAverageSum = relevantDates.reduce(
      (sum, d) => sum + dailyData[d].average,
      0,
    );
    const movingAverage = movingAverageSum / relevantDates.length;

    return {
      day: date,
      average: Math.round(dailyData[date].average * 10) / 10,
      movingAverage: Math.round(movingAverage * 10) / 10,
    };
  });

  return result;
}
