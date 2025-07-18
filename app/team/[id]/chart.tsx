import VoteChart from '@/components/vote-chart';
// import { getDailyAverageWithMovingAverage } from '@/db/team';
// import { getDateInTimezone } from '@/lib/utils';

export async function Chart({ teamId }: { teamId: string; day: string }) {
  // const dayWithTimeZone = getDateInTimezone(day);
  // const data = await getDailyAverageWithMovingAverage(
  //   teamId,
  //   dayWithTimeZone.minus({ days: 7 }).toJSDate(),
  //   dayWithTimeZone.toJSDate(),
  //   7,
  // );

  const exampleData = [
    {
      votingId: 'v1',
      createdAt: '2025-07-01T12:00:00.000Z',
      average: 2.3,
      movingAverage: 2.1,
    },
    {
      votingId: 'v2',
      createdAt: '2025-07-05T12:00:00.000Z',
      average: 3.4,
      movingAverage: 2.8,
    },
    {
      votingId: 'v3',
      createdAt: '2025-07-10T12:00:00.000Z',
      average: 4.1,
      movingAverage: 3.2,
    },
    {
      votingId: 'v4',
      createdAt: '2025-07-15T12:00:00.000Z',
      average: 1.7,
      movingAverage: 2.4,
    },
    {
      votingId: 'v5',
      createdAt: '2025-07-18T12:00:00.000Z',
      average: 3.9,
      movingAverage: 3.4,
    },
  ];

  return (
    <VoteChart
      data={exampleData}
      teamId={teamId}
      selectedVotingId={'v5'}
    />
  );
}
