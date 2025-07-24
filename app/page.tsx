import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import PageHeader from '@/components/layout/page-header';
import { db } from '@/db';
import { teamMembers, moodEntries, teams, PollDaysType } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { NoTeams } from '@/components/no-teams';
import { getLastValidDate } from '@/lib/utils';

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  let targetTeam: {
    pollDays: PollDaysType;
    id: string;
  } | null = null;

  // Find the team where the user last voted (made a mood entry)
  const lastVotedEntry = await db
    .select({
      teamId: moodEntries.teamId,
      pollDays: teams.pollDays,
    })
    .from(moodEntries)
    .where(eq(moodEntries.userId, session.user.id))
    .leftJoin(teams, eq(moodEntries.teamId, teams.id))
    .orderBy(desc(moodEntries.createdAt))
    .limit(1);

  if (lastVotedEntry.length && lastVotedEntry[0].pollDays) {
    targetTeam = {
      pollDays: lastVotedEntry[0].pollDays,
      id: lastVotedEntry[0].teamId,
    };
  } else {
    const userTeams = await db.query.teamMembers.findMany({
      where: eq(teamMembers.userId, session.user.id),
      with: {
        team: true,
      },
      limit: 1,
      orderBy: desc(teamMembers.joinedAt),
    });

    if (userTeams.length) {
      targetTeam = {
        pollDays: userTeams[0].team.pollDays,
        id: userTeams[0].team.id,
      };
    } else {
      return (
        <div>
          <PageHeader
            user={session.user}
            userTeams={userTeams}
            lastValidDate=""
          />
          <NoTeams />
        </div>
      );
    }
  }

  const date = getLastValidDate(targetTeam.pollDays).toFormat('yyyy-MM-dd');
  redirect(`/team/${targetTeam.id}/${date}`);
}
