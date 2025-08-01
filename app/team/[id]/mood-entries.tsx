import { TeamMemberWithTeam } from '@/db/schema';
import Link from 'next/link';
import { getLastValidDate, getPollDaysString, getUTCTime } from '@/lib/utils';
import { DayResult } from '@/components/day-result';
import { getMoodEntries } from '@/db/mood-entries';
import PollResults from '@/components/poll-result';
import LeaveTeamButton from './leave-team-button';
import { TeamMembersModal } from '@/components/team-members-modal';
import { Chart } from './chart';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ArrowRight } from 'lucide-react';
export default async function MoodEntries({
  userTeam,
  date,
  userId,
}: {
  userTeam: TeamMemberWithTeam;
  date: string;
  userId: string;
}) {
  const dateTime = getUTCTime(date);
  const jsDate = dateTime.toJSDate();
  const entries = await getMoodEntries(
    jsDate,
    dateTime.endOf('day').toJSDate(),
    userTeam.team.id,
    userTeam.role === 'admin' ? undefined : 'public',
  );

  const userVote = entries.find((entry) => entry.user?.id === userId);

  const lastValidDate = getLastValidDate(userTeam.team.pollDays);

  return (
    <>
      {/* Main Content */}
      <div className="px-4 py-8 md:px-16">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          {/* Left Section - Chart and Header */}
          <div className="space-y-6">
            {/* Title and Settings */}
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
              <div>
                <h1 className="font-merriweather text-primary text-2xl font-normal md:text-3xl">
                  {userTeam.team.name}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {/* Polls on Mondays, Tuesdays, Wednesdays, Thursdays and Fridays  */}
                  Polls on {getPollDaysString(userTeam.team.pollDays)}
                </p>
                <div className="mt-4 flex gap-6">
                  <TeamMembersModal
                    teamId={userTeam.team.id}
                    date={date}>
                    <button className="text-link hover:text-link-hover cursor-pointer text-sm font-medium transition-colors">
                      See members
                    </button>
                  </TeamMembersModal>
                  <LeaveTeamButton teamId={userTeam.team.id} />
                </div>
                <p className="mt-4 text-sm text-gray-500">
                  {/* Polls on Mondays, Tuesdays, Wednesdays, Thursdays and Fridays  */}
                  Polls on {getPollDaysString(userTeam.team.pollDays)}
                </p>
              </div>
              {userTeam.role === 'admin' && (
                <Link
                  href={`/team/${userTeam.team.id}/settings`}
                  className="text-primary flex items-center gap-2 text-sm">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8.00001 6.66659C7.26363 6.66659 6.66668 7.26354 6.66668 7.99992C6.66668 8.7363 7.26363 9.33325 8.00001 9.33325C8.73639 9.33325 9.33334 8.7363 9.33334 7.99992C9.33334 7.26354 8.73639 6.66659 8.00001 6.66659ZM5.33334 7.99992C5.33334 6.52716 6.52725 5.33325 8.00001 5.33325C9.47277 5.33325 10.6667 6.52716 10.6667 7.99992C10.6667 9.47268 9.47277 10.6666 8.00001 10.6666C6.52725 10.6666 5.33334 9.47268 5.33334 7.99992Z"
                      fill="#25282B"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8 1.33333C7.82319 1.33333 7.65362 1.40357 7.5286 1.5286C7.40357 1.65362 7.33333 1.82319 7.33333 2V2.11599C7.33196 2.46053 7.22986 2.79715 7.03963 3.08441C6.84939 3.37167 6.5793 3.59703 6.26262 3.73276C6.20625 3.75692 6.14695 3.77313 6.08641 3.78104C5.79865 3.88181 5.48888 3.90665 5.18733 3.85197C4.84 3.789 4.5195 3.62341 4.26716 3.37658L4.2619 3.37143L4.22193 3.3314C4.16001 3.26942 4.08623 3.21999 4.00529 3.18644C3.92436 3.15289 3.83761 3.13562 3.75 3.13562C3.66239 3.13562 3.57564 3.15289 3.49471 3.18644C3.41377 3.21999 3.34025 3.26916 3.27833 3.33114L3.27781 3.33167C3.21582 3.39358 3.16665 3.46711 3.1331 3.54804C3.09955 3.62897 3.08228 3.71572 3.08228 3.80333C3.08228 3.89094 3.09955 3.97769 3.1331 4.05863C3.16665 4.13956 3.21582 4.21308 3.27781 4.275L3.32327 4.32046C3.57011 4.57281 3.73566 4.89334 3.79864 5.24067C3.86036 5.58109 3.82075 5.93198 3.68497 6.24985C3.56126 6.57422 3.34465 6.85511 3.06203 7.05725C2.7737 7.26348 2.42999 7.37819 2.07559 7.38648L2.06 7.38667H2C1.82319 7.38667 1.65362 7.4569 1.5286 7.58193C1.40357 7.70695 1.33333 7.87652 1.33333 8.05333C1.33333 8.23014 1.40357 8.39971 1.5286 8.52474C1.65362 8.64976 1.82319 8.72 2 8.72H2.11599C2.46053 8.72137 2.79715 8.82347 3.08441 9.01371C3.37067 9.20329 3.59547 9.47215 3.73134 9.78741C3.87272 10.1095 3.91474 10.4665 3.85197 10.8127C3.789 11.16 3.62341 11.4805 3.37658 11.7328L3.37143 11.7381L3.3314 11.7781C3.26942 11.84 3.21999 11.9138 3.18644 11.9947C3.15289 12.0756 3.13562 12.1624 3.13562 12.25C3.13562 12.3376 3.15289 12.4244 3.18644 12.5053C3.21999 12.5862 3.26916 12.6598 3.33114 12.7217L3.33167 12.7222C3.39358 12.7842 3.46711 12.8333 3.54804 12.8669C3.62897 12.9004 3.71572 12.9177 3.80333 12.9177C3.89094 12.9177 3.97769 12.9004 4.05863 12.8669C4.13956 12.8333 4.21309 12.7842 4.275 12.7222L4.32046 12.6767C4.57281 12.4299 4.89334 12.2643 5.24067 12.2014C5.58108 12.1396 5.93197 12.1792 6.24985 12.315C6.57422 12.4387 6.85511 12.6553 7.05725 12.938C7.26348 13.2263 7.37819 13.57 7.38648 13.9244L7.38667 13.94V14C7.38667 14.1768 7.4569 14.3464 7.58193 14.4714C7.70695 14.5964 7.87652 14.6667 8.05333 14.6667C8.23014 14.6667 8.39971 14.5964 8.52474 14.4714C8.64976 14.3464 8.72 14.1768 8.72 14V13.8867L8.72001 13.884C8.72138 13.5395 8.82347 13.2029 9.01371 12.9156C9.2033 12.6293 9.4722 12.4045 9.78749 12.2686C10.1096 12.1273 10.4665 12.0853 10.8127 12.148C11.16 12.211 11.4805 12.3766 11.7328 12.6234L11.7381 12.6286L11.7781 12.6686C11.84 12.7306 11.9138 12.78 11.9947 12.8136C12.0756 12.8471 12.1624 12.8644 12.25 12.8644C12.3376 12.8644 12.4244 12.8471 12.5053 12.8136C12.5862 12.78 12.6598 12.7308 12.7217 12.6689L12.7222 12.6683C12.7842 12.6064 12.8333 12.5329 12.8669 12.452C12.9004 12.371 12.9177 12.2843 12.9177 12.1967C12.9177 12.1091 12.9004 12.0223 12.8669 11.9414C12.8333 11.8604 12.7842 11.7869 12.7222 11.725L12.6767 11.6795C12.4299 11.4272 12.2643 11.1067 12.2014 10.7593C12.1386 10.4132 12.1806 10.0562 12.322 9.73416C12.4578 9.41887 12.6826 9.14997 12.9689 8.96037C13.2562 8.77014 13.5928 8.66805 13.9373 8.66667L13.94 8.66666L14 8.66667C14.1768 8.66667 14.3464 8.59643 14.4714 8.47141C14.5964 8.34638 14.6667 8.17681 14.6667 8C14.6667 7.82319 14.5964 7.65362 14.4714 7.5286C14.3464 7.40357 14.1768 7.33333 14 7.33333H13.8867L13.884 7.33333C13.5395 7.33195 13.2029 7.22986 12.9156 7.03963C12.6283 6.84939 12.403 6.5793 12.2672 6.26262C12.2431 6.20625 12.2269 6.14695 12.219 6.08641C12.1182 5.79865 12.0933 5.48888 12.148 5.18733C12.211 4.84 12.3766 4.5195 12.6234 4.26716L12.6286 4.2619L12.6686 4.22193C12.7306 4.16001 12.78 4.08622 12.8136 4.00529C12.8471 3.92436 12.8644 3.83761 12.8644 3.75C12.8644 3.66239 12.8471 3.57564 12.8136 3.49471C12.78 3.41378 12.7308 3.34025 12.6689 3.27833L12.6683 3.27781C12.6064 3.21582 12.5329 3.16665 12.452 3.1331C12.371 3.09955 12.2843 3.08228 12.1967 3.08228C12.1091 3.08228 12.0223 3.09955 11.9414 3.1331C11.8604 3.16665 11.7869 3.21583 11.725 3.27781L11.6795 3.32327C11.4272 3.57011 11.1067 3.73566 10.7593 3.79864C10.4132 3.86141 10.0562 3.81939 9.73408 3.67801C9.41882 3.54213 9.14995 3.31734 8.96037 3.03108C8.77014 2.74382 8.66805 2.4072 8.66667 2.06266L8.66667 2.06V2C8.66667 1.82319 8.59643 1.65362 8.47141 1.5286C8.34638 1.40357 8.17681 1.33333 8 1.33333Z"
                      fill="#25282B"
                    />
                  </svg>
                  Team Settings
                </Link>
              )}
            </div>

            {/* Chart Container */}
            <Suspense fallback={<LoadingSpinner />}>
              <div className="pt-4">
                <Chart
                  teamId={userTeam.team.id}
                  day={date}
                />
              </div>
            </Suspense>

            {lastValidDate > dateTime && (
              <div className="flex justify-end">
                <Link
                  href={`/team/${userTeam.team.id}/${lastValidDate.toFormat('yyyy-MM-dd')}`}
                  className="text-link hover:text-link-hover flex items-center gap-2 text-lg transition-colors">
                  Go to last poll
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>

          <Suspense fallback={<LoadingSpinner />}>
            <PollResults
              entries={entries}
              userHasVoted={!!userVote}
              teamId={userTeam.team.id}
              date={date}
              pollDays={userTeam.team.pollDays}
            />
          </Suspense>
        </div>

        {/* Team Member Cards Grid */}
        <div className="mt-12">
          <DayResult
            entries={entries}
            teamId={userTeam.team.id}
          />
        </div>
      </div>
    </>
  );
}
