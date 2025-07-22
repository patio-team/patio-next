import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getTeam, getUserTeam } from '@/db/team';
import Settings from './settings';

export default async function SettingsPage({
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

  if (!userTeam || userTeam.role !== 'admin') {
    redirect('/');
  }

  const team = await getTeam(id);

  if (!team) {
    redirect('/');
  }

  return (
    <Settings
      userId={userTeam.userId}
      team={team}
    />
  );
}
