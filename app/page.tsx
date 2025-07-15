import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import PageHeader from '@/components/layout/page-header';
import { db } from '@/db';
import { teamMembers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NoTeams } from '@/components/no-teams';

export default async function Home() {
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

  if (!userTeams.length) {
    return (
      <div className={`min-h-screen bg-white`}>
        <PageHeader
          user={session.user}
          userTeams={userTeams}
        />
        <NoTeams />
      </div>
    );
  }

  redirect(`/team/${userTeams[0].team.id}`);
}
