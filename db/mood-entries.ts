import { formatDateForDB } from '@/lib/utils';
import { db } from '.';
import { DateTime } from 'luxon/src/luxon';
import { and, desc, eq, gte, lte } from 'drizzle-orm';
import { moodEntries, users } from './schema';

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
      mood_entries: moodEntries,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
      },
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
    .leftJoin(users, eq(moodEntries.userId, users.id))
    .orderBy(moodEntries.entryDate, desc(moodEntries.createdAt));

  return result.map((entry) => ({
    ...entry.mood_entries,
    user: {
      ...entry.user,
    },
  }));
}
