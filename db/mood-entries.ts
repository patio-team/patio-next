import { formatDateForDB } from '@/lib/utils';
import { db } from '.';
import { DateTime } from 'luxon/src/luxon';
import { and, avg, count, desc, eq, gte, lte } from 'drizzle-orm';
import { moodEntries } from './schema';

export async function getMoodEntries(
  startDate: DateTime,
  endDate: DateTime,
  teamId: string,
  visibility?: 'public' | 'private',
) {
  const startDateForDB = formatDateForDB(startDate);
  const endDateForDB = formatDateForDB(endDate);

  const result = await db
    .select({
      averageRating: avg(moodEntries.rating),
      totalEntries: count(moodEntries.id),
    })
    .from(moodEntries)
    .where(
      and(
        eq(moodEntries.teamId, teamId),
        gte(moodEntries.entryDate, startDateForDB),
        lte(moodEntries.entryDate, endDateForDB),
        visibility ? eq(moodEntries.visibility, visibility) : undefined,
      ),
    )
    .orderBy(moodEntries.entryDate, desc(moodEntries.createdAt));

  return result;
}
