import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import PageHeader from '@/components/layout/page-header';
import { db } from '@/db';
import { teamMembers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import {
  getDateInTimezone,
  getDayOfWeek,
  getLastValidDate,
  todayDate,
} from '@/lib/utils';

import MoodEntries from '../mood-entries';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading';
import VoteChart from '@/components/vote-chart';

function LoadingSection() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}

export const dynamic = 'force-dynamic';

export default async function Home({
  params,
}: {
  params: Promise<{ id: string; day: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  const userTeams = await db.query.teamMembers.findMany({
    where: eq(teamMembers.userId, session.user.id),
    with: {
      team: true,
    },
  });

  const { id, day } = await params;

  const userTeam = userTeams.find((tm) => tm.team.id === id);

  if (!userTeam) {
    redirect('/');
  }

  const targetDayOfTheWeek = getDayOfWeek(getDateInTimezone(day));

  if (
    userTeam.team.pollDays?.[targetDayOfTheWeek] === false ||
    day > todayDate()
  ) {
    const lastValidDate = getLastValidDate(userTeam.team.pollDays);
    redirect(
      `/team/${userTeam.team.id}/${lastValidDate.toFormat('yyyy-MM-dd')}`,
    );
  }

  const lastValidDate = getLastValidDate(userTeam.team.pollDays);
  const formattedLastValidDate = lastValidDate.toFormat('yyyy-MM-dd');

  return (
    <div>
      <PageHeader
        user={session.user}
        userTeams={userTeams}
        currentTeamId={userTeam.team.id}
        lastValidDate={formattedLastValidDate}
      />
      <Suspense fallback={<LoadingSection />}>
        <MoodEntries
          userTeam={userTeam}
          date={day}
          userId={session.user.id}
        />
      </Suspense>
    </div>
  );
}
