import { db } from '.';
import { and, desc, eq, gte, lte } from 'drizzle-orm';
import { moodEntries, users } from './schema';

export async function getMoodEntries(
  startDate: Date,
  endDate: Date,
  teamId: string,
  visibility?: 'public' | 'private',
) {
  console.log(startDate, endDate);
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
        gte(moodEntries.entryDate, startDate),
        lte(moodEntries.entryDate, endDate),
        visibility ? eq(moodEntries.visibility, visibility) : undefined,
      ),
    )
    .leftJoin(users, eq(moodEntries.userId, users.id))
    .orderBy(moodEntries.entryDate, desc(moodEntries.createdAt));

  console.log(result);

  return result.map((entry) => ({
    ...entry.mood_entries,
    user: {
      ...entry.user,
    },
  }));
}

export async function getMoodEntryByUser(
  userId: string,
  date: Date,
  teamId: string,
) {
  const result = await db
    .select()
    .from(moodEntries)
    .where(
      and(
        eq(moodEntries.userId, userId),
        eq(moodEntries.teamId, teamId),
        eq(moodEntries.entryDate, date),
      ),
    )
    .limit(1);

  return result[0] || null;
}
