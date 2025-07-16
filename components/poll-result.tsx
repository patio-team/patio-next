import { getMoodEntries } from '@/db/mood-entries';
import { DateTime } from 'luxon';
import { Mood, Smile } from './smile';
import { dateScore, participationStats } from '@/db/team';
import { getDateInTimezone } from '@/lib/utils';

interface PollResultsProps {
  teamId: string;
  date: string;
  results: Awaited<ReturnType<typeof getMoodEntries>>;
}

const rankingToColor: Record<number, string> = {
  1: '#fe346e',
  2: '#ff7473',
  3: '#ffc952',
  4: '#98ddab',
  5: '#3fe3d2',
};

export default async function PollResults({
  teamId,
  date,
  results,
}: PollResultsProps) {
  const maxValue = Math.max(...results.map((r) => r.rating));

  const parsedStartDate = getDateInTimezone(date).minus({ days: 7 });
  const parsedEndDate = getDateInTimezone(date);

  const stats = await participationStats(
    teamId,
    parsedStartDate.toJSDate(),
    parsedEndDate.toJSDate(),
  );

  const dayScore = await dateScore(DateTime.fromISO(date).toJSDate(), teamId);
  const formattedDate = DateTime.fromISO(date).toFormat('cccc, MMMM d, yyyy');

  return (
    <div className="relative max-w-[644px] bg-white p-4">
      {/* Header */}
      <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <h2 className="font-merriweather text-2xl font-normal text-[#34314C]">
          Last poll result
        </h2>
        <span className="font-lato text-base font-medium text-[#948FB7]">
          {formattedDate}
        </span>
      </div>

      {/* Score Section with Participation */}
      <div className="mb-6 flex flex-col items-start gap-6 lg:flex-row lg:items-start">
        {/* Left side - Score */}
        <div className="relative flex flex-col items-start">
          <div className="relative mb-4 flex items-center">
            {/* Green circle positioned behind the text */}
            <div className="absolute top-5 left-6 h-20 w-20 rounded-full bg-[#98DDAB]"></div>
            {/* Large score text */}
            <div className="relative z-10">
              <span className="font-lato text-[96px] leading-[42px] font-light text-[#34314C]">
                {dayScore.averageScore.toFixed(1).replace('.', ',')}
              </span>
            </div>
          </div>
          <div className="font-lato mt-2 text-base text-[#948FB7]">
            {Math.abs(stats.averageParticipation)}%{' '}
            {stats.averageParticipation < 0 ? 'below' : 'above'} average
          </div>
        </div>

        {/* Right side - Participation */}
        <div className="ml-auto flex flex-col items-start">
          <div className="font-merriweather mb-2 text-base text-[#948FB7]">
            Participation
          </div>
          <div className="font-lato mb-1 text-[32px] leading-[36px] font-light text-[#34314C]">
            {results.length}/{stats.totalMembers}
          </div>
          <div className="font-lato text-base text-[#948FB7]">
            Usually {stats.totalMembers} people participate
          </div>
        </div>
      </div>

      {/* Results Chart */}
      <div className="relative">
        {/* Background grid lines */}
        <div className="absolute top-0 left-[90px] flex h-[301px] w-[538px] overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`border-r border-[#F3F3F7] ${i === 0 ? 'w-0' : i === 7 ? 'w-[1px]' : 'flex-1'}`}></div>
          ))}
        </div>

        <div className="space-y-4">
          {Object.entries(dayScore.scoreVotes).map(([score, total], index) => (
            <div
              key={index}
              className="flex items-center">
              {/* Emoji */}
              <div>
                <Smile
                  mood={`mood${score}` as Mood}
                  size="small"
                />
              </div>

              {/* Label */}
              <div className="mr-6 w-[90px] flex-shrink-0">
                <span className="font-lato text-sm text-[#191825]">label</span>
              </div>

              {/* Bar Chart */}
              <div className="relative flex flex-1 items-center">
                {Number(score) > 0 && (
                  <>
                    <div
                      className="h-[18px] rounded-r-full opacity-50"
                      style={{
                        backgroundColor: rankingToColor[Number(score)],
                        width: `${(total / maxValue) * 100}%`,
                        minWidth: '38px',
                      }}></div>
                    <span className="font-lato absolute right-[-30px] text-base text-[#191825]">
                      {total}
                    </span>
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
