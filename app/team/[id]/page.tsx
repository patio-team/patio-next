import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getLastValidDate } from '@/lib/utils';
import { getUserTeam } from '@/db/team';

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

  const { id } = await params;
  const userTeam = await getUserTeam(session.user.id, id);

  if (!userTeam) {
    redirect('/');
  }

  const lastValidDate = getLastValidDate(userTeam.team.pollDays);
  const formattedLastValidDate = lastValidDate.toFormat('yyyy-MM-dd');

  redirect(`/team/${userTeam.team.id}/${formattedLastValidDate}`);
}
