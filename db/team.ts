import { moodEntries, teamMembers } from './schema';
import { db } from '.';
import { eq, and, gte, lt, count } from 'drizzle-orm';
import { getMoodEntries } from './mood-entries';

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
  console.log(startOfRange, endOfRange);

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

  return {
    totalMembers,
    averageParticipation: Math.round(averageParticipation * 100) / 100,
    averageParticipationRate: Math.round(averageParticipationRate * 100) / 100,
    totalDays: dailyParticipationCounts.length,
    dailyParticipationCounts,
  };
}

export async function dateScore(date: Date, teamId: string) {
  const entries = await getMoodEntries(date, date, teamId);

  const averageScore =
    entries.reduce((sum, entry) => sum + entry.rating, 0) / entries.length || 0;

  const scoreVotes = entries.reduce(
    (acc, entry) => {
      acc[entry.rating] = (acc[entry.rating] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const totalVotes = entries.length;

  return {
    averageScore: Math.round(averageScore * 10) / 10,
    scoreVotes,
    totalVotes,
  };
}
