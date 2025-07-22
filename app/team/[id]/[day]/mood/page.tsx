import { redirect } from 'next/navigation';
import MoodForm from './form';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getMoodEntryByUser } from '@/db/mood-entries';
import { getUTCTime } from '@/lib/utils';

export default async function MoodPage({
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

  const { id, day } = await params;

  const targetDate = getUTCTime(day);

  const entry = await getMoodEntryByUser(
    session.user.id,
    targetDate.toJSDate(),
    id,
  );

  const currentEntry = entry;

  return (
    <MoodForm
      params={{
        date: day,
        teamId: id,
        currentEntry,
      }}
    />
  );
}
