import { eq } from 'drizzle-orm/sql/expressions/conditions';
import { teamMembers } from './schema';
import { db } from '.';
import { count } from 'drizzle-orm';

export async function totalMembersCount(teamId: string) {
  const result = await db
    .select({ count: count() })
    .from(teamMembers)
    .where(eq(teamMembers.teamId, teamId));

  return result[0]?.count || 0;
}
