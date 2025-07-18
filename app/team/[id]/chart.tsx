import VoteChart from '@/components/vote-chart';
import { getDailyAverageWithMovingAverage } from '@/db/team';
import { getDateInTimezone } from '@/lib/utils';

export async function Chart({ teamId, day }: { teamId: string; day: string }) {
  const dayWithTimeZone = getDateInTimezone(day);
  const data = await getDailyAverageWithMovingAverage(
    teamId,
    dayWithTimeZone.minus({ days: 7 }).toJSDate(),
    dayWithTimeZone.endOf('day').toJSDate(),
    7,
  );

  const finalData = data.map((point) => {
    const dayWithTimeZone = getDateInTimezone(point.day);
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
