'use client';

import { redirect, useSearchParams } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { DateTime } from 'luxon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { Mood, Smile } from '@/components/smile';
import { useAuth } from '@/lib/hooks/use-auth';
import { apiClient } from '@/lib/api-client';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/loading';

export default function MemberProfilePage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const params = useParams<{ id: string; memberId: string }>();
  const searchParams = useSearchParams();
  const date = searchParams.get('date');
  const dateParam = date ? `/${date}` : '';

  const teamId = params.id;
  const memberId = params.memberId;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      redirect('/login');
    }
  }, [authLoading, isAuthenticated]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['member-data', teamId, memberId],
    queryFn: ({ pageParam }) =>
      apiClient.getMemberData(teamId, memberId, pageParam, 20),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.nextCursor : undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!teamId && !!memberId && isAuthenticated,
  });

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Handle error or no data
  if (isError || !data?.pages[0]) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#F8F9FF] to-[#E8F2FF]">
        <div className="max-w-md rounded-xl bg-white p-8 text-center shadow-sm">
          <div className="mb-4 text-4xl">⚠️</div>
          <h2 className="font-merriweather text-primary mb-2 text-xl">
            Member Not Found
          </h2>
          <p className="mb-4 text-[#948FB7]">
            The member you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have permission to view their profile.
          </p>
          <Link
            href={`/team/${teamId}${dateParam}`}
            className="text-[#3FA2F7] underline hover:text-[#2563eb]">
            Go back to teams
          </Link>
        </div>
      </div>
    );
  }

  const firstPage = data.pages[0];
  const member = firstPage.member;
  const team = firstPage.team;

  // Flatten all mood entries from all pages
  const allMoodEntries = data.pages.flatMap((page) => page.moodEntries);

  const formatDateForDisplay = (date: string) => {
    return DateTime.fromISO(date).toFormat('EEEE, MMMM dd, yyyy');
  };

  const formatRelativeDate = (date: string) => {
    return DateTime.fromISO(date).toRelative();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FF] to-[#E8F2FF]">
      <div className="px-4 py-8 md:px-16">
        {/* Back Button */}
        <Link
          href={`/team/${teamId}${dateParam}`}
          className="mb-6 inline-flex items-center text-sm text-[#3FA2F7] hover:text-[#2563eb]">
          <svg
            className="mr-1 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to {team.name}
        </Link>

        {/* Header */}
        <div className="mb-8 rounded-xl bg-white p-8 shadow-sm">
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={member.user?.image || ''}
                  alt={member.user?.name || ''}
                />
                <AvatarFallback>
                  <User className="h-4 w-16" />
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Member Info */}
            <div className="flex-1">
              <h1 className="font-merriweather text-primary text-2xl font-normal md:text-3xl">
                {member.user.name}
              </h1>
              <p className="mt-1 text-[#948FB7]">{member.user.email}</p>
              <div className="mt-3 flex items-center space-x-4">
                <span className="text-sm text-[#948FB7] capitalize">
                  {member.role} • Joined{' '}
                  {DateTime.fromISO(member.joinedAt).toFormat('MMMM yyyy')}
                </span>
                {allMoodEntries.length > 0 && (
                  <span className="text-sm text-[#948FB7]">
                    {allMoodEntries.length} mood entr
                    {allMoodEntries.length === 1 ? 'y' : 'ies'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mood Entries */}
        <div className="rounded-xl bg-white p-8 shadow-sm">
          <h2 className="font-merriweather text-primary mb-6 text-xl font-normal">
            Mood History
          </h2>

          {allMoodEntries.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mb-4 text-4xl">📊</div>
              <p className="text-[#948FB7]">
                {user?.id === memberId
                  ? "You haven't submitted any mood entries yet."
                  : `${member.user.name} hasn&apos;t submitted any mood entries yet.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {allMoodEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start space-x-4 rounded-lg border border-gray-100 p-4 transition-colors hover:bg-gray-50">
                  {/* Mood Circle and Emoji */}
                  <div className="flex flex-shrink-0 flex-col items-center space-y-2">
                    <Smile
                      mood={`mood${entry.rating}` as Mood}
                      size="small"
                    />
                  </div>

                  {/* Entry Details */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">
                        {formatDateForDisplay(entry.entryDate)}
                      </h3>
                      <span className="text-sm text-[#948FB7]">
                        {formatRelativeDate(entry.entryDate)}
                      </span>
                    </div>

                    {entry.comment && (
                      <div
                        className="mt-2 text-sm text-gray-700"
                        dangerouslySetInnerHTML={{
                          __html: entry.comment,
                        }}></div>
                    )}

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-[#948FB7] capitalize">
                        {entry.visibility} entry
                      </span>
                      <span className="text-xs text-[#948FB7]">
                        Rating: {entry.rating}/5
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Load More Button */}
              {hasNextPage && (
                <div className="mt-6 text-center">
                  <Button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    variant="secondary"
                    className="min-w-40">
                    {isFetchingNextPage ? (
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                        <span>Loading more...</span>
                      </div>
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
