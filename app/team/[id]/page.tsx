import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { db } from '@/db';
import { teamMembers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getLastValidDate } from '@/lib/utils';

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

  const { id } = await params;

  const userTeam = userTeams.find((tm) => tm.team.id === id);

  if (!userTeam) {
    redirect('/');
  }

  const lastValidDate = getLastValidDate(userTeam.team.pollDays);
  const formattedLastValidDate = lastValidDate.toFormat('yyyy-MM-dd');

  redirect(`/team/${userTeam.team.id}/${formattedLastValidDate}`);
}
