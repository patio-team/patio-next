import { DateTime } from 'luxon';
import { Mood, Smile } from './smile';
import { dateScore, participationStats } from '@/db/team';
import { Button } from './ui/button';
import Link from 'next/link';
import { Team } from '@/db/schema';
import type { getMoodEntries } from '@/db/mood-entries';
import { getUTCTime } from '@/lib/utils';

interface PollResultsProps {
  userHasVoted: boolean;
  teamId: string;
  date: string;
  pollDays: Team['pollDays'];
  entries: Awaited<ReturnType<typeof getMoodEntries>>;
}

const rankingToColor: Record<number, string> = {
  1: '#fe346e',
  2: '#ff7473',
  3: '#ffc952',
  4: '#98ddab',
  5: '#3fe3d2',
};

const rankingLabels: Record<number, string> = {
  1: 'Very Bad',
  2: 'Bad',
  3: 'Neutral',
  4: 'Good',
  5: 'Very Good',
};

export default async function PollResults({
  userHasVoted,
  teamId,
  date,
  entries,
}: PollResultsProps) {
  const dateWithTimeZone = getUTCTime(date);

  const maxValue = Math.max(...entries.map((r) => Number(r.rating)));

  const parsedStartDate = dateWithTimeZone.minus({ days: 7 });
  const parsedEndDate = dateWithTimeZone.endOf('day');

  const stats = await participationStats(
    teamId,
    parsedStartDate.toJSDate(),
    parsedEndDate.toJSDate(),
  );

  const dayScore = await dateScore(entries);
  const formattedDate = getUTCTime(date).toFormat('cccc, MMMM d, yyyy');
  const scoreVotes = Object.entries(dayScore.scoreVotes)
    .toSorted(([a], [b]) => {
      return Number(b) - Number(a);
    })
    .map(([score, total]) => {
      return {
        mood: Number(score),
        total,
      };
    });

  const percentageHistoricalAverage =
    ((dayScore.averageScore - stats.averageRating) / stats.averageRating) * 100;

  return (
    <div className="relative max-w-[644px] bg-white p-4">
      {/* Score Section with Participation */}
      <div className="mb-6 flex flex-col items-start gap-6 lg:flex-row lg:items-start">
        {/* Left side - Score */}
        <div className="relative flex flex-col items-start">
          <h2 className="font-merriweather text-2xl font-normal text-[#34314C]">
            Last poll result
          </h2>
          <div className="relative mt-10 mb-4 flex items-center">
            {/* Green circle positioned behind the text */}
            <div className="absolute top-1/2 left-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-[#98DDAB]"></div>
            {/* Large score text */}
            <div className="relative z-10">
              <span className="text-[96px] leading-[42px] font-light text-[#34314C]">
                {dayScore.averageScore.toFixed(1).replace('.', ',')}
              </span>
            </div>
          </div>

          {!!entries.length && (
            <div className="mt-2 text-base text-[#948FB7]">
              {Math.round(percentageHistoricalAverage)}%{' '}
              {percentageHistoricalAverage < 0 ? 'below' : 'above'} average
            </div>
          )}
        </div>

        {/* Right side - Participation */}
        <div className="ml-auto flex flex-col items-start">
          <div className="text-base font-medium text-[#948FB7]">
            {formattedDate}
          </div>

          <div className="font-merriweather mt-8 mb-2 text-base text-[#948FB7]">
            Participation
          </div>
          <div className="mb-1 text-[32px] leading-[36px] font-light text-[#34314C]">
            {entries.length}/{stats.totalMembers}
          </div>
          <div className="text-base text-[#948FB7]">
            Usually {stats.totalMembers} people participate
          </div>

          {!userHasVoted && (
            <div className="text-primary mt-3">
              You haven&apos;t participated yet
            </div>
          )}

          {/* Button to share mood */}

          <Button
            className="mt-4"
            asChild>
            <Link
              className="text-center"
              href={`/team/${teamId}/${date}/mood`}>
              {userHasVoted ? 'Edit your mood' : 'Share your mood'}
            </Link>
          </Button>
        </div>
      </div>

      {/* Results Chart */}
      <div className="relative">
        {/* Background grid lines */}
        <div className="absolute top-5 right-0 z-0 flex h-[301px] w-[538px] overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`border-r border-[#F3F3F7] ${i === 0 ? 'w-0' : i === 7 ? 'w-[1px]' : 'flex-1'}`}></div>
          ))}
        </div>

        <div className="relative z-10 space-y-4">
          {scoreVotes.map((scoreVote) => (
            <div
              key={scoreVote.mood}
              className="flex min-h-[50px] items-center">
              {/* Emoji */}
              <div className="h-full self-end">
                <Smile
                  mood={`mood${scoreVote.mood}` as Mood}
                  size="small"
                />
              </div>

              {/* Bar Chart */}
              <div className="z-10 flex w-full flex-col pl-4">
                {scoreVote.total > 0 && (
                  <>
                    <div>{rankingLabels[scoreVote.mood]}</div>
                    <div className="relative flex flex-1 items-center">
                      <div
                        className="h-[18px] rounded-r-full opacity-50"
                        style={{
                          backgroundColor: rankingToColor[scoreVote.mood],
                          width: `${(scoreVote.total / maxValue) * 100}%`,
                          minWidth: '38px',
                        }}></div>
                      <div className="ml-4 text-[#191825]">
                        {scoreVote.total}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
