import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getDailyAverageWithMovingAverage } from '@/db/team';
import { getUTCTime } from '@/lib/utils';
import { lazy, Suspense } from 'react';
const VoteChart = lazy(() => import('@/components/vote-chart'));

export async function Chart({ teamId, day }: { teamId: string; day: string }) {
  const dateTime = getUTCTime(day);
  const data = await getDailyAverageWithMovingAverage(
    teamId,
    dateTime.minus({ days: 10 }).toJSDate(),
    dateTime.endOf('day').toJSDate(),
    7,
  );
  const finalData = data.map((point) => {
    const dayWithTimeZone = getUTCTime(point.day);
    return {
      ...point,
      votingId: point.day,
      day: dayWithTimeZone.toISO() || '',
    };
  });

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <VoteChart
        data={finalData}
        teamId={teamId}
        selectedVotingId={finalData.at(-1)?.votingId}
      />
    </Suspense>
  );
}
