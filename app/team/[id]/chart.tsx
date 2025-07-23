import VoteChart from '@/components/vote-chart';
import { getDailyAverageWithMovingAverage } from '@/db/team';
import { getUTCTime } from '@/lib/utils';

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
    <VoteChart
      data={finalData}
      teamId={teamId}
      selectedVotingId={finalData.at(-1)?.votingId}
    />
  );
}
