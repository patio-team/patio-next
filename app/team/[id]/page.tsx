import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import PageHeader from '@/components/layout/page-header';
import { db } from '@/db';
import { teamMembers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { todayDate } from '@/lib/utils';

import MoodEntries from './mood-entries';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading';
// import VoteChart from '@/components/vote-chart';

function LoadingSection() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}

export default async function Home({
  params,
}: {
  params: Promise<{ id: string }>;
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

  const id = (await params).id;

  const userTeam = userTeams.find((tm) => tm.team.id === id);

  if (!userTeam) {
    redirect('/');
  }

  // const exampleData = [
  //   {
  //     votingId: 'v1',
  //     createdAt: '2025-06-01T12:00:00.000Z',
  //     average: 2.3,
  //     movingAverage: 2.1,
  //   },
  //   {
  //     votingId: 'v2',
  //     createdAt: '2025-06-05T12:00:00.000Z',
  //     average: 3.4,
  //     movingAverage: 2.8,
  //   },
  //   {
  //     votingId: 'v3',
  //     createdAt: '2025-06-10T12:00:00.000Z',
  //     average: 4.1,
  //     movingAverage: 3.2,
  //   },
  //   {
  //     votingId: 'v4',
  //     createdAt: '2025-06-15T12:00:00.000Z',
  //     average: 1.7,
  //     movingAverage: 2.4,
  //   },
  //   {
  //     votingId: 'v5',
  //     createdAt: '2025-06-20T12:00:00.000Z',
  //     average: 3.9,
  //     movingAverage: 3.4,
  //   },
  // ];

  const date = todayDate();

  return (
    <div className={`min-h-screen bg-white`}>
      <PageHeader
        user={session.user}
        userTeams={userTeams}
        currentTeamId={userTeam.team.id}
      />

      {/* <VoteChart
        data={exampleData}
        selectedVotingId="v3"
      /> */}

      <Suspense fallback={<LoadingSection />}>
        <MoodEntries
          userTeam={userTeam}
          date={date}
          userId={session.user.id}
        />
      </Suspense>
    </div>
  );
}
