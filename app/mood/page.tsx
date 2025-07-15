import { redirect } from 'next/navigation';
import MoodForm from './form';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export default async function MoodPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; team?: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  const dateParam = (await searchParams).date;
  const teamParam = (await searchParams).team;

  if (!dateParam || !teamParam) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Missing date or team parameters.</p>
      </div>
    );
  }

  return (
    <MoodForm
      params={{ user: session.user, date: dateParam, teamId: teamParam }}
    />
  );
}
