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

  const date = todayDate();

  return (
    <div className={`min-h-screen bg-white`}>
      <PageHeader
        user={session.user}
        userTeams={userTeams}
        currentTeamId={userTeam.team.id}
      />

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
