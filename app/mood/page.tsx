import { redirect } from 'next/navigation';
import MoodForm from './form';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getMoodEntries } from '@/db/mood-entries';
import { getDateInTimezone } from '@/lib/utils';

export const dynamic = 'force-dynamic';

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
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">Missing date or team parameters.</p>
      </div>
    );
  }

  const targetDate = getDateInTimezone(dateParam);

  const entries = await getMoodEntries(
    targetDate.toJSDate(),
    targetDate.endOf('day').toJSDate(),
    teamParam,
  );

  const currentEntry = entries.find(
    (entry) => entry.userId === session.user.id,
  );

  return (
    <MoodForm
      params={{
        date: dateParam,
        teamId: teamParam,
        currentEntry,
      }}
    />
  );
}
